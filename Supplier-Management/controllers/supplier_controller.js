const Supplier = require("../models/supplier");
const rabbitMQManager = require("../rabbitmq/rabbitMQ_publisher");

module.exports = {
  create(req, res, next) {
    const supplierName = req.body.supplier_name;
    const supplierAddress = req.body.supplier_address;
    rabbitMQManager.addMessage(
      `INSERT INTO Suppliers (supplier_name, supplier_address) VALUES ('${supplierName}', '${supplierAddress}')`
    );
    res.status(201).json({
      message: "Supplier created.",
      supplier: req.body,
    });
  },

  async findAll(req, res, next) {
    const suppliers = await Supplier.findAll();
    if (!suppliers) {
      return res.status(422).send({ error: "No suppliers found." });
    } else {
      try {
        res.status(200).send(suppliers);
      } catch (error) {
        console.log(error);
      }
    }
  },

  async findById(req, res, next) {
    const supplierId = req.params.id;
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      return res.status(422).send({ error: "Supplier does not exist." });
    } else {
      res.status(201).json({
        message: "Supplier found.",
        supplier: supplier,
      });
    }
  },

  createFromCSV(req, res, next) {
    const csvFilePath = "./mock-data/suppliers.csv";
    const csv = require("csvtojson");
    csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        jsonObj.forEach((element) => {
          const supplierName = element.supplier_name;
          const supplierAddress = element.supplier_address;
          rabbitMQManager.addMessage(
            `INSERT INTO Suppliers (supplier_name, supplier_address) VALUES ('${supplierName}', '${supplierAddress}')`
          );
        });
        res.status(201).json({
          message: "Suppliers created.",
          suppliers: jsonObj,
        });
      });
  },
};
