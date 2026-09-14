import { prisma } from './apps/api/src/libs/prisma';
async function run() {
  const rooms = await prisma.room.findMany();
  console.log("Total rooms:", rooms.length);
  if (rooms.length > 0) {
    console.log("Room 0 id:", rooms[0].id);
    console.log("Room 0 deletedAt:", rooms[0].deletedAt);
    const found = await prisma.room.findFirst({ where: { id: rooms[0].id, deletedAt: null } });
    console.log("Found with deletedAt: null?", !!found);
  }
}
run();
