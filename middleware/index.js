const jwt = require('jsonwebtoken');

function requestHandler(req, res, next){

    console.log('################################################');
    console.log(req.originalUrl);
    console.log('query :: ', req.query);
    console.log('params :: ', req.params);
    console.log('################################################');

    next();
}

function errorHandler(err, req, res, next) {

    console.log(err.stack);

    if (req.xhr) {
        res.status(500).send(err.getMessage());
    } else {
        next(err);
    }
}


function permissionHandler(req, res, next){




}








module.exports = {
    requestHandler,
    errorHandler,
    permissionHandler
}
