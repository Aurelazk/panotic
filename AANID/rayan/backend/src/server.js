const express = require('express');
const router = express.Router();

// Carte Interactive
// TODO: implémenter les routes

router.get('/carte', (req, res) => {
  res.json({ message: 'Module Carte Interactive - Rayan' });
});

module.exports = router;
