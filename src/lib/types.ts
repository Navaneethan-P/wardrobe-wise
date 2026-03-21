export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  height: number; // cm
  weight: number; // kg
  bodyShape: 'slim' | 'athletic' | 'average' | 'curvy' | 'plus';
  clothingSize: string;
  onboarded: boolean;
}

export type ClothingCategory = 
  | 'shirt' | 'tshirt' | 'blouse' | 'sweater' | 'jacket' | 'coat'
  | 'pants' | 'jeans' | 'shorts' | 'skirt' | 'dress'
  | 'shoes' | 'accessories' | 'other';

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  shirt: 'Shirt', tshirt: 'T-Shirt', blouse: 'Blouse', sweater: 'Sweater',
  jacket: 'Jacket', coat: 'Coat', pants: 'Pants', jeans: 'Jeans',
  shorts: 'Shorts', skirt: 'Skirt', dress: 'Dress', shoes: 'Shoes',
  accessories: 'Accessories', other: 'Other',
};

export const TOPS: ClothingCategory[] = ['shirt', 'tshirt', 'blouse', 'sweater'];
export const BOTTOMS: ClothingCategory[] = ['pants', 'jeans', 'shorts', 'skirt'];
export const OUTERWEAR: ClothingCategory[] = ['jacket', 'coat'];
export const FULL_BODY: ClothingCategory[] = ['dress'];

export interface ClothingItem {
  id: string;
  frontImage: string; // base64
  backImage?: string;
  category: ClothingCategory;
  dominantColor: string; // hex
  colorName: string;
  pattern: 'solid' | 'striped' | 'plaid' | 'floral' | 'printed' | 'other';
  size: string;
  notes: string;
  occasion?: string;
  addedAt: number;
}

export interface OutfitMatch {
  items: ClothingItem[];
  score: number;
  reason: string;
}

export interface PreBuyResult {
  similarItems: ClothingItem[];
  matchScore: number;
  recommendation: 'buy' | 'skip' | 'consider';
  reason: string;
}
