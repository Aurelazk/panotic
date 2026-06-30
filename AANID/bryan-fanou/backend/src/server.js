const express = require('express');

const router = express.Router();

// ─── In-memory data ───────────────────────────────────────────────────────────

const kpis = {
  panneauxRecenses: { valeur: 1284, delta: 6.2, direction: 'up', details: 'dont 812 modernes' },
  panneauxObsoletes: { valeur: 472, delta: 2.1, direction: 'up', details: '36,8% du parc total' },
  signalementsActifs: { valeur: 63, delta: 11, direction: 'up', details: '18 en attente de validation' },
  tauxConformite: { valeur: 78.4, delta: 3.4, direction: 'up', details: 'objectif annuel : 85%' },
};

const evolution = [
  { jour: 'J1', modernes: 812, obsoletes: 472, signalements: 63 },
  { jour: 'J8', modernes: 830, obsoletes: 465, signalements: 68 },
  { jour: 'J16', modernes: 855, obsoletes: 458, signalements: 72 },
  { jour: 'J23', modernes: 870, obsoletes: 450, signalements: 78 },
  { jour: 'J30', modernes: 892, obsoletes: 445, signalements: 82 },
];

const signalements = [
  { id: 'sig-1', titre: 'Panneau dégradé — Av. Steinmetz', zone: 'Akpakpa', date: 'il y a 2h', type: 'photo', statut: 'Urgent', statutColor: '#E94E3C' },
  { id: 'sig-2', titre: 'Panneau obsolète — Rond-point Étoile Rouge', zone: 'Ganhi', date: 'il y a 5h', type: 'vidéo', statut: 'En cours', statutColor: '#F5A623' },
  { id: 'sig-3', titre: 'Emplacement inapproprié — Marché Dantokpa', zone: 'Dantokpa', date: 'il y a 1j', type: null, statut: 'Nouveau', statutColor: '#6b6b6b' },
  { id: 'sig-4', titre: 'Besoin de maintenance — Bd. de la Marina', zone: 'Haie Vive', date: 'il y a 2j', type: null, statut: 'Résolu', statutColor: '#3BB273' },
];

const categories = [
  { nom: 'Panneau dégradé', count: 24, color: '#E94E3C', pct: 82 },
  { nom: 'Panneau dangereux', count: 11, color: '#E94E3C', pct: 38 },
  { nom: 'Panneau obsolète', count: 17, color: '#F5A623', pct: 58 },
  { nom: 'Emplacement inapproprié', count: 7, color: '#1E73BE', pct: 24 },
  { nom: 'Besoin de maintenance', count: 4, color: '#3BB273', pct: 14 },
];

const carte = {
  heatmapPoints: [
    { cx: 110, cy: 90, r: 55, intensite: 'forte' },
    { cx: 220, cy: 150, r: 50, intensite: 'moyenne' },
    { cx: 60, cy: 170, r: 40, intensite: 'moyenne' },
  ],
  pins: [
    { top: 40, left: 70, color: '#3BB273' },
    { top: 95, left: 150, color: '#F5A623' },
    { top: 70, left: 200, color: '#E94E3C' },
    { top: 150, left: 240, color: '#1E73BE' },
    { top: 160, left: 60, color: '#E94E3C' },
    { top: 180, left: 130, color: '#3BB273' },
  ],
  totalPoints: 1284,
};

const conformite = {
  taux: 78.4,
  objectif: 85,
  conforme: true,
  aRevoir: false,
};

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get('/etats-lieux', (req, res) => {
  res.json({
    kpis,
    evolution,
    signalements,
    categories,
    carte,
    conformite,
  });
});

router.get('/etats-lieux/kpis', (req, res) => {
  res.json(kpis);
});

router.get('/etats-lieux/evolution', (req, res) => {
  res.json(evolution);
});

router.get('/etats-lieux/signalements', (req, res) => {
  const { statut } = req.query;
  let filtered = signalements;
  if (statut && statut !== 'tous') {
    filtered = filtered.filter(s => s.statut.toLowerCase() === statut.toLowerCase());
  }
  res.json(filtered);
});

router.get('/etats-lieux/categories', (req, res) => {
  res.json(categories);
});

router.get('/etats-lieux/carte', (req, res) => {
  res.json(carte);
});

router.get('/etats-lieux/conformite', (req, res) => {
  res.json(conformite);
});

module.exports = router;
