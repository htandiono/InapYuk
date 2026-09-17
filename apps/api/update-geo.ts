import { prisma } from './src/libs/prisma';
import { geocodeAddress } from './src/libs/opencage';

async function main() {
  console.log('Fetching properties without coordinates...');
  const properties = await prisma.property.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
    },
  });

  console.log(`Found ${properties.length} properties to update.`);

  for (const property of properties) {
    try {
      console.log(`Geocoding ${property.name} (${property.address}, ${property.city})...`);
      const geo = await geocodeAddress(
        property.address,
        property.city,
        property.province,
        'Indonesia',
      );

      if (geo) {
        await prisma.property.update({
          where: { id: property.id },
          data: {
            latitude: geo.lat,
            longitude: geo.lng,
          },
        });
        console.log(`✅ Updated ${property.name} with ${geo.lat}, ${geo.lng}`);
      } else {
        console.log(`❌ Failed to find coordinates for ${property.name}`);
      }

      // Delay to avoid hitting rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error updating ${property.name}:`, error);
    }
  }

  console.log('Update complete!');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
