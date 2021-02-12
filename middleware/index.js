function requestHandler(req, res, next){

    console.log('################################################');
    console.log(req.originalUrl);
    console.log(req.query);
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

module.exports = {
    requestHandler,
    errorHandler
}
