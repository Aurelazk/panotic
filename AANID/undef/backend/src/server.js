const express = require('express');
const router = express.Router();

// ============================================
// POSTS / RÉSEAUX
// ============================================

// Base de données en mémoire pour les posts
let posts = [
  {
    id: '1',
    author: '@JeanD',
    avatar: '👤',
    time: '2h ago',
    location: 'Abomey-Calavi',
    text: 'La nouvelle piste cyclable est enfin ouverte ! Une belle avancée pour la mobilité douce.',
    image: null,
    likes: 42,
    comments: [
      { id: 'c1', author: '@PaulT', text: 'Super initiative ! 👍', likes: 3 },
      { id: 'c2', author: '@KoffiB', text: 'Quand est-ce que ça arrive dans notre quartier ?', likes: 1 },
    ],
    shares: 5,
    theme: 'Urbanisme',
    ville: 'Abomey-Calavi',
  },
  {
    id: '2',
    author: '@MarieL',
    avatar: '👤',
    time: '5h ago',
    location: 'Porto-Novo',
    text: 'Signalement: Panneau publicitaire dégradé près du marché.',
    image: null,
    likes: 18,
    comments: [],
    shares: 3,
    theme: 'Environnement',
    ville: 'Porto-Novo',
  },
  {
    id: '3',
    author: '@PaulT',
    avatar: '👤',
    time: '1j ago',
    location: 'Cotonou',
    text: 'Campagne de sensibilisation sur le tri des déchets ce samedi au stade. Venez nombreux ! ♻️',
    image: null,
    likes: 67,
    comments: [],
    shares: 15,
    theme: 'Environnement',
    ville: 'Cotonou',
  },
  {
    id: '4',
    author: '@SophieK',
    avatar: '👤',
    time: '2j ago',
    location: 'Parakou',
    text: 'Atelier santé gratuit pour les seniors ce mercredi à la mairie. Inscriptions ouvertes.',
    image: null,
    likes: 34,
    comments: [],
    shares: 7,
    theme: 'Santé',
    ville: 'Parakou',
  },
  {
    id: '5',
    author: '@AlexD',
    avatar: '👤',
    time: '3j ago',
    location: 'Cotonou',
    text: 'Réunion de quartier sur les projets d\'urbanisme : venez donner votre avis !',
    image: null,
    likes: 25,
    comments: [],
    shares: 4,
    theme: 'Urbanisme',
    ville: 'Cotonou',
  },
];

// GET /posts - Liste des posts avec filtres optionnels
router.get('/posts', (req, res) => {
  const { ville, theme, search } = req.query;
  let result = [...posts];

  if (ville && ville !== 'Toutes') {
    result = result.filter(p => p.ville === ville);
  }
  if (theme && theme !== 'Tous') {
    result = result.filter(p => p.theme === theme);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.text.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: result, count: result.length });
});

// GET /posts/:id - Détail d'un post
router.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post introuvable' });
  res.json({ success: true, data: post });
});

// POST /posts - Créer un post
router.post('/posts', (req, res) => {
  const { text, author, location, theme, ville } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Le texte est obligatoire' });
  }

  const newPost = {
    id: String(Date.now()),
    author: author || '@Anonyme',
    avatar: '👤',
    time: 'À l\'instant',
    location: location || 'Non spécifiée',
    text: text.trim(),
    image: null,
    likes: 0,
    comments: [],
    shares: 0,
    theme: theme || 'Urbanisme',
    ville: ville || 'Cotonou',
  };

  posts.unshift(newPost);
  res.status(201).json({ success: true, data: newPost });
});

// POST /posts/:id/like - Liker un post
router.post('/posts/:id/like', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post introuvable' });
  post.likes += 1;
  res.json({ success: true, data: { likes: post.likes } });
});

// POST /posts/:id/comment - Ajouter un commentaire
router.post('/posts/:id/comment', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post introuvable' });

  const { text, author } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Le commentaire est obligatoire' });
  }

  const newComment = {
    id: `c${Date.now()}`,
    author: author || '@Anonyme',
    text: text.trim(),
    likes: 0,
  };

  post.comments.push(newComment);
  res.status(201).json({ success: true, data: newComment, totalComments: post.comments.length });
});

// DELETE /posts/:id - Supprimer un post
router.delete('/posts/:id', (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Post introuvable' });
  posts.splice(index, 1);
  res.json({ success: true, message: 'Post supprimé' });
});

// ============================================
// CONSULTATION
// ============================================

// Demandes de consultation
let consultations = [];

const SERVICES = [
  {
    id: '1',
    icon: '📊',
    title: 'Études sur la panneautique',
    shortDesc: 'Analyse complète de l\'état actuel de votre panneautique urbaine.',
    desc: 'Analyse approfondie de l\'état actuel de la panneautique dans votre ville.',
    features: [
      'Cartographie précise des panneaux existants',
      'Évaluation de la conformité aux normes',
      'Recommandations d\'amélioration',
      'Rapport PDF détaillé + données brutes',
    ],
  },
  {
    id: '2',
    icon: '🔄',
    title: 'Réforme du secteur publicitaire',
    shortDesc: 'Diagnostic, propositions de nouvelles stratégies, plans d\'action.',
    desc: 'Accompagnement complet pour réformer le secteur de l\'affichage publicitaire.',
    features: [
      'Diagnostic approfondi du secteur',
      'Propositions de nouvelles stratégies',
      'Plans d\'action détaillés',
      'Accompagnement à la mise en œuvre',
    ],
  },
  {
    id: '3',
    icon: '📈',
    title: 'Études de marché',
    shortDesc: 'Analyse de la concurrence, potentiel publicitaire, tarification.',
    desc: 'Études de marché complètes pour évaluer le potentiel publicitaire.',
    features: [
      'Analyse de la concurrence',
      'Évaluation du potentiel publicitaire',
      'Étude de tarification',
      'Tendances et opportunités',
    ],
  },
];

// GET /consultation/services - Liste des services de consultation
router.get('/consultation/services', (req, res) => {
  res.json({ success: true, data: SERVICES });
});

// GET /consultation/services/:id - Détail d'un service
router.get('/consultation/services/:id', (req, res) => {
  const service = SERVICES.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
  res.json({ success: true, data: service });
});

// POST /consultation/request - Soumettre une demande de consultation
router.post('/consultation/request', (req, res) => {
  const { serviceType, clientType, ville, description, budget, email, telephone } = req.body;

  // Validation
  const errors = [];
  if (!serviceType) errors.push('Type de service requis');
  if (!clientType) errors.push('Type de client requis');
  if (!ville) errors.push('Ville requise');
  if (!description) errors.push('Description requise');
  if (!email) errors.push('Email requis');
  if (!telephone) errors.push('Téléphone requis');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants', errors });
  }

  const newRequest = {
    id: `CONS-${Date.now()}`,
    serviceType,
    clientType,
    ville,
    description,
    budget: budget || null,
    email,
    telephone,
    status: 'en_attente',
    createdAt: new Date().toISOString(),
  };

  consultations.push(newRequest);
  res.status(201).json({
    success: true,
    message: 'Votre demande a été envoyée ! Notre équipe vous contactera sous 48h.',
    data: newRequest,
  });
});

// GET /consultation/requests - Liste des demandes (admin)
router.get('/consultation/requests', (req, res) => {
  res.json({ success: true, data: consultations, count: consultations.length });
});

// GET /health - Health check pour le module
router.get('/undef/health', (req, res) => {
  res.json({
    status: 'ok',
    module: 'undef (Posts/Réseaux & Consultation)',
    postsCount: posts.length,
    consultationsCount: consultations.length,
  });
});

module.exports = router;
