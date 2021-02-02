function requestHandler(req, res, next){

    // console.log(req.originalUrl);

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
