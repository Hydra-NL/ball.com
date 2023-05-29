const OrderController = require("../controllers/order_controller");

module.exports = (app) => {
  app.get("/api", OrderController.greeting);

  // Order routes
  app.get("/api/orders", OrderController.validateToken, OrderController.index);
  app.get("/api/orders/:id", OrderController.validateToken, OrderController.indexOne);
  app.post("/api/orders", OrderController.validateToken, OrderController.createOrder);
  app.put("/api/orders/:id", OrderController.validateToken, OrderController.updateOrder);
  app.delete("/api/orders/:id", OrderController.validateToken, OrderController.deleteOrder);

};