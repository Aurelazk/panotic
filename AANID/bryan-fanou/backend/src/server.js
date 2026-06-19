const express = require('express');
const router = express.Router();

// États des lieux
// TODO: implémenter les routes

router.get('/etats-lieux', (req, res) => {
  res.json({ message: 'Module États des lieux - Bryan Fanou' });
});

module.exports = router;
