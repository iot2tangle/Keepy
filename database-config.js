const mysql = require("mysql");

const config = {
  host: "localhost",
  user: "root",
  password: "test",
  database: "keepy",
};

const pool = mysql.createPool(config);

module.exports = pool;
