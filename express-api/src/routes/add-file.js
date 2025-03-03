const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// Middleware de vérification du token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const [rows] = await db.query('SELECT etatban FROM users WHERE id = ?', [decoded.id]);

        if (rows.length === 0 || rows[0].etatban === 1) {
            return res.status(403).json({ error: 'Accès interdit : utilisateur banni' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

// Configuration de multer
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

// Route pour l'upload de fichiers avec vérification du token
router.post('/', verifyToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier n’a été téléchargé.' });
    }

    res.status(200).json({ message: `${req.file.filename} enregistré avec succès` });
});

module.exports = router;
