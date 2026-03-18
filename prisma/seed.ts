const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dynamic data...');

  // 1. Crear Role Super Admin
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
    },
  });

  // Otros Roles preventivos
  await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  await prisma.role.upsert({
    where: { name: 'Operador' },
    update: {},
    create: { name: 'Operador' },
  });

  // 2. Crear usuario Super Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { correo: 'juantaguado05@gmail.com' },
    update: {},
    create: {
      correo: 'juantaguado05@gmail.com',
      password: hashedPassword,
      documento: '1004628559',
      nombre: 'Juan',
      apellidos: 'Aguado',
      roleId: superAdminRole.id,
    },
  });

  console.log('Seed exitoso: usuario', superAdmin.correo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
