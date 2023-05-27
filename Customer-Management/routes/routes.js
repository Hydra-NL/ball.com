const CustomerController = require("../controllers/customer_controller");
const ShoppingCartController = require("../controllers/shopping_cart_controller");

module.exports = (app) => {
  app.get("/api", CustomerController.greeting);

  // Customer routes
  app.post("/api/auth/login", CustomerController.login);
  app.post("/api/auth/register", CustomerController.register);
  app.get("/api/customers", CustomerController.index);
  app.get("/api/customers/:id", CustomerController.indexOne);
  app.delete("/api/customers/:id", CustomerController.remove);

  // Shopping Cart routes
  app.put("/api/shopping-cart", ShoppingCartController.addItem);
  app.get("/api/shopping-cart/:id", ShoppingCartController.index);
  app.put("/api/shopping-cart/remove", ShoppingCartController.removeItem);
  app.delete("/api/shopping-cart/:id", ShoppingCartController.emptyCart);
};
