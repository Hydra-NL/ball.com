const Product = require("../models/product");
const Supplier = require("../models/supplier");
const rabbitMQManager = require("../rabbitmq/rabbitMQ_publisher");

module.exports = {
  create(req, res, next) {
    const supplierId = req.body.supplier_id;
    if (supplierId == null || supplierId == undefined || supplierId == "") {
      return res.status(422).send({ error: "Supplier ID is required." });
    } else {
      const supplier = Supplier.findByPk(supplierId);
      if (!supplier) {
        return res.status(422).send({ error: "Supplier does not exist." });
      } else {
        const productName = req.body.product_name;
        const productPrice = req.body.product_price;

        rabbitMQManager.addMessage(
          `INSERT INTO Products (product_name, product_price, supplier_id) VALUES ('${productName}', '${productPrice}', '${supplierId}')`
        );
        res.status(201).json({
          message: "Product created.",
          product: req.body,
        });
      }
    }
  },

  findAll(req, res, next) {
    const products = Product.findAll();
    if (!products) {
      return res.status(422).send({ error: "No products found." });
    } else {
      res.status(200).send(products);
    }
  },

  findById(req, res, next) {
    const productId = req.params.id;
    const product = Product.findByPk(productId);
    if (!product) {
      return res.status(422).send({ error: "Product does not exist." });
    } else {
      res.status(200).send(product);
    }
  },

  findAllBySupplierId(req, res, next) {
    const supplierId = req.params.supplier_id;
    const products = Product.findAll({
      where: {
        supplier_id: supplierId,
      },
    });
    if (!products) {
      return res.status(422).send({ error: "No products found." });
    } else {
      res.status(200).send(products);
    }
  },

  createFromCSV(req, res, next) {
    const csvFilePath = "./mock-data/products.csv";
    const csv = require("csvtojson");
    csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        jsonObj.forEach((element) => {
          const productName = element.product_name;
          const productPrice = element.product_price;
          const supplierId = element.supplier_id;
          rabbitMQManager.addMessage(
            `INSERT INTO Products (product_name, product_price, supplier_id) VALUES ('${productName}', '${productPrice}', '${supplierId}')`
          );
        });
        res.status(201).json({
          message: "Products created.",
          suppliers: jsonObj,
        });
      });
  },
};
