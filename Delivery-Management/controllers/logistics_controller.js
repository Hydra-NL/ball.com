const Logistics = require("../models/logistics");
const Delivery = require("../models/delivery");
const RabbitMQPublisher = require("../rabbitmq/rabbitMQ_publisher");
const {isEmpty} = require("../util/util");

module.exports = {
    getAll(req, res, next) {
        Logistics.findAll().then((logistics) => {
            res.send(logistics);
        });
    },

    create(req, res, next) {
        const props = req.body;
        const name = props.name;
        const description = props.description;
        const deliveryCosts = props.deliveryCosts;

        if (isEmpty(name, "name", res) || isEmpty(deliveryCosts, "deliveryCosts", res)) {
            return;
        }

        RabbitMQPublisher.addMessage(`INSERT INTO Logistics (name, description, deliveryCosts) VALUES ('${name}', '${description}', '${deliveryCosts}')`)
        return res.status(201).json({message: "Successfully created logistics"});
    },

    update(req, res, next) {
        const logisticsId = req.params.id;
        const props = req.body;
        const name = props.name;
        const description = props.description;
        const deliveryCosts = props.deliveryCosts;

        if (isEmpty(name, "name", res) || isEmpty(deliveryCosts, "deliveryCosts", res)) {
            return;
        }

        Logistics.findByPk(logisticsId).then((logistics) => {
            if (!logistics) {
                return res.status(404).send({error: "There are no logistics with ID " + logisticsId});
            }

            RabbitMQPublisher.addMessage(`UPDATE Logistics SET name = '${name}', description = '${description}', deliveryCosts = '${deliveryCosts}' WHERE id = '${logisticsId}'`)
            return res.status(200).json({message: "Successfully updated logistics company"});
        });
    },

    delete(req, res, next) {
        const logisticsId = req.params.id;

        Delivery.findByPk(req.params.id).then((logistics) => {
            if (!logistics) {
                return res.status(404).send({error: "There are no logistics with ID " + logisticsId});
            }

            RabbitMQPublisher.addMessage(`DELETE FROM Logistics WHERE id = '${logisticsId}'`)
            return res.status(200).json({message: `Successfully deleted logistics company '${logistics.name}'`});
        });
    },
};
