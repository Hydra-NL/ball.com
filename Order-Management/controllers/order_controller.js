const Order = require("../models/order");
const orderService = require("../services/order_service");
const uuid = require("uuid");
const rabbitMQManager = require('./rabbitMQ_publisher');
const jwt = require("jsonwebtoken");
const config = require("../config.json");

module.exports = {

  indexOne(req, res, next) {
    const orderId = req.params.id;

    Order.findAll({ where: { orderId: orderId } })
      .then((orders) => {
        // group products with same orderId together
        const groupedOrders = {};
        orders.forEach((order) => {
          if (!groupedOrders[order.orderId]) groupedOrders[order.orderId] = [];
          groupedOrders[order.orderId].push(order);
        }
        );
        return res.send(groupedOrders);
      }
      )
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  index(req, res, next) {
    const customerId = req.customerId;
    Order.findAll({ where: { customerId: customerId } })
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0) return res.status(404).json({ message: "No orders found" });
        // group products with same orderId together
        const groupedOrders = {};
        orders.forEach((order) => {
          if (!groupedOrders[order.orderId]) groupedOrders[order.orderId] = [];
          groupedOrders[order.orderId].push(order);
        }
        );
        return res.send(groupedOrders);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  validateToken(req, res, next) {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    } else {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          console.log(decoded);
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
    if (!orderProps.products) return res.status(400).json({ message: "No products provided" });
    else {
      const products = [];
      orderProps.products.forEach((product) => {
        // check if product has product_id and quantity
        if (!product.productId || !product.quantity) return res.status(400).json({ message: `Invalid product found in order: ${product}` });
        products.push(product);
        // set orderDate to string of current date
        orderProps.orderDate = new Date().toISOString().slice(0, 10);
        // add the sql query to create the order to the queue
        rabbitMQManager.addMessage(`INSERT INTO Orders (orderId, customerId, productId, quantity, orderDate, orderStatus) VALUES ('${orderId}', ${customerId}, ${product.productId}, ${product.quantity}, '${orderProps.orderDate}', 'Pending')`)
      });
      return res.status(201).json({ message: "Successfully created order", products: products, orderId: orderId });
    }
  },

  // updateOrder
  updateOrder(req, res, next) {
    const orderId = req.params.id;
    const orderProps = req.body;
    Order.findAll({ where: { orderId: orderId } })
      .then((orders) => {
        // if no orders found, return message
        if (orders.length == 0) return res.status(404).json({ message: "No orders found" });
        // check if customer is same as customer in token
        if (orders[0].customerId != req.customerId) return res.status(401).json({ message: "Unauthorized" });
        else {
          rabbitMQManager.addMessage(`UPDATE Orders SET orderStatus = '${orderProps.orderStatus}' WHERE orderId = '${orderId}'`)
          return res.status(200).json({ message: "Successfully updated order" });
        }
      })
      .catch((err) => {
        console.error(err);
        // on error, add message to queue no matter what
        rabbitMQManager.addMessage(`UPDATE Orders SET orderStatus = '${orderProps.orderStatus}' WHERE orderId = '${orderId}'`)
        return res.status(200).json({ message: "Successfully updated order" });
      });
  },

  // deleteOrder
  deleteOrder(req, res, next) {
    const orderId = req.params.id;
    Order.findOne({ where: { orderId: orderId } })
      .then((order) => {
        // if no orders found, return message
        if (order == null) return res.status(404).json({ message: "No order found" });
        // check if customer is same as customer in token
        if (order.customerId != req.customerId) return res.status(401).json({ message: "Unauthorized" });
        else {
          rabbitMQManager.addMessage(`DELETE FROM Orders WHERE orderId = '${orderId}'`)
          return res.status(200).json({ message: "Successfully deleted order", order: order });
        }
      })
      .catch((err) => {
        console.error(err);
        // on error, add message to queue no matter what
        rabbitMQManager.addMessage(`DELETE FROM Orders WHERE orderId = '${orderId}'`)
        return res.status(200).json({ message: "Successfully deleted order" });
      });
  },

  greeting(req, res) {
    return res.send({ Hello: "World!" });
  },
};
