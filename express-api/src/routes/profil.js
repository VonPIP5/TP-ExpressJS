const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// Vérification token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);

      // Vérifie si l'utilisateur est banni en base de données
      const [user] = await db.query('SELECT etatban FROM users WHERE id = ?', [decoded.id]);
      
      if (user.length === 0 || user[0].etatban === 1) {
          return res.status(403).json({ error: 'Accès interdit : utilisateur banni' });
      }

      req.user = decoded;
      next();
  } catch (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params; 

  if (!id) {
    return res.status(400).json({ error: 'ID manquant' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.status(200).json({ user: rows[0] });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer plus tard.' });
  }
});

module.exports = router;
