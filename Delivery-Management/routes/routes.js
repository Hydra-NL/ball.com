const LogisticsController = require("../controllers/logistics_controller");
const DeliveryController = require("../controllers/delivery_controller");

module.exports = (app) => {
  // Logistics Company Routes
  app.post("/api/logistics/create", LogisticsController.create);
  app.put("/api/logistics/update", LogisticsController.update);
  app.get("/api/logistics/", LogisticsController.getAll);
  app.get("/api/logistics/:id", LogisticsController.getById);
  app.delete("/api/logistics/:id", LogisticsController.delete)

  // Order Status Routes
  app.post("/api/order/create", DeliveryController.create);
  app.put("/api/order/update", DeliveryController.update);
  app.get("/api/order/", DeliveryController.getAll);
  app.get("/api/order/:id", DeliveryController.getById);
  app.delete("/api/order/:id", DeliveryController.delete)
};
