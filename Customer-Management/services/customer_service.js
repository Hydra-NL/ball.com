const config = require("../config.json");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

module.exports = {
  authenticate,
  customerExists,
};

async function authenticate({ email, password }) {
  const customer = await Customer.findOne({ email });
  console.log(customer);
  if (customer && password == customer.hash) {
    const token = jwt.sign({ sub: customer._id }, config.secret, { expiresIn: "7d" });
    console.log("Token: " + token);
    return {
      ...customer.toJSON(),
      token,
    };
  }
  console.log("This customer cannot be authenticated");
}

async function customerExists(customerData) {
  if (!customerData || !customerData.email) {
    return false;
  }
  const { email } = customerData;
  const customer = await Customer.findOne({ email });
  if (customer == null) {
    return false;
  }
  return true;
}
