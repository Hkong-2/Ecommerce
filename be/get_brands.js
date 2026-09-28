const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brands = await prisma.brand.findMany();
  console.log(brands);
}

main().catch(console.error).finally(() => prisma.$disconnect());
