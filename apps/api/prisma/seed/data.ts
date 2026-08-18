export interface RoomSeed {
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  totalUnits: number;
}

export interface PropertySeed {
  name: string;
  slug: string;
  category: string;
  city: string;
  province: string;
  address: string;
  description: string;
  rooms: RoomSeed[];
}

export const CATEGORIES = ['Hotel', 'Villa', 'Apartemen', 'Guest House', 'Homestay'];

export const TENANTS = [
  {
    email: 'tenant.bali@inapyuk.space',
    name: 'Ni Kadek Ayu',
    companyName: 'Bali Coastal Stays',
    companyAddress: 'Jl. Pantai Batu Bolong No. 12, Canggu, Bali',
  },
  {
    email: 'tenant.jogja@inapyuk.space',
    name: 'Raka Pradipta',
    companyName: 'Jogja Heritage Living',
    companyAddress: 'Jl. Prawirotaman No. 45, Yogyakarta',
  },
];

export const GUESTS = [
  { email: 'budi@inapyuk.space', name: 'Budi Santoso', phone: '081234567801' },
  { email: 'siti@inapyuk.space', name: 'Siti Nurhaliza', phone: '081234567802' },
  { email: 'andre@inapyuk.space', name: 'Andre Wijaya', phone: '081234567803' },
  { email: 'maya@inapyuk.space', name: 'Maya Kusuma', phone: '081234567804' },
];

/** Shared dev password for every seeded account. */
export const SEED_PASSWORD = 'Inapyuk123!';

const IMAGE = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const PROPERTY_IMAGES = [
  IMAGE('1566073771259-6a8506099945'),
  IMAGE('1582719478250-c89cae4dc85b'),
  IMAGE('1590490360182-c33d57733427'),
  IMAGE('1611892440504-42a792e24d32'),
];

export const TENANT_ONE_PROPERTIES: PropertySeed[] = [
  {
    name: 'Canggu Surf Villa',
    slug: 'canggu-surf-villa',
    category: 'Villa',
    city: 'Badung',
    province: 'Bali',
    address: 'Jl. Pantai Berawa No. 88, Canggu',
    description:
      'Villa dua lantai berjarak lima menit berjalan kaki dari Pantai Berawa, dengan kolam renang pribadi dan dapur lengkap.',
    rooms: [
      {
        name: 'Garden Studio',
        description: 'Studio menghadap taman dengan tempat tidur queen dan pancuran outdoor.',
        basePrice: 750000,
        capacity: 2,
        totalUnits: 3,
      },
      {
        name: 'Poolside Suite',
        description: 'Suite satu kamar tidur dengan akses langsung ke kolam renang.',
        basePrice: 1450000,
        capacity: 4,
        totalUnits: 2,
      },
    ],
  },
  {
    name: 'Ubud Rice Terrace Retreat',
    slug: 'ubud-rice-terrace-retreat',
    category: 'Homestay',
    city: 'Gianyar',
    province: 'Bali',
    address: 'Jl. Raya Tegallalang No. 21, Ubud',
    description:
      'Homestay keluarga di tengah persawahan Tegallalang, termasuk sarapan dan antar-jemput area Ubud.',
    rooms: [
      {
        name: 'Bamboo Room',
        description: 'Kamar bambu dengan teras menghadap sawah.',
        basePrice: 480000,
        capacity: 2,
        totalUnits: 4,
      },
      {
        name: 'Family Joglo',
        description: 'Bangunan joglo dengan dua kamar tidur untuk keluarga.',
        basePrice: 980000,
        capacity: 5,
        totalUnits: 1,
      },
    ],
  },
  {
    name: 'Seminyak Sky Apartment',
    slug: 'seminyak-sky-apartment',
    category: 'Apartemen',
    city: 'Badung',
    province: 'Bali',
    address: 'Jl. Kayu Aya No. 5, Seminyak',
    description: 'Apartemen modern di jantung Seminyak dengan kolam renang rooftop.',
    rooms: [
      {
        name: 'One Bedroom City View',
        description: 'Unit satu kamar tidur dengan dapur kecil dan mesin cuci.',
        basePrice: 890000,
        capacity: 2,
        totalUnits: 5,
      },
    ],
  },
  {
    name: 'Sanur Beachfront Hotel',
    slug: 'sanur-beachfront-hotel',
    category: 'Hotel',
    city: 'Denpasar',
    province: 'Bali',
    address: 'Jl. Danau Tamblingan No. 100, Sanur',
    description: 'Hotel tepi pantai dengan restoran, spa, dan area bermain anak.',
    rooms: [
      {
        name: 'Deluxe Twin',
        description: 'Kamar deluxe dengan dua tempat tidur single dan balkon.',
        basePrice: 620000,
        capacity: 2,
        totalUnits: 8,
      },
      {
        name: 'Ocean Suite',
        description: 'Suite menghadap laut dengan bathtub dan ruang tamu terpisah.',
        basePrice: 1750000,
        capacity: 3,
        totalUnits: 3,
      },
    ],
  },
];

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
