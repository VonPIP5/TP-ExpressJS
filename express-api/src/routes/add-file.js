const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

// Vérification token
const verifyToken = (req, res, next) => {
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

    req.user = decoded; 
    next();
  });
};


const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, uniqueName + extension);
  }
});

const upload = multer({ storage });

router.post('/', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier n’a été téléchargé.');
  }

  res.send(`${req.file.filename} enregistré avec succès`);
});

module.exports = router;
