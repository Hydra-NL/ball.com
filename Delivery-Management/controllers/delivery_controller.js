const Delivery = require("../models/delivery");
const Logistics = require("../models/logistics");

module.exports = {
    create(req, res, next) {
        Delivery.create(req.body).then((order) => {
            updateStatus(order)
            res.send(order)
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    update(req, res, next) {
        Delivery.findByPk(req.body.orderId).then((order) => {
            if (order) {
                const oldStatus = order.status;
                order.update(req.body).then(updated => {
                    if (oldStatus !== updated.status) {
                        updateStatus(order)
                    }
                    res.send(updated)
                }).catch((err) => {
                    console.error(err);
                    next(err);
                });
            } else {
                res.status(404).send({error: "There are no orders with ID " + req.body.orderId});
            }
        }).catch((err) => {
            console.log(err);
            next(err);
        });
    },

    getAll(req, res, next) {
        Delivery.findAll().then((order) => {
            res.send(order);
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    getById(req, res, next) {
        Delivery.findByPk(req.params.id).then((order) => {
            if (order) {
                res.send(order);
            } else {
                res.status(404).send({error: "There are no orders with ID " + req.params.id});
            }
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    delete(req, res, next) {
        Delivery.findByPk(req.params.id).then((order) => {
            if (order) {
                order.destroy().then(_ => {
                    res.send(order);
                }).catch((err) => {
                    console.error(err);
                    next(err);
                });
            } else {
                res.status(404).send({error: "There are no orders with ID " + req.params.id});
            }
        }).catch((err) => {
            console.error(err);
            next(err);
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
