import { prisma } from './apps/api/src/libs/prisma';
async function run() {
  const rooms = await prisma.room.findMany();
  console.log("Rooms:", rooms.length);
  const r0 = rooms[0];
  console.log("Room 0:", r0);
  const found = await prisma.room.findFirst({ where: { id: r0.id, deletedAt: null } });
  console.log("Found:", found?.id);
}
run();
