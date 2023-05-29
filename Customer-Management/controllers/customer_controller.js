const Customer = require("../models/customer");
const customerService = require("../services/customer_service");
const rabbitMQManager = require("./rabbitMQ_publisher");
const uuid = require("uuid");

module.exports = {
  register(req, res, next) {
    const customerProps = req.body;
    let customerId = uuid.v4();

    customerService
      .customerExists(customerProps.email)
      .then((exists) => {
        if (exists) {
          res.status(409).json({ message: "Email is already in use" });
        } else {
          rabbitMQManager.addMessage(
            `INSERT INTO Customers (customerId, firstName, lastName, address, city, zip, email, hash) VALUES ('${customerId}', '${customerProps.firstName}', '${customerProps.lastName}', '${customerProps.address}', '${customerProps.city}', '${customerProps.zip}', '${customerProps.email}', '${customerProps.hash}')`
          );
          res.status(201).json({ customerId: customerId, ...customerProps });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        next(error);
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
    const customerId = req.params.customerId; // Assuming customerId is provided in the request parameters

    Customer.findOne({
      where: { customerId: customerId },
      attributes: { exclude: ["hash"] },
      raw: true,
    })
      .then((customer) => {
        if (customer) {
          res.send(customer);
        } else {
          // Handle case when customer is not found
          res.status(404).send("Customer not found");
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  remove(req, res, next) {
    const customerId = req.params.customerId;

    Customer.findOne({
      where: { customerId: customerId },
      raw: true,
    })
      .then((customer) => {
        if (!customer) {
          // If customer not found, send an error response in the specified format
          return res.status(404).json({
            error: "Customer not found",
          });
        }

        const customerName = customer.firstName; // Assuming the name field exists in the Customer model

        Customer.destroy({
          where: { customerId: customerId },
          raw: true,
        })
          .then(() => {
            res.json({
              message: `Customer "${customerName}" has been removed`,
            });
          })
          .catch((err) => {
            console.error(err);
            next(err);
          });
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
