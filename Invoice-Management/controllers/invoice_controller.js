const Invoice = require("../models/invoice");
const uuid = require("uuid");
const rabbitMQManager = require('../rabbitmq/rabbitMQ_publisher');
const eventStoreManager = require("../eventstore/eventstore_manager");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const axios = require("axios");

module.exports = {
  indexOne(req, res, next) {
    const customerId = req.customerId;
    const invoiceId = req.params.id;

    Invoice.findOne({ where: { invoiceId: invoiceId, customerId: customerId } }).then
      ((invoice) => {
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        return res.send(invoice);
      })
  },

  index(req, res, next) {
    const customerId = req.customerId;
    Invoice.findAll({ where: { customerId: customerId } })
      .then((invoices) => {
        // if no invoices found, return message
        if (invoices.length == 0)
          return res.status(404).json({ message: "No invoices found" });
        return res.send(invoices);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  indexByStatus(req, res, next) {
    const customerId = req.customerId;
    const invoiceStatus = req.params.status;
    // check if status is paid or unpaid, else return error (case insensitive)
    if (invoiceStatus.toLowerCase() != "paid" && invoiceStatus.toLowerCase() != "unpaid") return res.status(400).json({ message: "Invalid status" });
    Invoice.findAll({ where: { customerId: customerId, status: invoiceStatus } })
      .then((invoices) => {
        // if no invoices found, return message
        if (invoices.length == 0)
          return res.status(404).json({ message: "No invoices found" });
        return res.send(invoices);
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  validateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    } else {
      const token = authHeader.substring(7, authHeader.length);
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        } else {
          // check if token has customerId
          if (!decoded.sub)
            return res.status(401).json({ message: "Invalid token" });
          req.customerId = decoded.sub;
          next();
        }
      });
    }
  },

  // updateInvoice
  updateInvoice(req, res, next) {
    const invoiceId = req.params.id;
    var invoiceStatus = req.body.status;
    Invoice.findAll({ where: { invoiceId: invoiceId } })
      .then((invoices) => {
        // if no invoices found, return message
        if (invoices.length == 0)
          return res.status(404).json({ message: "No invoice found" });
        // check if customer is same as customer in token
        if (invoices[0].customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          // check if status is unpaid or paid, if not return message (case insensitive)
          if (invoiceStatus.toLowerCase() != "unpaid" && invoiceStatus.toLowerCase() != "paid") return res.status(400).json({ message: "Invalid status" });
          // make first letter uppercase
          invoiceStatus = invoiceStatus.charAt(0).toUpperCase() + invoiceStatus.slice(1);
          eventStoreManager.appendToStream(
            `Invoice-${invoiceId}`,
            "InvoiceUpdated",
            {
              invoiceId,
              status: invoiceStatus,
            }
          );
          // update the Invoice status in the database
          rabbitMQManager.addMessage(
            `UPDATE Invoices SET status = '${invoiceStatus}' WHERE invoiceId = '${invoiceId}'`
          );
          invoices[0].status = invoiceStatus;
          return res.send({ message: "Successfully updated invoice", invoice: invoices[0] });
        }
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  },

  // deleteInvoice
  deleteInvoice(req, res, next) {
    const invoiceId = req.params.id;
    Invoice.findOne({ where: { invoiceId: invoiceId } })
      .then((invoice) => {
        // if no invoices found, return message
        if (invoice == null)
          return res.status(404).json({ message: "No invoice found" });
        // check if customer is same as customer in token
        if (invoice.customerId != req.customerId)
          return res.status(401).json({ message: "Unauthorized" });
        else {
          eventStoreManager.appendToStream(
            `Invoice-${invoiceId}`,
            "InvoiceDeleted",
            {
              invoiceId,
            }
          );
          rabbitMQManager.addMessage(
            `DELETE FROM Invoices WHERE invoiceId = '${invoiceId}'`
          );
          return res
            .status(200)
            .json({ message: "Successfully deleted invoice", invoice: invoice });
        }
      })
      .catch((err) => {
        console.error(err);
        eventStoreManager.appendToStream(
          `Invoice-${invoiceId}`,
          "InvoiceDeleted",
          {
            invoiceId,
          }
        );
        rabbitMQManager.addMessage(
          `DELETE FROM Invoices WHERE invoiceId = '${invoiceId}'`
        );
        return res
          .status(200)
          .json({ message: "Successfully deleted invoice" });
      });
  },

  greeting(req, res) {
    return res.send({ Hello: "World!" });
  },
};
