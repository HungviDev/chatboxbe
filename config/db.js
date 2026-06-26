const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123123',
    database: process.env.DB_NAME || 'info'
});

connection.connect((err) => {
    if (err) {
        console.error('Kết nối thất bại:', err);
        return;
    }
    console.log('Kết nối MySQL thành công');
});

module.exports = connection;