const Ticket = require("../models/ticket");
const rabbitMQManager = require("../rabbitmq/rabbitMQ_publisher");
const config = require("../config.json");
const jwt = require("jsonwebtoken");

module.exports = {
  createTicket(req, res, next) {
    const customerId = req.customerId;
    const ticket = req.body;

    rabbitMQManager.addMessage(
      `INSERT INTO Tickets (title, description, status, customerId, messages) VALUES ('${ticket.title}', '${ticket.description}', 'Open', '${customerId}', '[]')`
    );
    res.status(201).json({
      message: "Ticket created.",
      ticket: req.body,
      customerId: customerId,
    });
  },

  async findAll(req, res, next) {
    const tickets = await Ticket.findAll();
    if (!tickets) {
      return res.status(422).send({ error: "No tickets found." });
    } else {
      try {
        // remove tickets that do not belong to the customer if the customer is not a service agent
        if (req.role != "Service Agent") {
          tickets.forEach((ticket) => {
            if (ticket.customerId != req.customerId) {
              tickets.splice(tickets.indexOf(ticket), 1);
            }
          });
        }
        res.status(200).send(tickets);
      } catch (error) {
        console.log(error);
      }
    }
  },

  async findById(req, res, next) {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(422).send({ error: "Ticket does not exist." });
    } else {
      if (req.role != "Service Agent" && req.customerId != ticket.customerId) return res.status(401).send({ error: "Unauthorized" });
      res.status(200).send(ticket);
    }
  },

  async findAllByCustomerId(req, res, next) {
    const customerId = req.params.customer_id;
    const tickets = await Ticket.findAll({
      where: {
        customerId: customerId,
      },
    });
    // check if customerId is the same as the one in the token or if the user is a service agent
    if (req.role != "Service Agent" && req.customerId != customerId) return res.status(401).send({ error: "Unauthorized" });
    if (!tickets) {
      return res.status(422).send({ error: "No tickets found." });
    } else {
      try {
        res.status(200).send(tickets);
      } catch (error) {
        console.log(error);
      }
    }
  },

  async findAllByStatus(req, res, next) {
    const status = req.params.status;
    const tickets = await Ticket.findAll({
      where: {
        status: status,
      },
    });
    // remove tickets that do not belong to the customer if the customer is not a service agent
    if (req.role != "Service Agent") {
      tickets.forEach((ticket) => {
        if (ticket.customerId != req.customerId) {
          tickets.splice(tickets.indexOf(ticket), 1);
        }
      });
    }
    if (!tickets) {
      return res.status(422).send({ error: "No tickets found." });
    } else {
      try {
        res.status(200).send(tickets);
      } catch (error) {
        console.log(error);
      }
    }
  },

  async deleteTicket(req, res, next) {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(422).send({ error: "Ticket does not exist." });
    } else {
      if (req.role != "Service Agent") return res.status(401).send({ error: "Unauthorized" });
      rabbitMQManager.addMessage(`DELETE FROM Tickets WHERE id = ${ticketId}`);
      res.status(200).send({ message: "Ticket deleted." });
    }
  },

  async updateTicket(req, res, next) {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(422).send({ error: "Ticket does not exist." });
    } else {
      if (ticket.customerId != req.customerId && req.role != "Service Agent") return res.status(401).send({ error: "Unauthorized" });
      rabbitMQManager.addMessage(
        `UPDATE Tickets SET title = '${req.body.title}', description = '${req.body.description}', status = '${req.body.status}' WHERE id = ${ticketId}`
      );
      res.status(200).send({ message: "Ticket updated." });
    }
  },

  async addComment(req, res, next) {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    const message = req.body.message;
    if (!ticket) {
      return res.status(422).send({ error: "Ticket does not exist." });
    } else {
      // check if ticket belongs to customer or if role is service agent in one line
      if (ticket.customerId != req.customerId && req.role != "Service Agent") return res.status(401).send({ error: "Unauthorized" });
      // if no message, return error
      if (!message) return res.status(422).send({ error: "No message." });
      // add message to current messages
      const messages = ticket.messages;
      messages.push({
        author: req.role,
        message: message,
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
      });
      // parse messages as json
      const messagesJson = JSON.stringify(messages);
      rabbitMQManager.addMessage(
        `UPDATE Tickets SET messages = '${messagesJson}' WHERE id = ${ticketId}`
      );
      res.status(200).send({ message: "Comment added." });
    }
  },

  // simple method to generate service agent token
  generateToken(req, res, next) {
    const token = jwt.sign(
      {
        role: "Service Agent",
      },
      config.secret,
      { expiresIn: "7d" }
    );
    res.status(200).json({ token: token });
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
          if (!decoded.sub && !decoded.role)
            return res.status(401).json({ message: "Invalid token" });
          req.customerId = decoded.sub;
          req.role = decoded.role || "Customer";
          next();
        }
      });
    }
  },
};
