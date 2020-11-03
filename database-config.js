const mysql = require("mysql");

const config = {
  host: "localhost",
  user: "test",
  password: "test",
  database: "gateway",
};

const pool = mysql.createPool(config);

module.exports = pool;
