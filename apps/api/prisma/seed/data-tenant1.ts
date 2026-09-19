import type { PropertySeed } from './data';

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
