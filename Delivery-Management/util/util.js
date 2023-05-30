const jwt = require("jsonwebtoken");
const config = require("../config.json");
const Delivery = require("../models/delivery");
const Logistics = require("../models/logistics");
const RabbitMQPublisher = require("../rabbitmq/rabbitMQ_publisher");
const Status = require("./status");

module.exports = {
    validateToken(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({message: "No token provided"});
        } else {
            const token = authHeader.substring(7, authHeader.length);
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    return res.status(401).json({message: "Invalid token"});
                } else {
                    // check if token has customerId
                    if (!decoded.sub) return res.status(401).json({message: "Invalid token"});
                    req.customerId = decoded.sub;
                    req.token = token;
                    next();
                }
            });
        }
    },

    isEmpty(value, name, res) {
        if (value != null) {
            return false;
        }

        res.status(400).send({error: `No ${name} provided`});
        return true;
    },

    async getCheapestLogistics() {
        const allLogistics = await Logistics.findAll();

        let cheapest = null
        for (let i = 0; i < allLogistics.length; i++) {
            const logistics = allLogistics[i];

            if (cheapest == null || logistics.deliveryCosts < cheapest.deliveryCosts) {
                cheapest = logistics;
            }
        }

        return cheapest;
    },

    async createDelivery(data) {
        const orderId = data.orderId;
        let logisticsId = data.logisticsId;

        if (!orderId) {
            return {
                status: 400,
                error: "No orderId provided"
            };
        }

        if (!logisticsId) {
            const cheapest = await this.getCheapestLogistics();
            if (cheapest == null) {
                return {
                    status: 400,
                    error: "Cannot create delivery without logistics company!"
                }
            }

            logisticsId = cheapest.logisticsId;
        }

        const delivery = await Delivery.findByPk(orderId);
        if (delivery) {
            return {
                status: 400,
                error: "Delivery already exists for order " + orderId,
                delivery: delivery
            };
        }

        const logistics = await Logistics.findByPk(logisticsId);
        if (!logistics) {
            return {
                status: 400,
                error: "No logistics company found with ID " + logisticsId
            };
        }

        RabbitMQPublisher.addMessage(`INSERT INTO Deliveries (orderId, logisticsId, status) VALUES ('${orderId}', '${logisticsId}', '${Status.Pending}')`)
        return {
            status: 201,
            message: "Successfully created delivery",
            logistics: logistics
        }
    },
}