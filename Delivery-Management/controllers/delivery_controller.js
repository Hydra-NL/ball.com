const RabbitMQPublisher = require('../rabbitmq/rabbitMQ_publisher');
const Delivery = require("../models/delivery");
const Logistics = require("../models/logistics");
const Status = require("../util/status");
const {isEmpty} = require("../util/util");

module.exports = {
    getAll(req, res, next) {
        Delivery.findAll().then((order) => {
            res.send(order);
        });
    },

    create(req, res, next) {
        const orderId = req.body.orderId;
        const logisticsId = req.body.logisticsId;

        if (isEmpty(orderId, "orderId", res) || isEmpty(logisticsId, "logisticsId", res)) {
            return;
        }

        Delivery.findByPk(orderId).then((order) => {
            if (order) {
                return res.status(400).send({error: "Delivery already exists for order " + orderId, order: order});
            }

            Logistics.findByPk(logisticsId).then((logistics) => {
                if (!logistics) {
                    return res.status(400).send({error: "No logistics company found with ID " + logisticsId});
                }

                RabbitMQPublisher.addMessage(`INSERT INTO Deliveries (orderId, logisticsId, status) VALUES ('${orderId}', '${logisticsId}', '${Status.Pending}')`)
                return res.status(201).json({message: "Successfully created delivery", logistics: logistics});
            });
        });
    },

    updateStatus(req, res, next) {
        const orderId = req.params.id;
        const status = req.body.status;

        if (!Status.isValid(status)) {
            return res.status(400).send({error: "Status is invalid: " + status, options: Status.Values});
        }

        Delivery.findByPk(orderId).then((order) => {
            if (!order) {
                return res.status(404).send({error: "There are no deliveries with order ID " + orderId});
            }

            RabbitMQPublisher.addMessage(`UPDATE Deliveries SET status = '${status}' WHERE orderId = '${orderId}'`)
            const oldStatus = order.status;
            if (oldStatus !== status) {
                updateStatus(order)
            }

            return res.status(200).json({message: "Successfully updated delivery"});
        })
    },

    delete(req, res, next) {
        const orderId = req.params.id;

        Delivery.findByPk(req.params.id).then((order) => {
            if (!order) {
                return res.status(404).send({error: "There are no deliveries with order ID " + orderId});
            }

            RabbitMQPublisher.addMessage(`DELETE FROM Deliveries WHERE orderId = '${orderId}'`)
            return res.status(200).json({message: "Successfully deleted order"});
        });
    },
};

function updateStatus(order) {
    const orderId = order.orderId;
    const newStatus = order.status
    Logistics.findByPk(order.logisticsId).then((logistics) => {

        // TODO: FIRE UpdatedDeliveryStatus EVENT
        console.log(`UpdatedDeliveryStatus: ${
            JSON.stringify({
                orderId: orderId,
                newStatus: newStatus,
                logistics: logistics
            })
        }`)
    });
}
