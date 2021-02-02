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
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    try {
      await db.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    const model = require('./model')(db.sequelize);

    db.Contents = model.Contents;

  }
}

module.exports = db;

//
// const mariadb = require('mariadb');
//
// const pool = mariadb.createPool({
//     host: '192.168.32.4',
//     port: 3306,
//     user: 'crawler',
//     password: 'crawler1!',
//     connectionLimit: 5
// });
//
// async function Show(){
//   console.log(1);
//     let conn, rows;
//     try{
//         conn = await pool.getConnection();
//         rows = await conn.query('show databases');
//         console.log(rows);
//     }
//     catch(err){
//         throw err;
//     }
//     finally{
//         if (conn) conn.end();
//         return rows[0];
//     }
// }
//
// module.exports = {
//     Show: Show
// }
