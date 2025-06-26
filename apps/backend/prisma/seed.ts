import { PrismaClient } from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const COMMON_PASSWORD = 'Password1234!';

async function main() {
  console.log('🌱 Démarrage du processus de seed...');

  console.log('🗑️ Suppression des données existantes...');
  await prisma.passwordHistory.deleteMany();
  await prisma.forgotPassword.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Données existantes supprimées');

  // Création d'un admin
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
  await prisma.organization.create({
    data: {
      name: 'Lexa',
      siren: `${siren}`,
      siret: `${siren}${faker.string.numeric(5)}`,
      rib: `FR${faker.string.numeric(2)}${faker.string.numeric(10)}${faker.string.numeric(11)}${faker.string.numeric(2)}`,
      vat: `FR${faker.string.numeric(2)}${siren}`,
      createdBy: { connect: { id: adminUser.id } },
      updatedBy: { connect: { id: adminUser.id } },
      users: { connect: { id: adminUser.id } },
    },
  });

  console.log(`👑 Admin créé : ${adminUser.email}`);

  for (let i = 1; i <= 10; i++) {
    const genericPassword: string = await bcrypt.hash(COMMON_PASSWORD, 12);
    const firstname = faker.person.firstName();
    const lastname = faker.person.lastName();
    const email = faker.internet
      .email({ firstName: firstname, lastName: lastname })
      .toLowerCase();
    const phone = faker.phone.number();
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
        role: 'user',
      },
    });

    await prisma.passwordHistory.create({
      data: {
        password: genericPassword,
        user_id: user.id,
      },
    });

    console.log(`👤 Utilisateur ${i} : ${user.email} créé avec le rôle "user"`);
  }

  console.log('✅ Tous les utilisateurs ont été générés.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
