


function errorHandler(err, req, res, next) {

    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% error')
    console.log(err.stack);
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% error')

    if (req.xhr) {
        res.status(500).send(err.getMessage());
    } else {
        next(err);
    }
}


module.exports = {
  errorHandler,
}
