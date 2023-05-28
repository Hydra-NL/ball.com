const SupplierController = require("../controllers/supplier_controller");

module.exports = (app) => {
  app.post("/suppliers", SupplierController.create);
  app.get("/suppliers", SupplierController.findAll);
  app.get("/suppliers/:id", SupplierController.findById);
  app.post("/suppliers/upload", SupplierController.createFromCSV);
};
