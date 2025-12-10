const mysql = require('mysql2');

// 1. Creamos la piscina de conexiones

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todoapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();