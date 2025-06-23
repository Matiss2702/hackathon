import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'USER',      power: 10  },
    { name: 'MODERATOR', power: 50  },
    { name: 'ADMIN',     power: 100 },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`✅ Role "${role.name}" seeded`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
