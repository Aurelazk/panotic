import { PrismaClient, FormationCategory, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed users
  const users = [
    { email: 'admin@aanid.com', password: 'admin123', firstName: 'Admin', lastName: 'AANID', role: UserRole.ADMIN, phone: '+2290100000001' },
    { email: 'citoyen@aanid.com', password: 'citoyen123', firstName: 'Jean', lastName: 'Citoyen', role: UserRole.CITOYEN, phone: '+2290100000002' },
    { email: 'pro@aanid.com', password: 'pro123', firstName: 'Marie', lastName: 'Pro', role: UserRole.PROFESSIONNEL, phone: '+2290100000003' },
    { email: 'regie@aanid.com', password: 'regie123', firstName: 'Regie', lastName: 'Publicite', role: UserRole.REGIE, phone: '+2290100000004' },
    { email: 'formateur@aanid.com', password: 'formateur123', firstName: 'Paul', lastName: 'Formateur', role: UserRole.FORMATEUR, phone: '+2290100000005' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hash = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: {
          email: u.email,
          password: hash,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          phone: u.phone,
        },
      });
    }
  }

  console.log(`✅ ${users.length} utilisateurs créés`);

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
    const existing = await prisma.formation.findFirst({
      where: { title: f.title },
    });
    if (existing) continue;
    await prisma.formation.create({ data: f });
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
