import { PrismaClient } from '@prisma/client';
import { fakerFR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const COMMON_PASSWORD = 'Password1234!';

async function main() {
  const genericPassword: string = await bcrypt.hash(COMMON_PASSWORD, 12);

  console.log('🌱 Démarrage du processus de seed...');

  console.log('🗑️ Suppression des données existantes...');
  await prisma.userRole.deleteMany();
  await prisma.passwordHistory.deleteMany();
  await prisma.forgotPassword.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  console.log('✅ Données existantes supprimées');

  const roles = [
    { name: 'USER', power: 10 },
    { name: 'MODERATOR', power: 50 },
    { name: 'ADMIN', power: 100 },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`✅ Rôle "${role.name}" créé`);
  }

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
    },
  });

  await prisma.passwordHistory.create({
    data: {
      password: genericPassword,
      user_id: adminUser.id,
    },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  if (adminRole) {
    await prisma.userRole.create({
      data: {
        user_id: adminUser.id,
        role_id: adminRole.id,
      },
    });
  }

  console.log(`👑 Admin créé : ${adminUser.email}`);

  const userRoles = ['USER', 'MODERATOR'];

  for (let i = 1; i <= 10; i++) {
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
      },
    });

    await prisma.passwordHistory.create({
      data: {
        password: genericPassword,
        user_id: user.id,
      },
    });

    const roleName = userRoles[i % userRoles.length];
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (role) {
      await prisma.userRole.create({
        data: {
          user_id: user.id,
          role_id: role.id,
        },
      });
    }

    console.log(`👤 Utilisateur ${i} : ${user.email} créé avec le rôle "${roleName}"`);
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
