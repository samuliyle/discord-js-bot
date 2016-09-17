const mysql = require('mysql');

const constants = require('./config/constants');

const connection = mysql.createConnection({
  host: constants.DB_URL,
  user: constants.DB_USERNAME,
  password: constants.DB_PASSWORD,
  database: constants.DB,
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to database.');
    console.log(err.stack);
    return;
  }
  console.log('Connected to database.');
});

module.exports = connection;
