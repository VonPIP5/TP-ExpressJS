const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Assure-toi que le chemin est correct

const router = express.Router();

// Configuration de Passport
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      // Chercher l'utilisateur
      const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

      if (users.length === 0) {
        return done(null, false, { message: 'Utilisateur ou mot de passe incorrect' });
      }

      const user = users[0];

      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Utilisateur ou mot de passe incorrect' });
      }

      // Vérification du bannissement après la validation des identifiants
      if (user.etatban === 1) {
        return done(null, false, { message: 'Utilisateur banni' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return done(new Error('Utilisateur non trouvé'));
    }

    done(null, users[0]);
  } catch (err) {
    done(err);
  }
});


router.get('/', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur interne du serveur', error: err });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Bad credentials' });
    }

    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: 'Clé secrète JWT non définie' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    return res.status(200).json({
      message: 'Connexion réussie',
      token: token
    });
  })(req, res, next);
});

module.exports = router;
