const LogisticsController = require("../controllers/logistics_controller");
const OrderController = require("../controllers/order_controller");

module.exports = (app) => {
  // Logistics Company Routes
  app.post("/api/logistics/create", LogisticsController.create);
  app.put("/api/logistics/update", LogisticsController.update);
  app.get("/api/logistics/", LogisticsController.getAll);
  app.get("/api/logistics/:id", LogisticsController.getById);
  app.delete("/api/logistics/:id", LogisticsController.delete)

  // Order Status Routes
  app.post("/api/order/create", OrderController.create);
  app.put("/api/order/update", OrderController.update);
  app.get("/api/order/", OrderController.getAll);
  app.get("/api/order/:id", OrderController.getById);
  app.delete("/api/order/:id", OrderController.delete)
};
