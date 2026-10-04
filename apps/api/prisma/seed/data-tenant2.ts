import type { PropertySeed } from './data';

export const TENANT_TWO_PROPERTIES: PropertySeed[] = [
  {
    name: 'Prawirotaman Guest House',
    slug: 'prawirotaman-guest-house',
    category: 'Guest House',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    address: 'Jl. Prawirotaman II No. 14, Yogyakarta',
    description:
      'Guest house klasik di kawasan Prawirotaman, dekat dengan kuliner malam dan galeri seni.',
    rooms: [
      {
        name: 'Standard Fan Room',
        description: 'Kamar hemat dengan kipas angin dan kamar mandi dalam.',
        basePrice: 210000,
        capacity: 2,
        totalUnits: 6,
      },
      {
        name: 'Superior AC Room',
        description: 'Kamar ber-AC dengan meja kerja dan sarapan termasuk.',
        basePrice: 385000,
        capacity: 2,
        totalUnits: 4,
      },
    ],
  },
  {
    name: 'Malioboro Heritage Hotel',
    slug: 'malioboro-heritage-hotel',
    category: 'Hotel',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    address: 'Jl. Malioboro No. 60, Yogyakarta',
    description: 'Hotel bergaya kolonial 300 meter dari Stasiun Tugu dan Jalan Malioboro.',
    rooms: [
      {
        name: 'Heritage Deluxe',
        description: 'Kamar dengan interior kayu jati dan jendela tinggi.',
        basePrice: 540000,
        capacity: 2,
        totalUnits: 10,
      },
      {
        name: 'Executive Suite',
        description: 'Suite luas dengan ruang tamu dan pemandangan Malioboro.',
        basePrice: 1250000,
        capacity: 4,
        totalUnits: 2,
      },
    ],
  },
  {
    name: 'Kaliurang Mountain Villa',
    slug: 'kaliurang-mountain-villa',
    category: 'Villa',
    city: 'Sleman',
    province: 'DI Yogyakarta',
    address: 'Jl. Kaliurang KM 22, Sleman',
    description: 'Villa pegunungan berudara sejuk dengan pemandangan Gunung Merapi.',
    rooms: [
      {
        name: 'Merapi View Cabin',
        description: 'Kabin kayu untuk dua orang dengan perapian.',
        basePrice: 670000,
        capacity: 2,
        totalUnits: 3,
      },
      {
        name: 'Whole Villa',
        description: 'Sewa satu villa penuh dengan empat kamar tidur dan dapur.',
        basePrice: 2400000,
        capacity: 10,
        totalUnits: 1,
      },
    ],
  },
  {
    name: 'Bantul Sunset Homestay',
    slug: 'bantul-sunset-homestay',
    category: 'Homestay',
    city: 'Bantul',
    province: 'DI Yogyakarta',
    address: 'Jl. Parangtritis KM 24, Bantul',
    description: 'Homestay sederhana sepuluh menit dari Pantai Parangtritis.',
    rooms: [
      {
        name: 'Sunset Room',
        description: 'Kamar dengan teras menghadap barat untuk menikmati matahari terbenam.',
        basePrice: 265000,
        capacity: 3,
        totalUnits: 4,
      },
    ],
  },
];
