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

export interface StudentImageItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string;
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

export interface RoomImageItem {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
}

export interface EventServiceItem {
  id: string;
  title: string;
  category: "band_acoustic" | "thue_trong" | "full_band_tiec" | "khac";
  price: string;
  priceNumber?: number;
  description: string;
  features: string[];
  imageUrl?: string;
  order: number;
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
  padType: "spd30" | "sample_pad"; // "spd30": Sound gốc Roland SPD-30; "sample_pad": Sound ngoài (SPD-SX, NUX, Avatar...)
  category: string; // "pop_ballad", "vinahouse_edm", "acoustic_percussion", "rock_funk", "thanh_ca", "show_all", "spd30_preset", "other"
  compatibleDevices: string[]; // ["Roland SPD-30"] or ["Roland SPD-SX", "Roland SPD-SX PRO", "NUX DP-2000", "Avatar HXW", "Donner"]
  price: number;
  originalPrice?: number;
  sampleCount: string;
  format: string;
  coverUrl?: string;
  iconName?: string;
  badge?: string;
  demoAudioUrl?: string;
  downloadUrl?: string;
  features?: string[];
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
  email?: string;
  serviceType: "sampler" | "room" | "course" | "event_band" | "thue_trong" | "other";
  itemSelected: string;
  price?: number;
  software?: string;
  deviceModel?: string;
  deliveryMethod?: string;
  bookingDate?: string;
  bookingTime?: string;
  hours?: number;
  roomSelected?: string;
  message?: string;
  adminNotes?: string;
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
  studentImages: StudentImageItem[];
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  roomImages: RoomImageItem[];
  eventServices: EventServiceItem[];
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  orders: OrderItem[];
  media: MediaItem[];
}
