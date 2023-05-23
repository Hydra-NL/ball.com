const CustomerController = require("../controllers/customer_controller");

module.exports = (app) => {
  app.get("/api", CustomerController.greeting);

  // Customer routes
  app.post("/api/auth/login", CustomerController.login);
  app.post("/api/auth/register", CustomerController.register);
  app.get("/api/customers", CustomerController.index);
  app.get("/api/customers/:id", CustomerController.indexOne);
};
