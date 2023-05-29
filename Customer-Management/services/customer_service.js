const config = require("../config.json");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

module.exports = {
  authenticate,
  customerExists,
};

async function authenticate({ email, password }) {
  const customer = await Customer.findOne({ email });
  if (customer && password == customer.hash) {
    const token = jwt.sign({ sub: customer.customerId }, config.secret, { expiresIn: "7d" });
    return {
      ...customer.toJSON(),
      token,
    };
  }
  console.log("This customer cannot be authenticated");
}

async function customerExists(customerData) {
  if (!customerData) {
    return false;
  }
  const customer = await Customer.findOne({
    where: { email: customerData },
  });
  if (customer == null) {
    return false;
  }
  return true;
}
