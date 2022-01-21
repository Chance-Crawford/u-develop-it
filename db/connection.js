const mysql = require('mysql2');

// for more info see google docs, MySQL - notes
// Connect Express.js server with MySQL database.
// Connect to database which we created in MySQL
// terminal see google docs MySQL - notes
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: 'Wc2X!cJk',
      database: 'election'
    },
    console.log('Connected to the election database.')
);

module.exports = db;