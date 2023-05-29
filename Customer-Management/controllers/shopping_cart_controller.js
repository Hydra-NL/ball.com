const Customer = require("../models/customer");

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

        let shoppingCart = customerData.shoppingCart || [];

        try {
          // Parse the shopping cart JSON string into an array
          shoppingCart = JSON.parse(shoppingCart);
        } catch (err) {
          // Handle invalid JSON or empty shopping cart
          shoppingCart = [];
        }

        if (shoppingCart.length >= 20) {
          return res.status(400).json({ error: "Shopping cart limit reached" });
        }

        shoppingCart.push(productName);

        // Convert the shopping cart array back to a JSON string
        const updatedShoppingCart = JSON.stringify(shoppingCart);

        // Update the shoppingCart field of the existing customer record
        return Customer.update({ shoppingCart: updatedShoppingCart }, { where: { customerId: customerId } });
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

        try {
          shoppingCart = JSON.parse(shoppingCart);
        } catch (err) {
          shoppingCart = [];
        }

        if (shoppingCart.length <= productIndex || productIndex < 0) {
          throw new Error("Invalid product index");
        }

        shoppingCart.splice(productIndex, 1);

        if (shoppingCart.length === 0) {
          customer.shoppingCart = null;
        } else {
          customer.shoppingCart = JSON.stringify(shoppingCart);
        }

        // Convert the plain JavaScript object back to a Sequelize model instance
        const updatedCustomer = customer instanceof Customer ? customer : Customer.build(customer.dataValues);

        return updatedCustomer.save();
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

        // Check if shoppingCart property is null or undefined
        if (!customer.shoppingCart || customer.shoppingCart.length === 0) {
          throw new Error("Shopping cart is already empty");
        }

        customer.shoppingCart = [];

        // Convert the plain JavaScript object back to a Sequelize model instance
        const updatedCustomer = customer instanceof Customer ? customer : Customer.build(customer.dataValues);

        return updatedCustomer.save();
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

        let shoppingCart = customer.shoppingCart || [];

        try {
          // Parse the shopping cart JSON string into an array
          shoppingCart = JSON.parse(shoppingCart);
        } catch (err) {
          // Handle invalid JSON or empty shopping cart
          shoppingCart = [];
        }

        return res.status(200).json({ shoppingCart });
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },
};
