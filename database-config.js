const mysql = require("mysql");

const config = {
  host: "localhost",
  user: "test",
  password: "test",
  database: "keepy",
};

const pool = mysql.createPool(config);

module.exports = pool;
