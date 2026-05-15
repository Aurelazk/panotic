import { PrismaClient, FormationCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const formations = [
    {
      title: 'FORMATION SUR LA PANNEAUTIQUE DANS LE DOMAINE PUBLIC (Module 1)',
      description: 'Réforme dans le secteur de la panneautique. Ce module couvre l\'audit, l\'état des lieux, le zonage, le mobilier urbain et la mise en concession.',
      category: FormationCategory.PANNEAUTIQUE,
      duration: '4 semaines',
      capacity: 100,
      isFree: false,
      price: 50000,
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
      content: {
        phases: [
          {
            title: 'I/ Audit & État des lieux',
            steps: [
              { title: '1/ Audit', points: ['Liste exhaustive des acteurs', 'Examen des droits d\'exploitation'] },
              { title: '2/ État des lieux', points: ['Relevé précis des supports', 'Plan piquet géolocalisable'] }
            ]
          }
        ]
      }
    },
    {
      title: 'STRATÉGIE VILLE VERTE : URBANISME DURABLE',
      description: 'Comment intégrer la nature au cœur de nos villes pour un futur durable.',
      category: FormationCategory.ENVIRONNEMENT,
      duration: '2 semaines',
      capacity: 50,
      isFree: true,
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1449156059539-798052149959',
    }
  ];

  for (const f of formations) {
    await prisma.formation.upsert({
      where: { id: 'fixed-id-' + f.category }, // Simplified for seeding
      update: {},
      create: {
        ...f,
        id: undefined, // Let prisma generate it if not using fixed id
      },
    });
  }

  // Seed Panels
  const panels = [
    { type: 'CLASSIQUE', format: '4x3', lat: 6.3653, lng: 2.4183, etat: 'DISPONIBLE' },
    { type: 'DIGITAL', format: 'Ecran LED', lat: 6.3700, lng: 2.4200, etat: 'LOUE' },
    { type: 'ABRIBUS', format: 'Standard', lat: 6.3600, lng: 2.4150, etat: 'MAINTENANCE' },
  ];

  for (const p of panels) {
    await prisma.panel.create({ data: p as any });
  }

  // Seed Zones
  const zones = [
    {
      name: 'Zone Commerciale Cotonou',
      type: 'commerciale',
      boundary: {
        coordinates: [[
          [2.4100, 6.3600], [2.4300, 6.3600], [2.4300, 6.3700], [2.4100, 6.3700], [2.4100, 6.3600]
        ]]
      }
    }
  ];

  for (const z of zones) {
    await prisma.zone.create({ data: z });
  }

  console.log('Seeding complete! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
