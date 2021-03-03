//const jwt = require('jsonwebtoken');
const jwt = require('../utility/jwt');

function requestHandler(req, res, next){

    console.log('################################################');
    console.log(req.originalUrl);
    console.log('query :: ', req.query);
    console.log('params :: ', req.params);
    console.log('body :: ', req.body);
    console.log('################################################');

    next();
}


module.exports = {
    requestHandler,
}
