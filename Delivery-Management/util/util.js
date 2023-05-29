const Delivery = require("../models/delivery");
const Logistics = require("../models/logistics");
const jwt = require("jsonwebtoken");
const config = require("../config.json");

module.exports = {
    validateToken(req, res, next) {
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        if (!token) {
            return res.status(401).json({message: "No token provided"});
        } else {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) {
                    return res.status(401).json({message: "Invalid token"});
                } else {
                    // check if token has customerId
                    if (!decoded.sub) return res.status(401).json({message: "Invalid token"});
                    req.customerId = decoded.sub;
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
    }
}