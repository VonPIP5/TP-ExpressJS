const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET

// Verification Token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }

        // Vérifie si l'utilisateur n'est pas ban
        if (decoded.etatban !== 0) {
            return res.status(403).json({ error: 'Accès interdit : vous êtes banni' });
        }

        // Vérifier si l'utilisateur est un admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé : vous devez être administrateur' });
        }

        req.user = decoded;
        next();
    });
};

router.put('/:id', verifyAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        // Vérifie si l'utilisateur existe
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }

        // Met à jour le rôle en "admin"
        await db.query('UPDATE users SET role = ? WHERE id = ?', ['user', userId]);

        return res.status(200).json({ message: `L'utilisateur ${userId} est maintenant user` });

    } catch (err) {
        console.error('Erreur serveur:', err);
        return res.status(500).json({ error: 'Une erreur est survenue, veuillez réessayer plus tard.' });
    }
});


module.exports = router;
