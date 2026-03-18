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

  // 3. Crear infraestructura física de Drive-in
  // --- 2. Auto-Generar Racks Virtuales Iniciales (A, B, C) ---
  // Drive-in: 1 Rack = 70 posiciones (7 niveles x 10 de profundidad)
  const racksName = ['A', 'B', 'C'];
  const MAX_NIVELES = 7;
  const MAX_PROFUNDIDAD = 10;
  
  let locationsCreated = 0;

  for (const rack of racksName) {
    for (let nivel = 1; nivel <= MAX_NIVELES; nivel++) {
      // Create Canal
      const canal = await prisma.canal.upsert({
        where: { rack_nivel: { rack, nivel } },
        update: {},
        create: {
          rack,
          nivel,
          maxCapacidad: MAX_PROFUNDIDAD
        }
      });

      // Create Ubicaciones inside Canal
      for (let prof = 1; prof <= MAX_PROFUNDIDAD; prof++) {
        await prisma.ubicacion.upsert({
          where: { canalId_profundidad: { canalId: canal.id, profundidad: prof } },
          update: {},
          create: {
            canalId: canal.id,
            profundidad: prof
          }
        });
        locationsCreated++;
      }
    }
  }

  console.log(`\x1b[32m✔ Racks Drive-in Generados Exitosamente: ${racksName.length} Racks\x1b[0m`);
  console.log(`\x1b[32m✔ Total de Ubicaciones Físicas Virtualizadas: ${locationsCreated} posiciones (70 c/u)\x1b[0m`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
