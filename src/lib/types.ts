export interface StatItem {
  value: string;
  label: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  aboutText1: string;
  aboutText2: string;
  avatarUrl: string;
  stats: StatItem[];
  genres: string[];
  contact: {
    phone: string;
    zalo: string;
    email: string;
    facebook: string;
    youtube: string;
    address: string;
  };
}

export interface CourseItem {
  id: string;
  title: string;
  price: string;
  priceNumber: number;
  unit: string;
  features: string[];
  isPopular?: boolean;
  iconName?: string;
  order: number;
}

export interface RoomItem {
  id: string;
  name: string;
  capacity: string;
  pricePerHour: number;
  description?: string;
  order: number;
}

export interface RoomPerk {
  id: string;
  title: string;
  iconName: string;
}

export interface KitSamples {
  kick?: string;
  snare?: string;
  hat?: string;
  tom?: string;
  clap?: string;
  crash?: string;
  demoLoop?: string;
}

export interface SynthConfig {
  kick: [number, number, number];
  snare: [number, number];
  hat: [number, number];
  tom: number;
  crash: number;
  lp: number;
  bpm: number;
}

export interface SoundKitItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  sampleCount: string;
  format: string;
  coverUrl?: string;
  iconName?: string;
  samples?: KitSamples;
  synthConfig: SynthConfig;
  order: number;
}

export interface ComboOffer {
  title: string;
  price: number;
  originalPrice: number;
  badge: string;
  desc: string;
}

export interface OrderItem {
  id: string;
  customerName: string;
  phone: string;
  serviceType: "sampler" | "room" | "course";
  itemSelected: string;
  software?: string;
  hours?: number;
  roomSelected?: string;
  message?: string;
  status: "new" | "processing" | "completed" | "cancelled";
  createdAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "audio";
  url: string;
  size: number;
  createdAt: string;
}

export interface SiteData {
  profile: ProfileData;
  courses: CourseItem[];
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  orders: OrderItem[];
  media: MediaItem[];
}
