const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, email, prenom, nom, password } = req.body;

  // 1- Vérifie si tous les champs sont présents
  const champsManquants = [];
  if (!username) champsManquants.push("username");
  if (!email) champsManquants.push("email");
  if (!prenom) champsManquants.push("prenom");
  if (!nom) champsManquants.push("nom");
  if (!password) champsManquants.push("password");

  if (champsManquants.length > 0) {
    return res.status(400).json({
      error: `Champs manquants : ${champsManquants.join(', ')}`
    });
  }

  // 2- Vérifie la longueur des champs
  const longueurChamps = [];
  if (username.length > 15) longueurChamps.push("username");
  if (prenom.length > 20) longueurChamps.push("prenom");
  if (nom.length > 20) longueurChamps.push("nom");
  if (password.length > 20) longueurChamps.push("password");

  if (longueurChamps.length > 0) {
    return res.status(400).json({
      error: `Longueur des champs incorrecte : ${longueurChamps.join(', ')}`
    });
  }

  try {
    // 3- Vérification d'un doublon de username ou email dans la BDD
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username et/ou email déjà utilisé' }); 
    }

    // 4- Hachage du mot de passe avant insertion
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5- Insérer l'utilisateur
    await db.query('INSERT INTO users (username, email, prenom, nom, password) VALUES (?, ?, ?, ?, ?)', 
      [username, email, prenom, nom, hashedPassword]);

    return res.status(201).json({ message: 'OK' });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer plus tard.', error: err.message });
  }
});

router.get('/', (req, res) => {
  return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
});

module.exports = router;