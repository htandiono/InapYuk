const { PrismaClient } = require('./apps/api/src/generated/prisma/client');
const prisma = new PrismaClient({ log: ['query'] });
async function run() {
  const rooms = await prisma.room.findMany();
  console.log("Rooms:", rooms.length);
  const found = await prisma.room.findFirst({ where: { id: rooms[0].id, deletedAt: null } });
  console.log("Found:", !!found);
}
run();
