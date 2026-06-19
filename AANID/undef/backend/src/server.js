const express = require('express');
const router = express.Router();

// Posts/Réseaux & Consultation
// TODO: implémenter les routes

router.get('/posts', (req, res) => {
  res.json({ message: 'Module Posts/Réseaux - undef' });
});

router.get('/consultation', (req, res) => {
  res.json({ message: 'Module Consultation - undef' });
});

module.exports = router;
