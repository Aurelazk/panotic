const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// ─── Données mock ───────────────────────────────────────────────────────────

const CATEGORIES = ['PANNEAUTIQUE', 'ENVIRONNEMENT', 'SANTE', 'INFRASTRUCTURE'];

const formations = [
  {
    id: 'fmt-1',
    title: 'Conception et installation de panneaux publicitaires',
    description: 'Maîtrisez les techniques de conception et d\'installation des panneaux publicitaires conformément aux normes en vigueur.',
    category: 'PANNEAUTIQUE',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    duration: '4 semaines',
    capacity: 50,
    enrolledCount: 12,
    price: 25000,
    currency: 'XOF',
    isFree: false,
    modules: [
      { id: 'mod-1', title: 'Normes et réglementations', content: 'Introduction aux normes en vigueur pour l\'affichage publicitaire en milieu urbain.', duration: '1 semaine' },
      { id: 'mod-2', title: 'Design graphique', content: 'Principes de conception graphique appliqués aux panneaux publicitaires.', duration: '2 semaines' },
      { id: 'mod-3', title: 'Installation et maintenance', content: 'Techniques d\'installation sécurisée et maintenance préventive.', duration: '1 semaine' },
    ],
    createdAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 'fmt-2',
    title: 'Gestion des déchets urbains',
    description: 'Apprenez les bonnes pratiques de gestion des déchets en milieu urbain pour un cadre de vie plus sain.',
    category: 'ENVIRONNEMENT',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b',
    duration: '2 semaines',
    capacity: 100,
    enrolledCount: 45,
    price: 0,
    currency: 'XOF',
    isFree: true,
    modules: [
      { id: 'mod-4', title: 'Tri et collecte', content: 'Les bases du tri sélectif et des circuits de collecte.', duration: '3 jours' },
      { id: 'mod-5', title: 'Recyclage et valorisation', content: 'Comment transformer les déchets en ressources.', duration: '4 jours' },
    ],
    createdAt: '2025-09-15T00:00:00.000Z',
  },
  {
    id: 'fmt-3',
    title: 'Premiers secours en milieu urbain',
    description: 'Formation aux gestes qui sauvent, adaptée aux environnements urbains et aux situations d\'urgence.',
    category: 'SANTE',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5',
    duration: '1 semaine',
    capacity: 30,
    enrolledCount: 8,
    price: 15000,
    currency: 'XOF',
    isFree: false,
    modules: [
      { id: 'mod-6', title: 'Gestes de base', content: 'Les gestes essentiels : position latérale de sécurité, massage cardiaque.', duration: '2 jours' },
      { id: 'mod-7', title: 'Situations d\'urgence', content: 'Gestion des accidents de la route, malaises, blessures.', duration: '3 jours' },
    ],
    createdAt: '2025-11-01T00:00:00.000Z',
  },
  {
    id: 'fmt-4',
    title: 'Espaces verts et aménagement durable',
    description: 'Découvrez comment intégrer la nature au cœur des villes pour un urbanisme durable et résilient.',
    category: 'ENVIRONNEMENT',
    imageUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959',
    duration: '3 semaines',
    capacity: 75,
    enrolledCount: 30,
    price: 0,
    currency: 'XOF',
    isFree: true,
    modules: [
      { id: 'mod-8', title: 'Urbanisme vert', content: 'Principes d\'intégration des espaces verts en ville.', duration: '1 semaine' },
      { id: 'mod-9', title: 'Entretien et gestion', content: 'Techniques d\'entretien durable des espaces verts.', duration: '1 semaine' },
    ],
    createdAt: '2025-08-20T00:00:00.000Z',
  },
  {
    id: 'fmt-5',
    title: 'Maintenance des équipements urbains',
    description: 'Formation pratique à la maintenance et à la réparation des équipements et mobiliers urbains.',
    category: 'INFRASTRUCTURE',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
    duration: '5 semaines',
    capacity: 40,
    enrolledCount: 5,
    price: 35000,
    currency: 'XOF',
    isFree: false,
    modules: [
      { id: 'mod-10', title: 'Diagnostic des pannes', content: 'Méthodes de diagnostic rapide pour les équipements urbains.', duration: '1 semaine' },
      { id: 'mod-11', title: 'Réparation courante', content: 'Interventions de base sur le mobilier urbain.', duration: '2 semaines' },
      { id: 'mod-12', title: 'Maintenance préventive', content: 'Planification et exécution de la maintenance préventive.', duration: '2 semaines' },
    ],
    createdAt: '2025-10-15T00:00:00.000Z',
  },
  {
    id: 'fmt-6',
    title: 'Hygiène et sécurité au travail',
    description: 'Les fondamentaux de la prévention des risques professionnels dans le secteur de la signalétique et de l\'affichage.',
    category: 'SANTE',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    duration: '1 semaine',
    capacity: 60,
    enrolledCount: 22,
    price: 0,
    currency: 'XOF',
    isFree: true,
    modules: [
      { id: 'mod-13', title: 'Risques professionnels', content: 'Identifier et prévenir les risques liés au travail en hauteur et à la manipulation de charges.', duration: '2 jours' },
      { id: 'mod-14', title: 'Équipements de protection', content: 'Choix et utilisation des EPI adaptés.', duration: '2 jours' },
    ],
    createdAt: '2025-11-10T00:00:00.000Z',
  },
];

// userId -> [{ formationId, progress: number, enrolledAt }]
const enrollments = {};

// ─── Middleware auth (optionnel) ────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token d\'accès manquant' });
  }

  const token = authHeader.slice(7);
  try {
    const secret = process.env.AANID_ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';
    const payload = jwt.verify(token, secret, { issuer: 'aanid', audience: 'aanid-app' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /formations
router.get('/formations', (req, res) => {
  const { category, isFree } = req.query;
  let filtered = formations;

  if (category && category !== 'toutes') {
    filtered = filtered.filter(f => f.category === category.toUpperCase());
  }
  if (isFree !== undefined) {
    const free = isFree === 'true';
    filtered = filtered.filter(f => f.isFree === free);
  }

  res.json(filtered);
});

// GET /formations/:id
router.get('/formations/:id', (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user?.sub;
  const isEnrolled = userId && enrollments[userId]?.some(e => e.formationId === formation.id);

  res.json({ ...formation, isEnrolled: !!isEnrolled });
});

// POST /formations/:id/enroll
router.post('/formations/:id/enroll', authenticateToken, (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user.sub;

  if (!enrollments[userId]) enrollments[userId] = [];
  if (enrollments[userId].some(e => e.formationId === formation.id)) {
    return res.status(409).json({ error: 'Vous êtes déjà inscrit à cette formation' });
  }
  if (formation.enrolledCount >= formation.capacity) {
    return res.status(400).json({ error: 'Cette formation est complète' });
  }

  formation.enrolledCount++;
  enrollments[userId].push({ formationId: formation.id, progress: 0, enrolledAt: new Date().toISOString() });

  res.status(201).json({ message: 'Inscription réussie', formationId: formation.id });
});

// GET /formations/mine
router.get('/formations/mine', authenticateToken, (req, res) => {
  const userId = req.user.sub;
  const userEnrollments = enrollments[userId] || [];

  const result = userEnrollments.map(e => {
    const formation = formations.find(f => f.id === e.formationId);
    return formation ? { ...formation, progress: e.progress, enrolledAt: e.enrolledAt } : null;
  }).filter(Boolean);

  res.json(result);
});

// PATCH /formations/:id/progress
router.patch('/formations/:id/progress', authenticateToken, (req, res) => {
  const { progress } = req.body;
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    return res.status(400).json({ error: 'La progression doit être un nombre entre 0 et 100' });
  }

  const userId = req.user.sub;
  const enrollment = enrollments[userId]?.find(e => e.formationId === req.params.id);
  if (!enrollment) {
    return res.status(404).json({ error: 'Vous n\'êtes pas inscrit à cette formation' });
  }

  enrollment.progress = progress;
  res.json({ message: 'Progression mise à jour', formationId: req.params.id, progress });
});

module.exports = router;
