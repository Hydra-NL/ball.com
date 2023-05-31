const Order = require("../models/order");
const orderService = require("../services/order_service");
const uuid = require("uuid");
const rabbitMQManager = require('../rabbitmq/rabbitMQ_publisher');
const eventStoreManager = require("../eventstore/eventstore_manager");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const axios = require("axios");

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

  async createOrder(req, res, next) {
    const customerId = req.customerId;
    let orderId = uuid.v4();
    let totalPrice = 0;
    // make axios get request to http://localhost:3001/api/shopping-cart with authorization header same as this request
    await axios.get("http://customer-management:3001/api/shopping-cart", {
      headers: {
        Authorization: req.headers.authorization,
      },
    }).then((response) => {
      // if shopping cart is null, return message
      if (response.data.shoppingCart == null) return res.status(404).json({ message: "No products found" });
      // if no products found, return message
      if (response.data.shoppingCart.length == 0) return res.status(404).json({ message: "No products found" });
      const products = response.data.shoppingCart;
      // calculate total price
      products.forEach((product) => {
        totalPrice += product.productPrice * product.quantity;
      });

      let dateAndTimeISO = new Date().toISOString();
      eventStoreManager.appendToStream(
        `Order-${orderId}`,
        "OrderCreated",
        {
          orderId,
          customerId,
          orderDate: dateAndTimeISO,
          products,
          totalPrice
        }
      );
      rabbitMQManager.addMessage(
        `INSERT INTO Orders (orderId, customerId, orderDate, products, totalPrice) VALUES ('${orderId}', '${customerId}', '${dateAndTimeISO}', '${JSON.stringify(products)}', ${totalPrice})`
      );
      return res
        .status(201)
        .json({
          message: "Successfully created order",
          products: products,
          orderId: orderId,
          totalPrice: totalPrice,
        });
    }).catch((err) => {
      console.error(err);
      return res.status(404).json({ message: "No products found" });
    });
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
          eventStoreManager.appendToStream(
            `Order-${orderId}`,
            "OrderUpdated",
            {
              orderId,
              products: orderProps.products,
              time: new Date.now()
            }
          );
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
          eventStoreManager.appendToStream(
            `Order-${orderId}`,
            "OrderDeleted",
            {
              orderId,
            }
          );
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
        eventStoreManager.appendToStream(
          `Order-${orderId}`,
          "OrderDeleted",
          {
            orderId,
          }
        );
        rabbitMQManager.addMessage(
          `DELETE FROM Orders WHERE orderId = '${orderId}'`
        );
        return res
          .status(200)
          .json({ message: "Successfully deleted order" });
      });
  },

  greeting(req, res) {
    return res.send({ Hello: "World!" });
  },
};
