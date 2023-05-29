const Order = require("../models/order");
const orderService = require("../services/order_service");
const uuid = require("uuid");
const rabbitMQManager = require('./rabbitMQ_publisher');
const config = require("../config.json");
const jwt = require("jsonwebtoken");

module.exports = {
  indexOne(req, res, next) {
    const customerId = req.customerId;
    const orderId = req.params.id;

    Order.findOne({ where: { orderId: orderId, customerId: customerId } }).then
      ((order) => {
        if (!order) return res.status(404).json({ message: "Order not found" });
        return res.send(order);
      })
  },

  index(req, res, next) {
    const customerId = req.customerId;
    Order.findAll({ where: { customerId: customerId } })
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0)
          return res.status(404).json({ message: "No orders found" });
        return res.send(orders);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          // check if token has customerId
          if (!decoded.sub)
            return res.status(401).json({ message: "Invalid token" });
          req.customerId = decoded.sub;
          next();
        }
      });
    }
  },

  createOrder(req, res, next) {
    const customerId = req.customerId;
    const orderProps = req.body;
    // check for list of products and quantities like this:
    // [
    //   { productId: 1, quantity: 2 },
    //   { productId: 2, quantity: 1 }
    // ]
    let orderId = uuid.v4();
    if (!orderProps.products)
      return res.status(400).json({ message: "No products provided" });
    else {
      const products = [];
      orderProps.products.forEach((product) => {
        // check if product has product_id and quantity
        if (!product.productId || !product.quantity)
          return res
            .status(400)
            .json({ message: `Invalid product found in order: ${product}` });
        products.push(product);
      });
      orderProps.orderDate = new Date().toISOString().slice(0, 10);
      rabbitMQManager.addMessage(
        `INSERT INTO Orders (orderId, customerId, orderDate, products) VALUES ('${orderId}', '${customerId}', '${orderProps.orderDate}', '${products}')`
      );
      return res
        .status(201)
        .json({
          message: "Successfully created order",
          products: products,
          orderId: orderId,
        });
    }
  },

  // updateOrder
  updateOrder(req, res, next) {
    const orderId = req.params.id;
    const orderProps = req.body;
    Order.findAll({ where: { orderId: orderId } })
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0)
          return res.status(404).json({ message: "No orders found" });
        // check if customer is same as customer in token
        if (orders[0].customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          // update the order
          rabbitMQManager.addMessage(
            `UPDATE Orders SET products = '${orderProps.products}' WHERE orderId = '${orderId}'`
          );
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  // deleteOrder
  deleteOrder(req, res, next) {
    const orderId = req.params.id;
    Order.findOne({ where: { orderId: orderId } })
      .then((order) => {
        // if no orders found, return message
        if (order == null)
          return res.status(404).json({ message: "No order found" });
        // check if customer is same as customer in token
        if (order.customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          rabbitMQManager.addMessage(
            `DELETE FROM Orders WHERE orderId = '${orderId}'`
          );
          return res
            .status(200)
            .json({ message: "Successfully deleted order", order: order });
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  greeting(req, res) {
    return res.send({ Hello: "World!" });
  },
};
