const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fedapay = require('./fedapay');

const router = express.Router();

const SECRET = process.env.AANID_ACCESS_SECRET || 'dev-only-access-secret-CHANGE-ME';

// Documents PDF des formations
router.use('/formations/assets', express.static(path.join(__dirname, '../assets/formations')));

// ─── Données mock ───────────────────────────────────────────────────────────

const CATEGORIES = ['PANNEAUTIQUE', 'ENVIRONNEMENT', 'SANTE', 'INFRASTRUCTURE'];

const formations = [
  {
    id: 'fmt-1',
    title: 'Formation sur la panneautique : domaine public',
    description: "Module 1 de la formation officielle AANID sur la panneautique (domaine public) : introduction, réorganisation et réaménagement du secteur d'exploitation des panneaux publicitaires, évaluation du système, mise à jour et questionnaire.",
    category: 'PANNEAUTIQUE',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    duration: 'Module 1',
    capacity: 200,
    enrolledCount: 18,
    price: 0,
    currency: 'XOF',
    isFree: true,
    version: '1.0',
    pdfUrl: '/formations/assets/panneautique-v1.pdf',
    modules: [
      {
        id: 'fmt1-ch1-lecon1',
        title: 'Chapitre 1 : Introduction — Leçon 1 : Le panneau publicitaire et son importance dans la vie socio-économique d\'un pays',
        content: "Présentation\n\nLa panneautique en tant qu'ensemble des moyens et techniques d'installation et de gestion des panneaux publicitaires est un véritable corps de métier dont l'étude est pluridisciplinaire.\n\nL'exploitation des panneaux publicitaires est une activité qui booste la concurrence entre les entreprises. Ce faisant, elle propulse l'économie grâce à l'accroissement et à l'amélioration de la compétitivité des différents acteurs de la vie économique d'un pays.\n\nComment l'exploitation des panneaux publicitaires booste-t-elle la concurrence ?\n\nVecteur de publicité, le panneau publicitaire stimule et encourage la consommation. Lorsque l'activité d'exploitation de panneaux publicitaires est bien réglementée et bien encadrée, les normes d'exercice de celle-ci garantissent l'équité dans la gestion du secteur par les autorités compétentes.\n\nIl convient toutefois de rappeler qu'on ne paie pas pour regarder un panneau publicitaire : le panneau publicitaire est le support de publicité par excellence. Cet atout intemporel fait de ce support un des plus populaires de tous les temps. Sinon le plus populaire !\n\nEn outre, par leurs aménagements, les panneaux publicitaires contribuent à l'embellissement des villes. Bien visible dans l'espace public, le panneau publicitaire participe au décor de celui-ci. Dès lors, il importe que le choix des supports ne soit plus motivé seulement par leurs aspects, leur design, mais aussi par des critères qui font qu'à la fonction première de ceux-ci s'ajoute un besoin d'esthétique pour un environnement et un cadre de vie plus beau et plus agréable à la vue.",
        duration: '15 min',
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
      },
      {
        id: 'fmt1-ch1-lecon2',
        title: 'Chapitre 1 : Introduction — Leçon 2 : Constat général',
        content: "Dans beaucoup de villes à travers le monde (l'Afrique en est un bel exemple), il est fréquent de constater, et parfois dans des capitales, des cas de pléthore de panneaux publicitaires cause de pollution visuelle, d'insalubrité et d'insécurité pour des personnes et des biens. Un secteur d'exploitation des panneaux publicitaires mal organisé, mal encadré ou pas encadré du tout où règnent l'anarchie et le désordre en est la source.\n\nDans un environnement tel que celui que nous venons de décrire, l'exploitation des panneaux publicitaires devient source de maux.\n\nL'état délabré et obsolète des supports, l'absence de normes et de réglementations sont cause de la contre-productivité du secteur et facteur de dégradation de l'environnement.\n\nIl importe donc, pour le rayonnement du secteur et pour sa contribution effective au développement socio-économique des villes, que des mesures adéquates soient prises.",
        duration: '10 min',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
      },
      {
        id: 'fmt1-ch2-lecon3',
        title: 'Chapitre 2 : Réorganisation et Réaménagement du secteur — Leçon 3 : Différentes étapes (Audit, État des lieux, Zonage)',
        content: "Les différentes étapes pour une bonne réorganisation et un aménagement réussi du secteur d'exploitation des panneaux publicitaires sont :\n\n3.1/ Audit.\nAfin de permettre que l'activité d'exploitation des panneaux publicitaires participe au rayonnement d'une ville (ou d'un pays), il faut faire un audit de la gestion en cours. Il consiste :\n3.1.1/ en l'établissement de la liste exhaustive de tous les acteurs (entreprise ou personne exploitant des panneaux à des fins publicitaires),\n3.1.2/ en l'examen du mécanisme d'attribution des supports et du cahier des charges.\n\n3.2/ État des lieux.\n3.2.1/ Faire le relevé (GPS) détaillé et précis de l'ensemble des panneaux publicitaires présents,\n3.2.2/ Établir le plan piquet géolocalisable de ceux-ci.\n\n3.3/ Zonage.\nPour parvenir à un réaménagement optimal du plan d'implantation des panneaux publicitaires, il faut effectuer des délimitations suivant des normes spécifiques du territoire et proposer des supports facteurs d'embellissement et symboles de modernité.\n\nLe but du zonage est de créer les conditions pour un développement harmonieux et équilibré du paysage de l'affichage publicitaire ainsi que l'établissement de grilles tarifaires en adéquation avec les réalités économiques des villes. Il consiste donc à délimiter des espaces à cette fin.",
        duration: '20 min',
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
      },
      {
        id: 'fmt1-ch2-etapes4a7',
        title: 'Chapitre 2 (suite) : Constitution des lots, Mise en concession, Attribution et Gestion des régies',
        content: "4/ Constitution des lots.\nLe terme « Mobilier Urbain de Publicité » vient s'inscrire dans un contexte où les panneaux publicitaires ne sont plus que des supports à des fins de publicité mais de véritables objets (ou meubles) d'embellissement et de décoration des villes.\n\nIl s'ensuit que la réorganisation du secteur d'exploitation des panneaux publicitaires intègre un besoin d'embellissement et de modernisation du cadre de vie des populations.\n\nAprès études et validation des supports devant être pris en compte dans le cadre du réaménagement, nous procéderons à la constitution des lots devant faire objet d'appels d'offres pour la mise en concession des différents espaces publicitaires. La constitution des lots est faite de manière à garantir l'équilibre des espaces et celui en matière de type de support des différentes régies publicitaires.\n\n5/ Mise en concession des espaces publicitaires.\nLa technique de mise en concession des espaces publicitaires est variable. Elle est fonction des réalités économiques, politico-administratives et de la législation en vigueur dans chaque pays. (NB : il faut partir d'exemples précis et traiter le sujet au cas par cas.)\n\n6/ Attribution des espaces publicitaires.\nL'attribution des espaces aux régies publicitaires est faite sur la base du cahier des charges contenu dans le dossier d'appel d'offres.\n\n7/ Gestion des régies publicitaires.\nLa gestion des régies publicitaires est faite dans certains pays par les collectivités locales. Dans d'autres, elle est du ressort du Gouvernement par l'intermédiaire du Ministère de la Communication, etc. Plus généralement il faut retenir que c'est selon les textes et dispositions en vigueur dans chaque pays. L'essentiel est que la transparence, le professionnalisme et l'efficience soient rigoureusement observés.",
        duration: '20 min',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
      },
      {
        id: 'fmt1-ch3',
        title: "Chapitre 3 : Évaluation du système d'exploitation des supports / Mobilier Urbain de Publicité",
        content: "Afin de garantir un développement harmonieux du secteur d'exploitation des panneaux publicitaires / Mobilier Urbain de Publicité, il faut dans les réformes prévoir un mécanisme d'évaluation de l'ensemble du processus depuis l'audit à la gestion des régies publicitaires.\n\nLe mécanisme d'évaluation doit être scientifiquement soutenable avec une autonomie certaine dans son pilotage.\n\nL'évaluation permet de prévenir les risques de dérapage et de sécuriser les intérêts des différents acteurs du secteur et des populations à travers leur cadre de vie sur le long terme.",
        duration: '10 min',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
      },
      {
        id: 'fmt1-ch4',
        title: 'Chapitre 4 : Mise à jour',
        content: "La mise à jour du secteur d'exploitation des panneaux publicitaires / Mobilier Urbain de Publicité est importante pour pérenniser les acquis de développement de l'activité.\n\nElle est importante aussi pour le rayonnement des villes par l'exploitation des supports de publicité et favorisera l'essor de l'activité en adéquation avec l'urbanisation.\n\nElle consiste à s'assurer que le secteur d'exploitation des panneaux publicitaires / Mobilier Urbain de Publicité, dans son évolution, soit en phase avec celle démographique et le développement infrastructurel des villes.",
        duration: '10 min',
        imageUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959',
      },
      {
        id: 'fmt1-questionnaire',
        title: 'Questionnaires (module 1)',
        content: "Définitions :\n\n1/ Panneautique.\n2/ Zonage.\n3/ Mobilier Urbain de Publicité.\n4/ Régie publicitaire.\n5/ Pollution visuelle (dans le cadre de l'exploitation des panneaux publicitaires).\n\nQuestions :\n\n6/ En quoi consiste une réorganisation du secteur d'exploitation des panneaux publicitaires ?\n7/ En quoi consiste le réaménagement de l'espace publicitaire d'une ville du point de vue de l'exploitation du Mobilier Urbain de Publicité ?\n8/ Comment prévenir la pollution visuelle due à l'exploitation des panneaux publicitaires ?\n9/ Comment s'assurer d'une bonne rentabilité et de la pérennité du secteur d'exploitation des panneaux publicitaires ?\n10/ Peut-on installer un panneau publicitaire n'importe où ? Pourquoi ?\n11/ Quelle est l'importance du panneau publicitaire dans une ville ?\n12/ N'importe qui peut-il exercer l'activité d'exploitation de panneaux publicitaires ?",
        duration: '20 min',
        imageUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b',
      },
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
      { id: 'mod-4', title: 'Tri et collecte', content: 'Les bases du tri sélectif et des circuits de collecte. Comprenez les différentes catégories de déchets et les bonnes pratiques pour une collecte efficace en milieu urbain.', duration: '3 jours', imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b' },
      { id: 'mod-5', title: 'Recyclage et valorisation', content: 'Comment transformer les déchets en ressources. Explorez les filières de recyclage et les techniques de valorisation matière et énergétique.', duration: '4 jours', imageUrl: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3' },
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
      { id: 'mod-6', title: 'Gestes de base', content: 'Les gestes essentiels : position latérale de sécurité, massage cardiaque. Apprenez les techniques de premiers secours qui peuvent sauver des vies en attendant l\'arrivée des secours.', duration: '2 jours', imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5' },
      { id: 'mod-7', title: "Situations d'urgence", content: 'Gestion des accidents de la route, malaises, blessures. Développez les réflexes nécessaires pour intervenir efficacement dans les situations critiques.', duration: '3 jours', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d' },
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
      { id: 'mod-8', title: 'Urbanisme vert', content: "Principes d'intégration des espaces verts en ville. Découvrez comment concevoir des espaces urbains qui intègrent la nature pour un cadre de vie plus agréable et durable.", duration: '1 semaine', imageUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959' },
      { id: 'mod-9', title: 'Entretien et gestion', content: "Techniques d'entretien durable des espaces verts. Apprenez les méthodes écologiques pour maintenir et gérer les espaces verts urbains.", duration: '1 semaine', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b' },
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
      { id: 'mod-10', title: 'Diagnostic des pannes', content: 'Méthodes de diagnostic rapide pour les équipements urbains. Identifiez les causes des dysfonctionnements et apprenez à établir un diagnostic précis.', duration: '1 semaine', imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837' },
      { id: 'mod-11', title: 'Réparation courante', content: 'Interventions de base sur le mobilier urbain. Maîtrisez les techniques de réparation des équipements les plus courants.', duration: '2 semaines', imageUrl: 'https://images.unsplash.com/photo-1572987789307-8e5f90a88311' },
      { id: 'mod-12', title: 'Maintenance préventive', content: 'Planification et exécution de la maintenance préventive. Établissez des calendriers de maintenance pour prolonger la durée de vie des équipements.', duration: '2 semaines', imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952' },
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
      { id: 'mod-13', title: 'Risques professionnels', content: 'Identifier et prévenir les risques liés au travail en hauteur et à la manipulation de charges. Formez-vous aux bonnes pratiques de sécurité sur le terrain.', duration: '2 jours', imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab' },
      { id: 'mod-14', title: 'Équipements de protection', content: 'Choix et utilisation des EPI adaptés. Découvrez les équipements de protection individuelle indispensables pour travailler en toute sécurité.', duration: '2 jours', imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc' },
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
  const { category, isFree, page, limit } = req.query;
  let filtered = formations;

  if (category && category !== 'toutes') {
    filtered = filtered.filter(f => f.category === category.toUpperCase());
  }
  if (isFree !== undefined) {
    const free = isFree === 'true';
    filtered = filtered.filter(f => f.isFree === free);
  }

  const total = filtered.length;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, parseInt(limit) || total || 10);
  const start = (pageNum - 1) * limitNum;
  const data = filtered.slice(start, start + limitNum);
  const hasMore = start + limitNum < total;

  res.json({ data, total, page: pageNum, limit: limitNum, hasMore });
});

// GET /formations/mine (doit être AVANT /formations/:id)
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

// GET /formations/mine/badges (doit être AVANT /formations/:id)
router.get('/formations/mine/badges', authenticateToken, (req, res) => {
  const userId = req.user.sub;
  res.json(userBadges[userId] || []);
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

// POST /formations/:id/unenroll
router.post('/formations/:id/unenroll', authenticateToken, (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user.sub;
  if (!enrollments[userId]) {
    return res.status(404).json({ error: "Vous n'êtes pas inscrit à cette formation" });
  }

  const idx = enrollments[userId].findIndex(e => e.formationId === formation.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Vous n'êtes pas inscrit à cette formation" });
  }

  enrollments[userId].splice(idx, 1);
  formation.enrolledCount = Math.max(0, formation.enrolledCount - 1);

  if (enrollments[userId].length === 0) {
    delete enrollments[userId];
  }

  res.json({ message: 'Désinscription réussie', formationId: formation.id });
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

// ─── Paiement Mobile Money (FedaPay ou simulation) ──────────────────────────

// Transactions FedaPay en attente : `${formationId}:${userId}` -> transactionId
const pendingTransactions = {};

function recordPayment(formationId, userId, phone, amount, currency, provider) {
  if (!payments[formationId]) payments[formationId] = [];
  payments[formationId].push({
    userId,
    phone,
    amount,
    currency,
    provider,
    paidAt: new Date().toISOString(),
  });
}

// POST /formations/:id/pay
router.post('/formations/:id/pay', authenticateToken, async (req, res) => {
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
  const alreadyPaid = payments[formation.id]?.some(p => p.userId === userId);
  if (alreadyPaid) {
    return res.status(409).json({ error: 'Paiement déjà effectué pour cette formation' });
  }

  if (fedapay.isConfigured()) {
    try {
      const { transactionId, paymentUrl } = await fedapay.createTransaction({
        amount: formation.price,
        description: `AANID — ${formation.title}`,
        phone,
      });
      pendingTransactions[`${formation.id}:${userId}`] = transactionId;
      return res.status(201).json({
        provider: 'fedapay',
        status: 'pending',
        formationId: formation.id,
        transactionId,
        paymentUrl,
        amount: formation.price,
        currency: formation.currency,
        message: 'Transaction créée. Finalisez le paiement sur la page sécurisée FedaPay.',
      });
    } catch (err) {
      return res.status(502).json({ error: `Paiement indisponible : ${err.message}` });
    }
  }

  // Aucune clé FedaPay configurée : simulation (dev / démo)
  recordPayment(formation.id, userId, phone, formation.price, formation.currency, 'simulation');
  res.status(201).json({
    provider: 'simulation',
    status: 'approved',
    message: 'Paiement effectué avec succès',
    formationId: formation.id,
    amount: formation.price,
    currency: formation.currency,
  });
});

// GET /formations/:id/payment-status
router.get('/formations/:id/payment-status', authenticateToken, async (req, res) => {
  const formation = formations.find(f => f.id === req.params.id);
  if (!formation) {
    return res.status(404).json({ error: 'Formation non trouvée' });
  }

  const userId = req.user.sub;
  let paid = payments[formation.id]?.some(p => p.userId === userId) || false;
  let providerStatus = paid ? 'approved' : null;

  // Une transaction FedaPay est en attente : vérifier son statut
  const pendingKey = `${formation.id}:${userId}`;
  const transactionId = pendingTransactions[pendingKey];
  if (!paid && transactionId && fedapay.isConfigured()) {
    try {
      providerStatus = await fedapay.getTransactionStatus(transactionId);
      if (fedapay.isPaidStatus(providerStatus)) {
        recordPayment(formation.id, userId, null, formation.price, formation.currency, 'fedapay');
        delete pendingTransactions[pendingKey];
        paid = true;
      } else if (fedapay.isFailedStatus(providerStatus)) {
        delete pendingTransactions[pendingKey];
      }
    } catch {
      providerStatus = 'unknown';
    }
  }

  res.json({
    formationId: formation.id,
    isFree: formation.isFree,
    isPaid: paid || formation.isFree,
    status: providerStatus,
    amount: formation.price,
    currency: formation.currency,
  });
});

// ─── Abonnements (forfaits AANID) ────────────────────────────────────────────

const SUBSCRIPTION_PLANS = {
  Amateur: { price: 0 },
  Professionnel: { price: 5000 },
  Régie: { price: 25000 },
};

// userId -> { plan, activatedAt } ; transactions en attente : userId -> { plan, transactionId }
const subscriptions = {};
const pendingSubscriptions = {};

// GET /subscriptions/me
router.get('/subscriptions/me', authenticateToken, async (req, res) => {
  const userId = req.user.sub;

  // Vérifier une éventuelle transaction en attente
  const pending = pendingSubscriptions[userId];
  if (pending && fedapay.isConfigured()) {
    try {
      const status = await fedapay.getTransactionStatus(pending.transactionId);
      if (fedapay.isPaidStatus(status)) {
        subscriptions[userId] = { plan: pending.plan, activatedAt: new Date().toISOString() };
        delete pendingSubscriptions[userId];
      } else if (fedapay.isFailedStatus(status)) {
        delete pendingSubscriptions[userId];
      }
    } catch {
      // statut inchangé : on renvoie l'abonnement actuel
    }
  }

  const sub = subscriptions[userId];
  res.json({
    plan: sub?.plan || 'Amateur',
    activatedAt: sub?.activatedAt || null,
    pendingPlan: pendingSubscriptions[userId]?.plan || null,
  });
});

// POST /subscriptions/pay — { plan, phone }
router.post('/subscriptions/pay', authenticateToken, async (req, res) => {
  const { plan, phone } = req.body || {};
  const planDef = SUBSCRIPTION_PLANS[plan];
  if (!planDef) {
    return res.status(400).json({ error: `Forfait invalide. Valeurs possibles : ${Object.keys(SUBSCRIPTION_PLANS).join(', ')}` });
  }
  if (planDef.price === 0) {
    return res.status(400).json({ error: 'Ce forfait est gratuit' });
  }
  if (!phone) {
    return res.status(400).json({ error: 'Numéro de téléphone requis' });
  }

  const userId = req.user.sub;
  if (subscriptions[userId]?.plan === plan) {
    return res.status(409).json({ error: 'Vous êtes déjà abonné à ce forfait' });
  }

  if (fedapay.isConfigured()) {
    try {
      const { transactionId, paymentUrl } = await fedapay.createTransaction({
        amount: planDef.price,
        description: `AANID — Abonnement ${plan}`,
        phone,
      });
      pendingSubscriptions[userId] = { plan, transactionId };
      return res.status(201).json({
        provider: 'fedapay',
        status: 'pending',
        plan,
        transactionId,
        paymentUrl,
        amount: planDef.price,
        currency: 'XOF',
      });
    } catch (err) {
      return res.status(502).json({ error: `Paiement indisponible : ${err.message}` });
    }
  }

  // Simulation sans clé FedaPay
  subscriptions[userId] = { plan, activatedAt: new Date().toISOString() };
  res.status(201).json({
    provider: 'simulation',
    status: 'approved',
    plan,
    amount: planDef.price,
    currency: 'XOF',
    message: 'Abonnement activé',
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
