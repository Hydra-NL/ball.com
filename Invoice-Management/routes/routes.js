const InvoiceController = require("../controllers/invoice_controller");

module.exports = (app) => {
  app.get("/api", InvoiceController.greeting);

  // Invoice routes
  app.get("/api/invoices", InvoiceController.validateToken, InvoiceController.index);
  app.get("/api/invoices/:id", InvoiceController.validateToken, InvoiceController.indexOne);
  app.get("/api/invoices/:status", InvoiceController.validateToken, InvoiceController.indexByStatus);
  app.put("/api/invoices/:id", InvoiceController.validateToken, InvoiceController.updateInvoice);
  app.delete("/api/invoices/:id", InvoiceController.validateToken, InvoiceController.deleteInvoice);

};