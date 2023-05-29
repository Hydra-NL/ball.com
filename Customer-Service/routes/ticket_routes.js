const TicketController = require("../controllers/ticket_controller");

module.exports = (app) => {
  // NOTE: Een aantal routes moeten alleen gedaan kunnen worden door een medewerker.
  app.post(
    "/ticket",
    TicketController.validateToken,
    TicketController.createTicket
  );
  app.get("/ticket", TicketController.validateToken, TicketController.findAll);
  app.get(
    "/ticket/:id",
    TicketController.validateToken,
    TicketController.findById
  );
  app.get(
    "/ticket/customer/:customer_id",
    TicketController.validateToken,
    TicketController.findAllByCustomerId
  );
  app.get(
    "/ticket/status/:status",
    TicketController.validateToken,
    TicketController.findAllByStatus
  );
  app.put(
    "/ticket/:id",
    TicketController.validateToken,
    TicketController.updateTicket
  );
  app.delete(
    "/ticket/:id",
    TicketController.validateToken,
    TicketController.deleteTicket
  );
  app.put(
    "/ticket/:id/status",
    TicketController.validateToken,
    TicketController.updateStatus
  );
  app.put(
    "/ticket/:id/comment",
    TicketController.validateToken,
    TicketController.addComment
  );
  app.get(
    "/ticket/serviceagent/get",
    TicketController.generateToken
  );
};
