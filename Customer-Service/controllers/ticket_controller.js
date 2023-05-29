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
      await Ticket.destroy({
        where: {
          id: ticketId,
        },
      });
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
      await Ticket.update(
        {
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
        },
        {
          where: {
            id: ticketId,
          },
        }
      );
      rabbitMQManager.addMessage(
        `UPDATE Tickets SET title = '${req.body.title}', description = '${req.body.description}', status = '${req.body.status}' WHERE id = ${ticketId}`
      );
      res.status(200).send({ message: "Ticket updated." });
    }
  },

  async addComment(req, res, next) {
    const ticketId = req.params.id;
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(422).send({ error: "Ticket does not exist." });
    } else {
      await Ticket.update(
        {
          messages: req.body.messages,
        },
        {
          where: {
            id: ticketId,
          },
        }
      );
      rabbitMQManager.addMessage(
        `UPDATE Tickets SET messages = '${req.body.messages}' WHERE id = ${ticketId}`
      );
      res.status(200).send({ message: "Comment added." });
    }
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
};
