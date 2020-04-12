const config = require('../config/dbConfig');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: config.HOST,
    user: config.USER,
    password: config.PASSWORD,
    database: config.DATABASE,
});
connection.connect(error => {
    if (error) throw error;
    console.log('connection is successful')
});
module.exports = connection;