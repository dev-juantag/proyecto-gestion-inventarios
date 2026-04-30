import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { nombre: { contains: 'Juan' } },
    include: { role: true }
  });
  console.log('USER_INFO:', JSON.stringify(user));
  await prisma.$disconnect();
}

checkUser();
