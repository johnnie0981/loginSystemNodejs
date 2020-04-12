const jwt = require('jsonwebtoken');
const config = require('../config/secret.json');

module.exports = (Request, Response, next) => {
    const token = Request.body.token || Request.query.token || Request.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return Response.status(401).json({
                    "error": true,
                    "message": 'Unauthorized access.'
                });
            }
            Request.decoded = decoded;
            next();
        });
    } else {
        // if there is no token
        // return an error
        return Response.status(403).send({
            "error": true,
            "message": 'No token provided.'
        });
    }
}
