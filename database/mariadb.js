const { Sequelize } = require('sequelize');

let db = {
  init: async function (){

    const database = global.config.database;

    db.sequelize = new Sequelize(database.name, database.username, database.password, {
      host: database.host,
      port: database.port,
      logging: console.log,
      dialect: 'mariadb',
      dialectOptions: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
      // ,pool: {
      //   max: 5,
      //   min: 3,
      //   acquire: 50000,
      //   idle: 30000
      // }
    });

    try {
      await db.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    const model = require('./model')(db.sequelize);

    db.Contents = model.Contents;
    db.ContentsParsed = model.ContentsParsed;
    db.Articles = model.Articles;

  },

  checkAccount: async function(args){

    const service = global.config.target;

    const sequelize = new Sequelize(service.name, args.username, args.password, {
      host: service.host,
      port: service.port,
      logging: console.log,
      dialect: 'mariadb',
      dialectOptions: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    });

    try {
      await sequelize.authenticate();
      return true;
    } catch (error) {
      return false;
    } finally {
      await sequelize.close();
    }

  }

}

module.exports = db;
