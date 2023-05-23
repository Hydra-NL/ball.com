const Customer = require("../models/customer");
const customerService = require("../services/customer_service");

module.exports = {
  register(req, res, next) {
    const customerProps = req.body;

    customerService.customerExists(customerProps.email).then((bool) => {
      console.log(bool);
      if (bool == true) {
        res.status(409).json({ message: "Email is already in use" });
      } else {
        Customer.create(customerProps)
          .then((customer) => res.send(customer))
          .catch(next);
      }
    });
  },

  login(req, res, next) {
    customerService.authenticate(req.body).then((customer) => {
      if (customer) {
        delete customer.hash;
        res.json(customer);
      } else {
        res.status(400).json({ message: "Email or password is incorrect" });
      }
    });
  },

  index(req, res, next) {
    Customer.findAll({
      attributes: { exclude: ["hash"] },
    })
      .then((customers) => {
        res.send(customers);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  indexOne(req, res, next) {
    const customerId = req.params.id;

    Customer.findByPk(customerId, {
      attributes: { exclude: ["hash"] },
    })
      .then((customer) => {
        res.send(customer);
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
