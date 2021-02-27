const jwt = require('jsonwebtoken');
const config = require('../config');

async function createToken (args) {
  return jwt.sign(args
    , global.config.secretKey
    , {expiresIn: '1d'});
}

async function tokenCheck(token){
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
