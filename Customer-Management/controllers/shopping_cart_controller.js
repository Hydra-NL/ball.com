const Customer = require("../models/customer");

module.exports = {
  addItem(req, res, next) {
    const customerId = req.body.customerId;
    const productName = req.body.productName;

    Customer.findByPk(customerId)
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

        if (shoppingCart.length >= 20) {
          return res.status(400).json({ error: "Shopping cart limit reached" });
        }

        shoppingCart.push(productName);

        // Convert the shopping cart array back to a JSON string
        customer.shoppingCart = JSON.stringify(shoppingCart);

        return customer.save();
      })
      .then((savedCustomer) => {
        let shoppingCart = savedCustomer.shoppingCart || [];

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

  removeItem(req, res, next) {
    const customerId = req.body.customerId;
    const productIndex = req.body.productIndex;

    Customer.findByPk(customerId)
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
          customer.shoppingCart = [];
        } else {
          customer.shoppingCart = JSON.stringify(shoppingCart);
        }

        return customer.save();
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
    const customerId = req.params.id;

    Customer.findByPk(customerId)
      .then((customer) => {
        if (!customer) {
          return res.status(404).json({ error: "Customer not found" });
        }

        if (customer.shoppingCart.length === 0) {
          throw new Error("Shopping cart is already empty");
        }

        customer.shoppingCart = [];
        return customer.save();
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
    const customerId = req.params.id;

    Customer.findByPk(customerId)
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

  //   order(req, res, next) {
  //     const customerId = req.body.customerId;

  //     Customer.findByPk(customerId)
  //       .then((customer) => {
  //         if (!customer) {
  //           return res.status(404).json({ error: "Customer not found" });
  //         }

  //         if (customer.shoppingCart.length === 0) {
  //           return res.status(400).json({ error: "Shopping cart is empty" });
  //         }

  //         const order = customer.shoppingCart;
  //         // Assuming you have an "Order" model, you can create a new order entry
  //         Order.create({ customerId, order })
  //           .then(() => {
  //             // Call the emptyCart method to clear the shopping cart
  //             return this.emptyCart(customerId);
  //           })
  //           .then(() => {
  //             return res.status(200).json({ message: "Order placed successfully" });
  //           })
  //           .catch((err) => {
  //             console.error(err);
  //             next(err);
  //           });
  //       })
  //       .catch((err) => {
  //         console.error(err);
  //         next(err);
  //       });
  //   },
};
