const Ticket = require("../models/ticket");
const rabbitMQManager = require("../rabbitmq/rabbitMQ_publisher");

module.exports = {
  create(req, res, next) {},

  async findAll(req, res, next) {},

  async findById(req, res, next) {},

  async findAllByCustomerId(req, res, next) {},

  async findAllByStatus(req, res, next) {},

  async delete(req, res, next) {},

  async update(req, res, next) {},

  async addComment(req, res, next) {},
};
