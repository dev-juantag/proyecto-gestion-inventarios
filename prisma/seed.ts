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
  const racksName = ['A01', 'B01', 'C01'];
  const MAX_NIVELES = 7;
  const MAX_PROFUNDIDAD = 10;
  const COLUMNAS = 1;
  
  let locationsCreated = 0;

  for (const rackName of racksName) {
    const rack = await prisma.rack.upsert({
      where: { nombre: rackName },
      update: {},
      create: {
        nombre: rackName,
        columnas: COLUMNAS,
        niveles: MAX_NIVELES,
        profundidad: MAX_PROFUNDIDAD,
        isActive: true,
      }
    });

    for (let c = 1; c <= COLUMNAS; c++) {
      for (let n = 1; n <= MAX_NIVELES; n++) {
        for (let p = 1; p <= MAX_PROFUNDIDAD; p++) {
          await prisma.ubicacion.upsert({
            where: {
              rackId_columna_nivel_profundidad: {
                rackId: rack.id,
                columna: c,
                nivel: n,
                profundidad: p
              }
            },
            update: {},
            create: {
              rackId: rack.id,
              columna: c,
              nivel: n,
              profundidad: p
            }
          });
          locationsCreated++;
        }
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
