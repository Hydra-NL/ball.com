const Logistics = require("../models/logistics");

module.exports = {
    create(req, res, next) {
        Logistics.create(req.body).then((logistics) => {
            res.send(logistics)
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    update(req, res, next) {
        Logistics.findByPk(req.body.id).then((logistics) => {
            if (logistics) {
                logistics.update(req.body).then(updated => {
                    res.send(updated)
                }).catch((err) => {
                    console.error(err);
                    next(err);
                });
            } else {
                res.status(404).send({error: "There are no logistics with ID " + req.body.id});
            }
        }).catch((err) => {
            console.log(err);
            next(err);
        });
    },

    getAll(req, res, next) {
        Logistics.findAll().then((logistics) => {
            res.send(logistics);
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    getById(req, res, next) {
        Logistics.findByPk(req.params.id).then((logistics) => {
            if (logistics) {
                res.send(logistics);
            } else {
                res.status(404).send({error: "There are no logistics with ID " + req.params.id});
            }
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },

    delete(req, res, next) {
        Logistics.findByPk(req.params.id).then((logistics) => {
            if (logistics) {
                logistics.destroy().then(_ => {
                    res.send(logistics);
                }).catch((err) => {
                    console.error(err);
                    next(err);
                })
            } else {
                res.status(404).send({error: "There are no logistics with ID " + req.params.id});
            }
        }).catch((err) => {
            console.error(err);
            next(err);
        });
    },
};
