const LogisticsController = require("../controllers/logistics_controller");
const DeliveryController = require("../controllers/delivery_controller");
const Util = require("../util/util");

module.exports = (app) => {
    // Logistics Company Routes (for internal use / employees)
    app.get("/api/logistics/", LogisticsController.getAll);
    app.post("/api/logistics/", LogisticsController.create);
    app.put("/api/logistics/:id", LogisticsController.update);
    app.delete("/api/logistics/:id", LogisticsController.delete)

    // Delivery Routes (for internal use / employees)
    app.get("/api/delivery/", DeliveryController.getAll);
    app.post("/api/delivery/", DeliveryController.create);
    app.put("/api/delivery/:id", DeliveryController.updateStatus);
    app.delete("/api/delivery/:id", DeliveryController.delete)

    // Delivery Routes (for customers)
    app.get("/api/delivery/customer/", Util.validateToken, DeliveryController.getForCustomer);
};
