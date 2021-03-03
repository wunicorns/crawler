//const jwt = require('jsonwebtoken');

function permissionHandler(req, res, next){

  try {

    if(req.header.authorization){

      const valid = jwt.tokenCheck(req.header.authorization);

      if(valid) {
        console.log(' authorization :: ', req.header.authorization);
      }

      console.log('valid :: ', valid);

    } else {



    }

  }catch(err){
    next(err);
  }

}





module.exports = {
    permissionHandler
}
