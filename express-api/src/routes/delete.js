const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "ton_secret_key_super_securise"; // ⚠️ À stocker dans un fichier .env

// Vérification token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);

      const [user] = await db.query('SELECT etatban FROM users WHERE id = ?', [decoded.id]);

      if (user.length === 0 || user[0].etatban === 1) {
          return res.status(403).json({ error: 'Accès interdit : utilisateur banni' });
      }

      if (decoded.role !== 'admin') {
          return res.status(403).json({ error: 'Accès refusé : vous devez être administrateur' });
      }

      req.user = decoded;
      next();
  } catch (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID manquant' });
  }

  try {
    // Vérifie si l'utilisateur existe
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // Supprime l'utilisateur
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer plus tard.' });
  }
});

module.exports = router;
