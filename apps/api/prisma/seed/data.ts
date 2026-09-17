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

export const SEED_PASSWORD = 'Inapyuk123!';

const IMAGE = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

export const PROPERTY_IMAGES = [
  IMAGE('1566073771259-6a8506099945'),
  IMAGE('1582719478250-c89cae4dc85b'),
  IMAGE('1590490360182-c33d57733427'),
  IMAGE('1611892440504-42a792e24d32'),
];
