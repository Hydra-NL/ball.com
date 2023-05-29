const Customer = require("../models/customer");
const rabbitMQManager = require("./rabbitMQ_publisher");

module.exports = {
  addItem(req, res, next) {
    const customerId = req.body.customerId;
    const productName = req.body.productName;

    Customer.findOne({
      where: { customerId: customerId },
      raw: true,
    })
      .then((customerData) => {
        if (!customerData) {
          return res.status(404).json({ error: "Customer not found" });
        }

        let shoppingCart = customerData.shoppingCart;

        if (shoppingCart.length >= 20) {
          return res.status(400).json({ error: "Shopping cart limit reached" });
        }

        shoppingCart.push(productName);

        const updatedShoppingCart = JSON.stringify(shoppingCart);

        // Update the shoppingCart (JSON datatype) field of the existing customer record
        rabbitMQManager.addMessage(`UPDATE Customers SET shoppingCart = '${updatedShoppingCart}' WHERE customerId = '${customerId}'`);
      })
      .then(() => {
        return res.status(200).json({ message: "Product added to shopping cart" });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  removeItem(req, res, next) {
    const customerId = req.body.customerId;
    const productIndex = req.body.productIndex;

    Customer.findOne({
      where: { customerId: customerId },
    })
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        let shoppingCart = customer.shoppingCart;

        if (!shoppingCart) {
          return res.status(400).json({ error: "Shopping cart is empty" });
        }

        if (shoppingCart.length <= productIndex || productIndex < 0) {
          throw new Error("Invalid product index");
        }

        shoppingCart.splice(productIndex, 1);

        const updatedShoppingCart = JSON.stringify(shoppingCart);

        // Update the shoppingCart (JSON datatype) field of the existing customer record
        rabbitMQManager.addMessage(`UPDATE Customers SET shoppingCart = '${updatedShoppingCart}' WHERE customerId = '${customerId}'`);
      })
      .then(() => {
        res.status(200).json({ message: "Item removed from shopping cart" });
      })
      .catch((err) => {
        console.error(err);
        if (err.message === "Invalid product index") {
          res.status(400).json({ error: "Invalid product index" });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      });
  },

  emptyCart(req, res, next) {
    const customerId = req.params.customerId;

    Customer.findOne({
      where: { customerId: customerId },
    })
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        let shoppingCart = customer.shoppingCart;

        if (!shoppingCart) {
          return res.status(400).json({ error: "Shopping cart is empty" });
        }

        shoppingCart = [];

        const updatedShoppingCart = JSON.stringify(shoppingCart);

        // Update the shoppingCart (JSON datatype) field of the existing customer record
        rabbitMQManager.addMessage(`UPDATE Customers SET shoppingCart = '${updatedShoppingCart}' WHERE customerId = '${customerId}'`);
      })
      .then(() => {
        return res.status(200).json({ message: "Shopping cart emptied" });
      })
      .catch((err) => {
        console.error(err);
        if (err.message === "Shopping cart is already empty") {
          return res.status(400).json({ error: "Shopping cart is already empty" });
        }
        next(err);
      });
  },

  index(req, res, next) {
    const customerId = req.params.customerId;

    Customer.findOne({
      where: { customerId: customerId },
      raw: true,
    })
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        let shoppingCart = customer.shoppingCart;

        return res.status(200).json({ shoppingCart });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },
};
