const mysql = require("mysql");

const config = {
  host: "localhost",
  user: "keepy",
  password: "your_user_password",
  database: "keepy",
};

const pool = mysql.createPool(config);

module.exports = pool;
