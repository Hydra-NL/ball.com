const config = require("../config.json");
const jwt = require("jsonwebtoken");
const Order = require("../models/order");

module.exports = {
  orderExists,
};

async function orderExists(orderId) {
  if (!orderId) {
    return false;
  }
  const order = await Order.findOne({
    where: { orderId: orderId },
  });
  if (order == null) {
    return false;
  }
  return true;
}
