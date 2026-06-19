const express = require('express');
const router = express.Router();

// Authentification & Profil
// TODO: implémenter les routes

router.post('/auth/register', (req, res) => {
  res.json({ message: 'Register - W-D' });
});

router.post('/auth/login', (req, res) => {
  res.json({ message: 'Login - W-D' });
});

router.get('/profile', (req, res) => {
  res.json({ message: 'Profile - W-D' });
});

module.exports = router;
