const express = require('express');
const db = require('../config/db');  

const router = express.Router();

// Route pour enregistrer un utilisateur
router.post('/', async (req, res) => {
  const { username, email, prenom, nom } = req.body;
  
  const missingFields = [];
  if (!username) missingFields.push("username");
  if (!email) missingFields.push("email");
  if (!prenom) missingFields.push("prenom");
  if (!nom) missingFields.push("nom");
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: `Champs manquants : ${missingFields.join(', ')}` 
    });
  }
  

  try {
    // Vérifier si le pseudo ou l'email existent déjà
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'KO' }); // "KO" si doublon
    }

    // Insérer l'utilisateur
    await db.query('INSERT INTO users (username, email, prenom, nom) VALUES (?, ?, ?, ?)', [username, email, prenom, nom]);

    return res.status(201).json({ message: 'OK' });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ message: 'KO' });
  }
});

router.get('/', (req, res) => {
  return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
});

module.exports = router;

