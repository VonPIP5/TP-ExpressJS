const mysql = require('mysql2');

// Crée une connexion à la base de données MariaDB
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dbExpress'
})

// Vérifie la connexion
connection.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MariaDB');
});

module.exports = connection;
