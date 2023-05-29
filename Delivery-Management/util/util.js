const jwt = require("jsonwebtoken");
const config = require("../config.json");

module.exports = {
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
                    if (!decoded.sub) return res.status(401).json({ message: "Invalid token" });
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
    }
}