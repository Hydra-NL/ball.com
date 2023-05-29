const CustomerController = require("../controllers/customer_controller");
const ShoppingCartController = require("../controllers/shopping_cart_controller");

module.exports = (app) => {
  app.get("/api", CustomerController.greeting);

  // Customer routes
  app.post("/api/auth/login", CustomerController.login);
  app.post("/api/auth/register", CustomerController.register);
  app.get("/api/customers", CustomerController.index);
  app.get("/api/customers/:customerId", CustomerController.indexOne);
  app.delete("/api/customers/:customerId", CustomerController.remove);

  // Shopping Cart routes
  app.put("/api/shopping-cart", ShoppingCartController.addItem);
  app.get("/api/shopping-cart/:customerId", ShoppingCartController.index);
  app.put("/api/shopping-cart/remove", ShoppingCartController.removeItem);
  app.put("/api/shopping-cart/:customerId", ShoppingCartController.emptyCart);
};
