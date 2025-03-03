const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET

// Verification Token
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

router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, prenom, nom, role FROM users');
        return res.status(200).json({ users });
    } catch (err) {
        console.error('Erreur serveur:', err);
        return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer plus tard.' });
    }
});

module.exports = router;
