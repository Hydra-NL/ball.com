const RabbitMQPublisher = require('../rabbitmq/rabbitMQ_publisher');
const Delivery = require("../models/delivery");
const Logistics = require("../models/logistics");
const http = require('http');
const config = require("../config.json");
const Util = require("../util/util");
const Status = require("../util/status");
const {isEmpty} = require("../util/util");
const {appendToStream} = require("../events/eventstore_manager");

module.exports = {
    getAll(req, res, next) {
        Delivery.findAll().then((deliveries) => {
            res.send(deliveries);
        });
    },

    async create(req, res, next) {
        const response = await Util.createDelivery(req.body);
        res.status(response.status).send(response);
    },

    updateStatus(req, res, next) {
        const orderId = req.params.id;
        const status = req.body.status;

        if (!Status.isValid(status)) {
            return res.status(400).send({error: "Status is invalid: " + status, options: Status.Values});
        }

        Delivery.findByPk(orderId).then((delivery) => {
            if (!delivery) {
                return res.status(404).send({error: "There are no deliveries with order ID " + orderId});
            }

            RabbitMQPublisher.addMessage(`UPDATE Deliveries SET status = '${status}' WHERE orderId = '${orderId}'`)
            const oldStatus = delivery.status;
            if (oldStatus !== status) {
                onUpdateStatus(delivery)
            }

            return res.status(200).json({message: "Successfully updated delivery"});
        })
    },

    delete(req, res, next) {
        const orderId = req.params.id;

        Delivery.findByPk(req.params.id).then((delivery) => {
            if (!delivery) {
                return res.status(404).send({error: "There are no deliveries with order ID " + orderId});
            }

            RabbitMQPublisher.addMessage(`DELETE FROM Deliveries WHERE orderId = '${orderId}'`)
            return res.status(200).json({message: "Successfully deleted order"});
        });
    },

    getForCustomer(req, res, next) {
        const options = {
            hostname: config.orderApiHost,
            port: config.orderApiPort,
            path: '/api/orders',
            headers: {
                'Authorization': `Bearer ${req.token}`
            }
        };

        http.get(options, async (result) => {
            res.status(result.statusCode)

            const orders = await getBody(result);
            const deliveries = [];

            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                const delivery = await Delivery.findByPk(order.orderId);

                if (delivery) {
                    const logistics = await Logistics.findByPk(delivery.logisticsId);
                    if (logistics) {
                        deliveries.push({
                            status: delivery.status,
                            logistics: logistics,
                            order: order
                        });
                    }
                }
            }

            res.send(deliveries);
        });
    }
};

function onUpdateStatus(delivery) {
    const orderId = delivery.orderId;
    const newStatus = delivery.status
    Logistics.findByPk(delivery.logisticsId).then((logistics) => {

        appendToStream(`Status: ${newStatus}`, "UpdatedDeliveryStatus", {
            orderId: orderId,
            newStatus: newStatus,
            logistics: logistics
        })
    });
}

function getBody(request) {
    return new Promise((resolve) => {
        const parts = [];
        let body;

        request.on('data', (chunk) => {
            parts.push(chunk);
        })

        request.on('end', () => {
            body = Buffer.concat(parts).toString();
            resolve(JSON.parse(body));
        });
    });
}
