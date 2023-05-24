const Product = require("../models/product");
const Supplier = require("../models/supplier");

module.exports = {
  async create(req, res, next) {
    const supplier = await Supplier.findByPk(req.body.supplier_id);
    if (!supplier) {
      return res.status(422).send({ error: "Supplier does not exist." });
    }
    try {
      const product = await Product.create(req.body);
      res.send(product);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req, res, next) {
    const products = await Product.findAll();
    if (!products) {
      return res.status(422).send({ error: "No products found." });
    }
    try {
      res.send(products);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(422).send({ error: "No product found." });
      }
      res.send(product);
    } catch (error) {
      next(error);
    }
  },

  async findAllBySupplierId(req, res, next) {
    try {
      const products = await Product.findAll({
        where: {
          supplier_id: req.params.supplier_id,
        },
      });
      res.send(products);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const product = await Product.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
      if (!product) {
        return res.status(422).send({ error: "No product found." });
      }
      res.send(product);
    } catch (error) {
      next(error);
    }
  },

};
