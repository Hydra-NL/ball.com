const Order = require("../models/order");
const orderService = require("../services/order_service");
const uuid = require("uuid");

module.exports = {

  indexOne(req, res, next) {
    const orderId = req.params.id;

    Order.findByPk(orderId)
      .then((order) => {
        // check if customer is same as customer in token
        if (order.customerId != req.customerId) res.status(401).json({ message: "Unauthorized" });
        else res.send(order);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  index(req, res, next) {
    const customerId = req.customerId;
    Order.findAll({ where: { customerId: customerId } })
      .then((orders) => res.send(orders))
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  validateToken(req, res, next) {
    req.customerId = 1;
    next();
    // const token = req.body.token || req.query.token || req.headers["x-access-token"];
    // if (!token) {
    //   res.status(401).json({ message: "No token provided" });
    // } else {
    //   jwt.verify(token, config.secret, (err, decoded) => {
    //     if (err) {
    //       res.status(401).json({ message: "Invalid token" });
    //     } else {
    //       req.customerId = decoded.sub;
    //       next();
    //     }
    //   });
    // }
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
    // // check if there is already an order with this orderId
    // while (orderService.orderExists(orderId)) {
    //   orderId = uuid.v4();
    // }
    if (!orderProps.products) res.status(400).json({ message: "No products provided" });
    else {
      const orders = [];
      orderProps.products.forEach((product) => {
        // check if product has product_id and quantity
        if (!product.productId || !product.quantity) res.status(400).json({ message: `Invalid product found in order: ${product}` });
        Order.create({
          orderId: orderId,
          customerId: customerId,
          productId: product.productId,
          quantity: product.quantity,
        })
          .then((order) => orders.push(order))
          .catch((err) => {
            console.error(err);
            next(err);
          });
      });
      res.status(201).json({ message: "Successfully created order", orders: orders, orderId: orderId });
    }
  },

  // updateOrder
  updateOrder(req, res, next) {
    const orderId = req.params.id;
    const orderProps = req.body;
    Order.findByPk(orderId)
      .then((order) => {
        // check if customer is same as customer in token
        if (order.customerId != req.customerId) res.status(401).json({ message: "Unauthorized" });
        else {
          order.update(orderProps)
            .then((order) => res.status(200).json({ message: "Successfully updated order", order: order }))
            .catch((err) => {
              console.error(err);
              next(err);
            });
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
    Order.findByPk(orderId)
      .then((order) => {
        // check if customer is same as customer in token
        if (order.customerId != req.customerId) res.status(401).json({ message: "Unauthorized" });
        else {
          order.destroy()
            .then(() => res.status(200).json({ message: "Successfully deleted order" }))
            .catch((err) => {
              console.error(err);
              next(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  greeting(req, res) {
    res.send({ Hello: "World!" });
  },
};
