const Customer = require("../models/customer");
const customerService = require("../services/customer_service");

module.exports = {
  register(req, res, next) {
    const customerProps = req.body;

    customerService.customerExists(req.body).then((bool) => {
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
      customer ? res.json(customer) : res.status(400).json({ message: "Email or password is incorrect" });
      console.log("Response: " + res);
    });
  },

  index(req, res, next) {
    Customer.findAll({})
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

    Customer.findByPk(customerId)
      .then((customer) => {
        res.send(customer);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  greeting(req, res) {
    res.send({ hi: "there" });
  },
};
