const Sequelize = require('sequelize');
const path = require('path')

module.exports = (sequelize) => {

  const Contents = require(path.join(__dirname + '/contents.js'))(sequelize, Sequelize);
  const Link = require(path.join(__dirname + '/link.js'))(sequelize, Sequelize);

  (async () =>{
    await Contents.sync();
    await Link.sync();
  })();

  return {
    Contents, Link
  };
};
