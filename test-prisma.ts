import { prisma } from './apps/api/src/libs/prisma';
async function test() {
  try {
    const props = await prisma.property.findMany({
      orderBy: { rooms: { _min: { basePrice: 'asc' } } },
      take: 1
    });
    console.log(props);
  } catch (e) {
    console.error(e);
  }
}
test();
