// const path = require('path');
// const config = require('../config');
const mariadb  = require('mariadb');

class Database {
  constructor(config){
    this.initialized = false
    this.config = config;
    this.init();
  }

  async init () {

    const config = this.config

    try {

      this.pool = mariadb.createPool({
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
    await this.pool.end();
  }

  async select(sql){
    const conn = await this.pool.getConnection();
    try {
      return await conn.query(sql)
    } catch(err){
      console.error(err);
    } finally {
      conn.release();
    }
  }

  async insert (sql, values){
    const conn = await this.pool.getConnection();
    try {
      return await conn.query(sql, values);
    } catch(err){
      console.error(err);
    } finally {
      conn.release();
    }

  }

  async execute (sql){
    const conn = await this.pool.getConnection();
    try {
      return await conn.query(sql);
    } catch(err){
      console.error(err);
    } finally {
      conn.release();
    }
  }

  async beginTransaction (){
    const conn = await this.pool.getConnection();
    try {
      return conn;
    } catch(err){
      console.error(err);
    } finally {
      conn.release();
    }
  }

  async commit (conn){
    await conn.commit();
  }

  async rollback (conn){
    await conn.rollback();
  }


}

module.exports = {
  Database
};
