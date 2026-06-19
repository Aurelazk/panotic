const express = require('express');
const router = express.Router();

// Villes, Relais Publicitaire, Formations
// TODO: implémenter les routes

router.get('/villes', (req, res) => {
  res.json({ message: 'Module Villes - Beni & Momo Adnan' });
});

router.get('/relais', (req, res) => {
  res.json({ message: 'Module Relais Publicitaire - Beni & Momo Adnan' });
});

router.get('/formations', (req, res) => {
  res.json({ message: 'Module Formations - Beni & Momo Adnan' });
});

module.exports = router;
