// const path = require('path');
// const config = require('../config');
const mariadb  = require('mariadb');

class Database {
  constructor(config){
    var _self = this;
    _self.initialized = false
    _self.config = config;
    (async function(){
      await _self.init();
    })();
  }

  async init () {

    const config = this.config

    try {

      this.conn = await mariadb.createConnection({
        host: config.database.host,
        user: config.database.username,
        // port: config.database.port,
        password: config.database.password,
        database: config.database.name,
        multipleStatements: true,
        connectionLimit: 5
      });

      this.initialized = true;

    } catch(err) {
      console.error(err);
    }
  }

  async close (){
    await this.conn.end();
  }

  async select(sql){
    // const conn = await this.pool.getConnection();
    try {
      return await this.conn.query(sql)
    } catch(err){
      console.error(err);
    } finally {
      // conn.release();
      await this.conn.end();
    }
  }

  async insert (sql, values){
    // const conn = await this.pool.getConnection();
    try {
      // console.log(this.conn);
      return await this.conn.query(sql, values);
    } catch(err){
      console.error(err);
    } finally {
      this.conn.end();
    }

  }

  async execute (sql){
    // const conn = await this.pool.getConnection();
    try {
      return await this.conn.query(sql);
    } catch(err){
      console.error(err);
    } finally {
      this.conn.end();
    }
  }

  async beginTransaction (){
    try {
      return this.conn;
    } catch(err){
      console.error(err);
    } finally {
      this.conn.end();
    }
  }

  async commit (conn){
    await this.conn.commit();
  }

  async rollback (conn){
    await this.conn.rollback();
  }


}

module.exports = {
  Database
};
