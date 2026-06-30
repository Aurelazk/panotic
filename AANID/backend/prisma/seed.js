/**
 * Seed Neon/Postgres avec les données de démo des modules AANID.
 * Les routes HTTP utilisent encore les stores en mémoire des modules ;
 * ce seed prépare la persistance pour la migration progressive.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VILLES = [
  {
    id: 'cotonou',
    nom: 'Cotonou',
    pays: 'Bénin',
    region: 'Littoral',
    lat: 6.3703,
    lng: 2.3912,
    description: 'Capitale économique du Bénin',
    population: 679012,
    superficie: 79,
    couleur: '#C19A6B',
    favorisCount: 128,
    rubriques: [
      { id: 'relais', label: 'Relais Publicitaire', count: 8, icon: 'megaphone', color: '#F5A623', description: 'Panneaux disponibles' },
      { id: 'formations', label: 'Formations', count: 12, icon: 'book', color: '#3BB273', description: 'Cours disponibles' },
      { id: 'etats', label: 'États des Lieux', count: 5, icon: 'clipboard', color: '#E94E3C', description: 'Rapports récents' },
      { id: 'posts', label: 'Posts', count: 24, icon: 'message-square', color: '#1E73BE', description: 'Publications' },
    ],
    stats: {
      signalements: { total: 45, resolus: 32, enAttente: 13 },
      panneaux: { total: 156, disponibles: 89, loues: 52, maintenance: 15 },
      formations: { total: 12, gratuites: 7, payantes: 5 },
      utilisateurs: 3420,
    },
  },
  {
    id: 'porto-novo',
    nom: 'Porto-Novo',
    pays: 'Bénin',
    region: 'Ouémé',
    lat: 6.4969,
    lng: 2.6289,
    description: 'Capitale administrative du Bénin',
    population: 264320,
    superficie: 110,
    couleur: '#6E8B5B',
    favorisCount: 67,
    rubriques: [],
    stats: {
      signalements: { total: 28, resolus: 20, enAttente: 8 },
      panneaux: { total: 98, disponibles: 60, loues: 30, maintenance: 8 },
      formations: { total: 8, gratuites: 5, payantes: 3 },
      utilisateurs: 1890,
    },
  },
];

const FORMATIONS = [
  {
    id: 'fmt-1',
    title: 'Conception et installation de panneaux publicitaires',
    description: "Maîtrisez les techniques de conception et d'installation des panneaux publicitaires.",
    category: 'PANNEAUTIQUE',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
    duration: '4 semaines',
    capacity: 50,
    enrolledCount: 12,
    price: 25000,
    currency: 'XOF',
    isFree: false,
    modules: [
      { id: 'mod-1', title: 'Normes et réglementations', content: 'Introduction aux normes.', duration: '1 semaine', imageUrl: null },
    ],
  },
  {
    id: 'fmt-2',
    title: 'Gestion des déchets urbains',
    description: 'Bonnes pratiques de gestion des déchets en milieu urbain.',
    category: 'ENVIRONNEMENT',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b',
    duration: '2 semaines',
    capacity: 100,
    enrolledCount: 45,
    price: 0,
    currency: 'XOF',
    isFree: true,
    modules: [
      { id: 'mod-4', title: 'Tri et collecte', content: 'Les bases du tri sélectif.', duration: '3 jours', imageUrl: null },
    ],
  },
];

async function main() {
  console.log('🌱 Seed AANID → Neon/Postgres');

  for (const v of VILLES) {
    await prisma.ville.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }
  console.log(`  ✓ ${VILLES.length} villes`);

  for (const f of FORMATIONS) {
    await prisma.formation.upsert({
      where: { id: f.id },
      update: { ...f, modules: f.modules },
      create: { ...f, modules: f.modules },
    });
  }
  console.log(`  ✓ ${FORMATIONS.length} formations`);

  console.log('✅ Seed terminé');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
