export type GiftCategory =
  | 'Utensílios de cozinha'
  | 'Cama'
  | 'Banho'
  | 'Mesa'
  | 'Lavanderia'
  | 'Eletroportáteis'
  | 'Outros itens para casa';

export interface GiftReservation {
  id: string;
  guestName: string;
  reservedCount: number;
  reservedAt: string;
  note?: string;
}

export interface GiftItem {
  id: string;
  name: string;
  category: GiftCategory;
  totalQuantity: number;
  reservations: GiftReservation[];
}

export interface EventConfig {
  hosts: string;
  date: string;
  time: string;
  address: string;
  cityState: string;
  mapsUrl: string;
  pixKey: string;
  pixName: string;
  pixCity: string;
  notes: string;
  adminPin: string;
}

export interface RSVP {
  id: string;
  fullName: string;
  guestCount: number;
  phone?: string;
  message?: string;
  createdAt: string;
}

export interface AppState {
  eventConfig: EventConfig;
  gifts: GiftItem[];
  rsvps: RSVP[];
}
