const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET = process.env.AANID_ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';

// ─── Données mock ───────────────────────────────────────────────────────────

const CATEGORIES = ['PANNEAUTIQUE', 'ENVIRONNEMENT', 'SANTE', 'INFRASTRUCTURE'];

const formations = [
  {
    id: 'fmt-1',
    title: 'Conception et installation de panneaux publicitaires',
    description: "Maîtrisez les techniques de conception et d'installation des panneaux publicitaires conformément aux normes en vigueur.",
    category: 'PANNEAUTIQUE',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    duration: '4 semaines',
    capacity: 50,
    enrolledCount: 12,
    price: 25000,
    currency: 'XOF',
    isFree: false,
    modules: [
      { id: 'mod-1', title: 'Normes et réglementations', content: "Introduction aux normes en vigueur pour l'affichage publicitaire en milieu urbain.", duration: '1 semaine' },
      { id: 'mod-2', title: 'Design graphique', content: 'Principes de conception graphique appliqués aux panneaux publicitaires.', duration: '2 semaines' },
      { id: 'mod-3', title: 'Installation et maintenance', content: "Techniques d'installation sécurisée et maintenance préventive.", duration: '1 semaine' },
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
    description: "Formation aux gestes qui sauvent, adaptée aux environnements urbains et aux situations d'urgence.",
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
      { id: 'mod-7', title: "Situations d'urgence", content: 'Gestion des accidents de la route, malaises, blessures.', duration: '3 jours' },
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
      { id: 'mod-8', title: 'Urbanisme vert', content: "Principes d'intégration des espaces verts en ville.", duration: '1 semaine' },
      { id: 'mod-9', title: 'Entretien et gestion', content: "Techniques d'entretien durable des espaces verts.", duration: '1 semaine' },
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

// userId -> [{ formationId, modulesCompleted: string[], enrolledAt, completedAt? }]
const enrollments = {};

// payments: formationId -> { userId, phone, amount, paidAt }
const payments = {};

// badges earned
const userBadges = {};

// ─── Middleware auth ─────────────────────────────────────────────────────────

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Token d'accès manquant" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET, { issuer: 'aanid', audience: 'aanid-app' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ─── Routes formations ───────────────────────────────────────────────────────

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

  const userId = req.headers['authorization'] ? getUserFromToken(req) : null;
  const isEnrolled = userId && enrollments[userId]?.some(e => e.formationId === formation.id);
  const userEnrollment = userId ? enrollments[userId]?.find(e => e.formationId === formation.id) : null;

  res.json({
    ...formation,
    isEnrolled: !!isEnrolled,
    userProgress: userEnrollment ? {
      modulesCompleted: userEnrollment.modulesCompleted,
      completedAt: userEnrollment.completedAt || null,
      enrolledAt: userEnrollment.enrolledAt,
    } : null,
  });
});

function getUserFromToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.slice(7), SECRET, { issuer: 'aanid', audience: 'aanid-app' }).sub;
  } catch {
    return null;
  }
}

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
  enrollments[userId].push({
    formationId: formation.id,
    modulesCompleted: [],
    enrolledAt: new Date().toISOString(),
    completedAt: null,
  });

  res.status(201).json({ message: 'Inscription réussie', formationId: formation.id });
});

// GET /formations/mine
router.get('/formations/mine', authenticateToken, (req, res) => {
  const userId = req.user.sub;
  const userEnrollments = enrollments[userId] || [];

  const result = userEnrollments.map(e => {
    const formation = formations.find(f => f.id === e.formationId);
    if (!formation) return null;
    const totalModules = formation.modules.length;
    const completedCount = e.modulesCompleted.length;
    const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    return {
      ...formation,
      modulesCompleted: e.modulesCompleted,
      progress,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    };
  }).filter(Boolean);

  res.json(result);
});

// PATCH /formations/:id/progress
router.patch('/formations/:id/progress', authenticateToken, (req, res) => {
  const { moduleId, completed } = req.body;
  if (typeof moduleId !== 'string') {
    return res.status(400).json({ error: 'moduleId requis' });
  }

  const userId = req.user.sub;
  const enrollment = enrollments[userId]?.find(e => e.formationId === req.params.id);
  if (!enrollment) {
    return res.status(404).json({ error: 'Vous n\'êtes pas inscrit à cette formation' });
  }

  const formation = formations.find(f => f.id === req.params.id);
  const moduleExists = formation?.modules.some(m => m.id === moduleId);
  if (!moduleExists) {
    return res.status(400).json({ error: 'Module invalide' });
  }

  if (completed === true) {
    if (!enrollment.modulesCompleted.includes(moduleId)) {
      enrollment.modulesCompleted.push(moduleId);
    }
  } else {
    enrollment.modulesCompleted = enrollment.modulesCompleted.filter(id => id !== moduleId);
  }

  const totalModules = formation.modules.length;
  const completedCount = enrollment.modulesCompleted.length;
  const progress = Math.round((completedCount / totalModules) * 100);

  if (progress === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date().toISOString();
    awardBadge(userId, req.params.id);
  }

  res.json({
    message: 'Progression mise à jour',
    formationId: req.params.id,
    moduleId,
    modulesCompleted: enrollment.modulesCompleted,
    progress,
    completedAt: enrollment.completedAt,
  });
});

// ─── Badges ──────────────────────────────────────────────────────────────────

function awardBadge(userId, formationId) {
  const formation = formations.find(f => f.id === formationId);
  if (!formation) return;

  if (!userBadges[userId]) userBadges[userId] = [];

  const existing = userBadges[userId].find(b => b.formationId === formationId && b.type === 'completion');
  if (existing) return;

  userBadges[userId].push({
    formationId,
    formationTitle: formation.title,
    type: 'completion',
    label: `${formation.title} — Réussi`,
    earnedAt: new Date().toISOString(),
  });
}

// GET /formations/mine/badges
router.get('/formations/mine/badges', authenticateToken, (req, res) => {
  const userId = req.user.sub;
  res.json(userBadges[userId] || []);
});

// ─── Paiement Mobile Money ───────────────────────────────────────────────────

// POST /formations/:id/pay
router.post('/formations/:id/pay', authenticateToken, (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }

  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }
  if (formation.isFree) {
    return res.status(400).json({ error: 'Cette formation est gratuite' });
  }

  const userId = req.user.sub;
  if (!payments[formation.id]) payments[formation.id] = [];

  const alreadyPaid = payments[formation.id].some(p => p.userId === userId);
  if (alreadyPaid) {
    return res.status(409).json({ error: 'Paiement déjà effectué pour cette formation' });
  }

  payments[formation.id].push({
    userId,
    phone,
    amount: formation.price,
    currency: formation.currency,
    paidAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: 'Paiement effectué avec succès',
    formationId: formation.id,
    amount: formation.price,
    currency: formation.currency,
  });
});

// GET /formations/:id/payment-status
router.get('/formations/:id/payment-status', authenticateToken, (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user.sub;
  const paid = payments[formation.id]?.some(p => p.userId === userId) || false;

  res.json({
    formationId: formation.id,
    isFree: formation.isFree,
    isPaid: paid || formation.isFree,
    amount: formation.price,
    currency: formation.currency,
  });
});

// ─── Données villes (Afrique de l'Ouest) ──────────────────────────────────────

const villes = [
  // 🇧🇯 BÉNIN
  {
    id: 'cotonou', nom: 'Cotonou', pays: 'Bénin', region: 'Littoral',
    lat: 6.3653, lng: 2.4183,
    description: 'Capitale économique du Bénin et principal pôle urbain. Centre névralgique de la panneautique et de la publicité urbaine en Afrique de l\'Ouest.',
    population: 1200000, superficie: 79,
    couleur: '#1E73BE',
    favorisCount: 245,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 8, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 12, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 24, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 45, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 24, resolus: 18, enAttente: 6 },
      panneaux: { total: 68, disponibles: 22, loues: 35, maintenance: 11 },
      formations: { total: 12, gratuites: 7, payantes: 5 },
      utilisateurs: 1520,
    },
  },
  {
    id: 'porto-novo', nom: 'Porto-Novo', pays: 'Bénin', region: 'Ouémé',
    lat: 6.4969, lng: 2.6289,
    description: 'Capitale politique du Bénin, riche en patrimoine historique. Ville en pleine modernisation de son mobilier urbain.',
    population: 300000, superficie: 52,
    couleur: '#8E44AD',
    favorisCount: 98,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 3, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 5, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 11, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 18, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyens' },
    ],
    stats: {
      signalements: { total: 11, resolus: 7, enAttente: 4 },
      panneaux: { total: 28, disponibles: 9, loues: 14, maintenance: 5 },
      formations: { total: 5, gratuites: 3, payantes: 2 },
      utilisateurs: 420,
    },
  },
  {
    id: 'parakou', nom: 'Parakou', pays: 'Bénin', region: 'Borgou',
    lat: 9.3371, lng: 2.6213,
    description: 'Plus grande ville du nord Bénin, carrefour commercial et hub agricole majeur.',
    population: 260000, superficie: 35,
    couleur: '#E67E22',
    favorisCount: 45,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 2, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 3, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 7, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 10, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 7, resolus: 4, enAttente: 3 },
      panneaux: { total: 15, disponibles: 5, loues: 8, maintenance: 2 },
      formations: { total: 3, gratuites: 2, payantes: 1 },
      utilisateurs: 180,
    },
  },

  // 🇨🇮 CÔTE D'IVOIRE
  {
    id: 'abidjan', nom: 'Abidjan', pays: "Côte d'Ivoire", region: 'Abidjan',
    lat: 5.3600, lng: -4.0083,
    description: 'Capitale économique ivoirienne et l\'une des métropoles les plus dynamiques d\'Afrique de l\'Ouest. Pôle majeur de la publicité urbaine.',
    population: 5600000, superficie: 422,
    couleur: '#1E73BE',
    favorisCount: 312,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 15, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 18, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 35, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 62, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 35, resolus: 25, enAttente: 10 },
      panneaux: { total: 95, disponibles: 30, loues: 50, maintenance: 15 },
      formations: { total: 18, gratuites: 10, payantes: 8 },
      utilisateurs: 3200,
    },
  },
  {
    id: 'yamoussoukro', nom: 'Yamoussoukro', pays: "Côte d'Ivoire", region: 'Yamoussoukro',
    lat: 6.8167, lng: -5.2833,
    description: 'Capitale politique de la Côte d\'Ivoire, connue pour sa célèbre basilique et son urbanisme moderne.',
    population: 355000, superficie: 230,
    couleur: '#8E44AD',
    favorisCount: 67,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 4, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 6, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 9, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 14, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 9, resolus: 6, enAttente: 3 },
      panneaux: { total: 22, disponibles: 7, loues: 12, maintenance: 3 },
      formations: { total: 6, gratuites: 3, payantes: 3 },
      utilisateurs: 210,
    },
  },

  // 🇸🇳 SÉNÉGAL
  {
    id: 'dakar', nom: 'Dakar', pays: 'Sénégal', region: 'Dakar',
    lat: 14.7167, lng: -17.4677,
    description: 'Capitale sénégalaise et l\'un des principaux pôles économiques d\'Afrique francophone. Ville pionnière de la communication urbaine.',
    population: 3800000, superficie: 186,
    couleur: '#F5A623',
    favorisCount: 278,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 12, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 15, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 28, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 52, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 28, resolus: 20, enAttente: 8 },
      panneaux: { total: 82, disponibles: 25, loues: 42, maintenance: 15 },
      formations: { total: 15, gratuites: 8, payantes: 7 },
      utilisateurs: 2800,
    },
  },

  // 🇹🇬 TOGO
  {
    id: 'lome', nom: 'Lomé', pays: 'Togo', region: 'Maritime',
    lat: 6.1319, lng: 1.2228,
    description: 'Capitale togolaise et principal port d\'Afrique de l\'Ouest. Ville en pleine expansion urbaine et commerciale.',
    population: 1500000, superficie: 99,
    couleur: '#3BB273',
    favorisCount: 156,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 6, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 8, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 17, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 30, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 17, resolus: 12, enAttente: 5 },
      panneaux: { total: 40, disponibles: 14, loues: 20, maintenance: 6 },
      formations: { total: 8, gratuites: 5, payantes: 3 },
      utilisateurs: 890,
    },
  },

  // 🇧🇫 BURKINA FASO
  {
    id: 'ouagadougou', nom: 'Ouagadougou', pays: 'Burkina Faso', region: 'Centre',
    lat: 12.3657, lng: -1.5339,
    description: 'Capitale burkinabè, carrefour culturel et politique. Ville engagée dans le développement urbain durable.',
    population: 2500000, superficie: 220,
    couleur: '#E94E3C',
    favorisCount: 134,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 7, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 10, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 20, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 36, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 20, resolus: 14, enAttente: 6 },
      panneaux: { total: 48, disponibles: 16, loues: 25, maintenance: 7 },
      formations: { total: 10, gratuites: 6, payantes: 4 },
      utilisateurs: 1150,
    },
  },

  // 🇬🇭 GHANA
  {
    id: 'accra', nom: 'Accra', pays: 'Ghana', region: 'Greater Accra',
    lat: 5.6037, lng: -0.1870,
    description: 'Capitale ghanéenne, pôle économique et technologique majeur. Métropole cosmopolite en pleine modernisation.',
    population: 4200000, superficie: 200,
    couleur: '#1E73BE',
    favorisCount: 201,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 11, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 14, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 30, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 48, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 30, resolus: 22, enAttente: 8 },
      panneaux: { total: 75, disponibles: 24, loues: 38, maintenance: 13 },
      formations: { total: 14, gratuites: 8, payantes: 6 },
      utilisateurs: 2400,
    },
  },

  // 🇳🇬 NIGERIA
  {
    id: 'lagos', nom: 'Lagos', pays: 'Nigeria', region: 'Lagos',
    lat: 6.5244, lng: 3.3792,
    description: 'Mégalopole nigériane, plus grande ville d\'Afrique et moteur économique du continent. Marché publicitaire le plus dynamique de la région.',
    population: 15000000, superficie: 1171,
    couleur: '#F5A623',
    favorisCount: 425,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 20, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 22, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 50, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 85, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 50, resolus: 35, enAttente: 15 },
      panneaux: { total: 120, disponibles: 35, loues: 65, maintenance: 20 },
      formations: { total: 22, gratuites: 12, payantes: 10 },
      utilisateurs: 5200,
    },
  },
  {
    id: 'abuja', nom: 'Abuja', pays: 'Nigeria', region: 'FCT',
    lat: 9.0579, lng: 7.4951,
    description: 'Capitale fédérale du Nigeria, ville planifiée et moderne. Centre politique et administratif du pays le plus peuplé d\'Afrique.',
    population: 3500000, superficie: 310,
    couleur: '#3BB273',
    favorisCount: 175,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 9, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 13, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 22, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 40, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 22, resolus: 16, enAttente: 6 },
      panneaux: { total: 55, disponibles: 18, loues: 28, maintenance: 9 },
      formations: { total: 13, gratuites: 7, payantes: 6 },
      utilisateurs: 1600,
    },
  },

  // 🇲🇱 MALI
  {
    id: 'bamako', nom: 'Bamako', pays: 'Mali', region: 'Bamako',
    lat: 12.6392, lng: -8.0029,
    description: 'Capitale malienne située sur les rives du fleuve Niger. Carrefour commercial et culturel de l\'Afrique de l\'Ouest.',
    population: 2500000, superficie: 150,
    couleur: '#E67E22',
    favorisCount: 112,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 5, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 7, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 14, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 25, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 14, resolus: 9, enAttente: 5 },
      panneaux: { total: 32, disponibles: 10, loues: 17, maintenance: 5 },
      formations: { total: 7, gratuites: 4, payantes: 3 },
      utilisateurs: 680,
    },
  },

  // 🇳🇪 NIGER
  {
    id: 'niamey', nom: 'Niamey', pays: 'Niger', region: 'Niamey',
    lat: 13.5127, lng: 2.1126,
    description: 'Capitale nigérienne, située sur les berges du fleuve Niger. Ville carrefour du Sahel en pleine mutation urbaine.',
    population: 1300000, superficie: 130,
    couleur: '#8E44AD',
    favorisCount: 78,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 3, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles et opportunités de relais' },
      { id: 'formations', label: 'Formations', count: 4, icon: 'book', color: '#3BB273', description: 'Cours et certifications professionnelles' },
      { id: 'etats', label: 'États des Lieux', count: 8, icon: 'clipboard', color: '#E94E3C', description: 'Signalements et état de la panneautique' },
      { id: 'posts', label: 'Posts / Réseaux', count: 16, icon: 'message-square', color: '#1E73BE', description: 'Fil d\'actualité et discussions citoyennes' },
    ],
    stats: {
      signalements: { total: 8, resolus: 5, enAttente: 3 },
      panneaux: { total: 18, disponibles: 6, loues: 9, maintenance: 3 },
      formations: { total: 4, gratuites: 2, payantes: 2 },
      utilisateurs: 340,
    },
  },
];

// GET /villes
router.get('/villes', (req, res) => {
  const { search } = req.query;
  let result = [...villes];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(v =>
      v.nom.toLowerCase().includes(q) ||
      v.pays.toLowerCase().includes(q) ||
      v.region.toLowerCase().includes(q)
    );
  }

  res.json(result.map(v => ({
    id: v.id,
    nom: v.nom,
    pays: v.pays,
    region: v.region,
    lat: v.lat,
    lng: v.lng,
    description: v.description,
    population: v.population,
    couleur: v.couleur,
    favorisCount: v.favorisCount,
    stats: v.stats,
  })));
});

// GET /villes/:id
router.get('/villes/:id', (req, res) => {
  const ville = villes.find(v => v.id === req.params.id);
  if (!ville) return res.status(404).json({ error: 'Ville non trouvée' });
  res.json(ville);
});

module.exports = router;
