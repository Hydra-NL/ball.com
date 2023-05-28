const ProductController = require("../controllers/product_controller");

module.exports = (app) => {
  app.post("/products", ProductController.create);
  app.get("/products", ProductController.findAll);
  app.get("/products/:id", ProductController.findById);
  app.get(
    "/products/suppliers/:supplier_id",
    ProductController.findAllBySupplierId
  );
  app.post("/products/upload", ProductController.createFromCSV);
};
