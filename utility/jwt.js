const jwt = require('jsonwebtoken');
const config = require('../config');

function createToken (args) {
  return jwt.sign(args
    , global.config.secretKey
    , {expiresIn: '1d'});
}

function tokenCheck(token){
  try {

    return jwt.verify(token, global.config.secretKey);

  } catch(err){
    throw err;
  }
}




module.exports = {
  createToken,
  tokenCheck
};
