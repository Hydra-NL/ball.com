const Supplier = require("../models/supplier");

module.exports = {
  async create(req, res, next) {
    try {
      const supplier = await Supplier.create(req.body);
      res.send(supplier);
    } catch (error) {
      next(error);
    }
  },

  async findAll(req, res, next) {
    try {
      const suppliers = await Supplier.findAll();
      res.send(suppliers);
    } catch (error) {
      next(error);
    }
  },

  async findById(req, res, next) {
    try {
      const supplier = await Supplier.findByPk(req.params.id);
      res.send(supplier);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const supplier = await Supplier.update(req.body, {
        where: {
          id: req.params.id,
        },
      });
      res.send(supplier);
    } catch (error) {
      next(error);
    }
  },
};
