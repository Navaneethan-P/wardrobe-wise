import { UserProfile, ClothingItem } from './types';

const PROFILE_KEY = 'mydress_profile';
const WARDROBE_KEY = 'mydress_wardrobe';

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getWardrobe(): ClothingItem[] {
  const raw = localStorage.getItem(WARDROBE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveWardrobe(items: ClothingItem[]): void {
  localStorage.setItem(WARDROBE_KEY, JSON.stringify(items));
}

export function addItem(item: ClothingItem): void {
  const items = getWardrobe();
  items.unshift(item);
  saveWardrobe(items);
}

export function updateItem(item: ClothingItem): void {
  const items = getWardrobe();
  const idx = items.findIndex(i => i.id === item.id);
  if (idx !== -1) items[idx] = item;
  saveWardrobe(items);
}

export function deleteItem(id: string): void {
  saveWardrobe(getWardrobe().filter(i => i.id !== id));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
