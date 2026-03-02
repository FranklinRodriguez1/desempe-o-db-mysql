const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost:3000',
  user: 'root',
  password: 'Qwe.123*',
  database: 'LogiTechSolutions',
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a MySQL');
});

module.exports = connection;
