import { PrismaClient } from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const COMMON_PASSWORD = 'Password1234!';

const agentDescriptions = [
  'Assistant IA personnalisé pour les PME.',
  'Expert en automatisation de contenu web.',
  'Assistant dédié au support client 24/7.',
  'Votre assistant IA spécialisé en e-commerce.',
  'Outil intelligent pour la gestion de votre site vitrine.',
  'Conseiller virtuel pour freelances et indépendants.',
  'Gestionnaire IA pour portails Next.js et React.',
  'Assistant pour campagnes marketing automatisées.',
];

const agentSkills = [
  'gestion de site vitrine',
  'support IA',
  'Next.js',
  'TypeScript',
  'automatisation marketing',
  'React',
  'Vercel',
  'Node.js',
  'intégration API',
  'gestion de contenu',
];

const agentNames = [
  'SiteHelper',
  'WebGenie',
  'NextAssist',
  'AutoSite',
  'SmartBot',
  'Reacto',
  'VitrineAI',
  'FormulBot',
  'PixelPilot',
];

function getRandomItems<T>(array: T[], count: number): T[] {
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

async function main() {
  console.log('🌱 Démarrage du processus de seed...');

  console.log('🗑️ Suppression des données existantes...');
  await prisma.subscription.deleteMany();
  await prisma.passwordHistory.deleteMany();
  await prisma.forgotPassword.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.tarification.deleteMany();
  await prisma.agentIA.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Données existantes supprimées');

  const genericPassword: string = await bcrypt.hash(COMMON_PASSWORD, 12);
  const adminUser = await prisma.user.create({
    data: {
      firstname: 'Admin',
      lastname: 'Principal',
      email: 'admin@admin.fr',
      phone_number: faker.phone.number(),
      is_cgu_accepted: true,
      is_vgcl_accepted: true,
      theme_mode: 'dark',
      is_email_verified: true,
      role: 'admin',
    },
  });

  await prisma.passwordHistory.create({
    data: {
      password: genericPassword,
      user_id: adminUser.id,
    },
  });

  const siren = faker.string.numeric(9);
  const organizationAdmin = await prisma.organization.create({
    data: {
      name: 'Noku',
      siren,
      siret: `${siren}${faker.string.numeric(5)}`,
      rib: `FR${faker.string.numeric(2)}${faker.string.numeric(10)}${faker.string.numeric(11)}${faker.string.numeric(2)}`,
      vat: `FR${faker.string.numeric(2)}${siren}`,
      createdBy: { connect: { id: adminUser.id } },
      updatedBy: { connect: { id: adminUser.id } },
      users: { connect: { id: adminUser.id } },
    },
  });

  await prisma.agentIA.create({
    data: {
      name: 'WebCreaft AI',
      description:
        'Votre assistante personnelle pour la gestion de site vitrine.',
      url: 'https://localhost:3002',
      isVisible: true,
      skills: [
        'gestion de site vitrine',
        'assistance personnelle',
        'React',
        'Next.js',
        'Vercel',
      ],
      createdBy: { connect: { id: adminUser.id } },
      updatedBy: { connect: { id: adminUser.id } },
      organization: { connect: { id: organizationAdmin.id } },
    },
  });

  console.log(`👑 Admin créé : ${adminUser.email}`);

  console.log('💶 Création des tarifications...');
  const tarificationsData = [
    {
      name: 'Découverte',
      price_monthly: 0.0,
      price_annually: 0.0,
      description: ["Pour découvrir l'outil."],
      token: 5,
    },
    {
      name: 'Essentiel',
      price_monthly: 19.0,
      price_annually: 190.0,
      description: ['Indépendants', 'Freelances'],
      token: 100,
    },
    {
      name: 'Pro',
      price_monthly: 39.0,
      price_annually: 390.0,
      description: ['Petites équipes.', 'Créateur e-commerce'],
      token: 200,
    },
  ];

  for (let i = 0; i < tarificationsData.length; i++) {
    await prisma.tarification.create({
      data: {
        ...tarificationsData[i],
        order: i + 1,
        createdBy: { connect: { id: adminUser.id } },
        updatedBy: { connect: { id: adminUser.id } },
      },
    });
  }

  console.log('✅ Tarifications créées.');
  const tarifications = await prisma.tarification.findMany();

  for (let i = 1; i <= 20; i++) {
    const genericPassword: string = await bcrypt.hash(COMMON_PASSWORD, 12);
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const email = faker.internet
      .email({ firstName: firstname, lastName: lastname })
      .toLowerCase();
    const phone = faker.phone.number();
    const isOrgAdmin = i % 3 === 0;

    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        phone_number: phone,
        is_cgu_accepted: true,
        is_vgcl_accepted: true,
        theme_mode: 'light',
        is_email_verified: true,
        role: isOrgAdmin ? 'organization_admin' : 'user',
      },
    });

    await prisma.passwordHistory.create({
      data: {
        password: genericPassword,
        user_id: user.id,
      },
    });

    console.log(`👤 Utilisateur ${i} : ${user.email} | Rôle : ${user.role}`);

    if (isOrgAdmin) {
      const siren = faker.string.numeric(9);
      const org = await prisma.organization.create({
        data: {
          name: `${firstname} Org`,
          siren,
          siret: `${siren}${faker.string.numeric(5)}`,
          rib: `FR${faker.string.numeric(2)}${faker.string.numeric(10)}${faker.string.numeric(11)}${faker.string.numeric(2)}`,
          vat: `FR${faker.string.numeric(2)}${siren}`,
          createdBy: { connect: { id: user.id } },
          updatedBy: { connect: { id: user.id } },
          users: { connect: { id: user.id } },
        },
      });

      for (let j = 1; j <= 2; j++) {
        const botName =
          agentNames[Math.floor(Math.random() * agentNames.length)];
        const botDescription =
          agentDescriptions[
            Math.floor(Math.random() * agentDescriptions.length)
          ];
        const botSkills = getRandomItems(agentSkills, 4);

        await prisma.agentIA.create({
          data: {
            name: `${botName} ${j}`,
            description: botDescription,
            url: `https://localhost:30${i}${j}`,
            isVisible: true,
            skills: botSkills,
            createdBy: { connect: { id: user.id } },
            updatedBy: { connect: { id: user.id } },
            organization: { connect: { id: org.id } },
          },
        });
      }

      console.log(`🏢 Organisation créée pour ${user.email} avec 2 agents IA.`);
    } else if (i % 2 === 0) {
      const selectedTarif =
        tarifications[Math.floor(Math.random() * tarifications.length)];
      const planType = Math.random() > 0.5 ? 'monthly' : 'annually';

      const end_at = new Date();
      if (planType === 'annually') {
        end_at.setFullYear(end_at.getFullYear() + 1);
      } else {
        end_at.setMonth(end_at.getMonth() + 1);
      }

      await prisma.subscription.create({
        data: {
          user: { connect: { id: user.id } },
          tarification: {
            id: selectedTarif.id,
            name: selectedTarif.name,
            planType,
            price:
              planType === 'annually'
                ? selectedTarif.price_annually
                : selectedTarif.price_monthly,
            token: selectedTarif.token,
            description: selectedTarif.description,
          },
          createdBy: { connect: { id: user.id } },
          updatedBy: { connect: { id: user.id } },
          end_at,
        },
      });

      console.log(
        `📦 Souscription créée pour ${user.email} (${selectedTarif.name}, ${planType})`,
      );
    }
  }

  console.log(
    '✅ Tous les utilisateurs, organisations, bots et abonnements ont été générés.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
