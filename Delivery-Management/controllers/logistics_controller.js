const Logistics = require("../models/logistics");
const RabbitMQPublisher = require("../rabbitmq/rabbitMQ_publisher");
const uuid = require("uuid");
const {isEmpty} = require("../util/util");

module.exports = {
    getAll(req, res, next) {
        Logistics.findAll().then((logistics) => {
            res.send(logistics);
        });
    },

    create(req, res, next) {
        const props = req.body;
        const logisticsId = uuid.v4();
        const name = props.name;
        const description = props.description;
        const deliveryCosts = props.deliveryCosts;

        if (isEmpty(name, "name", res) || isEmpty(deliveryCosts, "deliveryCosts", res)) {
            return;
        }

        RabbitMQPublisher.addMessage(`INSERT INTO Logistics (logisticsId, name, description, deliveryCosts) VALUES ('${logisticsId}', '${name}', '${description}', '${deliveryCosts}')`)
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

            RabbitMQPublisher.addMessage(`UPDATE Logistics SET name = '${name}', description = '${description}', deliveryCosts = '${deliveryCosts}' WHERE logisticsId = '${logisticsId}'`)
            return res.status(200).json({message: "Successfully updated logistics company"});
        });
    },

    delete(req, res, next) {
        const logisticsId = req.params.id;

        Logistics.findByPk(logisticsId).then((logistics) => {
            if (!logistics) {
                return res.status(404).send({error: "There are no logistics with ID " + logisticsId});
            }

            RabbitMQPublisher.addMessage(`DELETE FROM Logistics WHERE logisticsId = '${logisticsId}'`)
            return res.status(200).json({message: `Successfully deleted logistics company '${logistics.name}'`});
        });
    },
};
