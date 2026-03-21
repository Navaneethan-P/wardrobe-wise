import { ClothingItem, OutfitMatch, PreBuyResult, TOPS, BOTTOMS, OUTERWEAR, FULL_BODY } from './types';
import { colorCompatibility, colorDistance } from './colorUtils';

function getCategoryGroup(cat: string): 'top' | 'bottom' | 'outerwear' | 'fullbody' | 'other' {
  if (TOPS.includes(cat as any)) return 'top';
  if (BOTTOMS.includes(cat as any)) return 'bottom';
  if (OUTERWEAR.includes(cat as any)) return 'outerwear';
  if (FULL_BODY.includes(cat as any)) return 'fullbody';
  return 'other';
}

export function findMatches(selectedItem: ClothingItem, wardrobe: ClothingItem[]): OutfitMatch[] {
  const group = getCategoryGroup(selectedItem.category);
  const matches: OutfitMatch[] = [];

  const candidates = wardrobe.filter(i => i.id !== selectedItem.id);

  if (group === 'top') {
    // Match with bottoms
    const bottoms = candidates.filter(i => getCategoryGroup(i.category) === 'bottom');
    for (const bottom of bottoms) {
      const score = calculateMatchScore(selectedItem, bottom);
      matches.push({
        items: [selectedItem, bottom],
        score,
        reason: getMatchReason(score),
      });
    }
  } else if (group === 'bottom') {
    const tops = candidates.filter(i => getCategoryGroup(i.category) === 'top');
    for (const top of tops) {
      const score = calculateMatchScore(top, selectedItem);
      matches.push({
        items: [top, selectedItem],
        score,
        reason: getMatchReason(score),
      });
    }
  } else if (group === 'outerwear') {
    // Match outerwear with top+bottom combos
    const tops = candidates.filter(i => getCategoryGroup(i.category) === 'top');
    const bottoms = candidates.filter(i => getCategoryGroup(i.category) === 'bottom');
    for (const top of tops) {
      for (const bottom of bottoms) {
        const s1 = colorCompatibility(selectedItem.dominantColor, top.dominantColor);
        const s2 = colorCompatibility(top.dominantColor, bottom.dominantColor);
        const score = Math.round((s1 + s2) / 2);
        matches.push({
          items: [selectedItem, top, bottom],
          score,
          reason: getMatchReason(score),
        });
      }
    }
  } else if (group === 'fullbody') {
    // Dresses match with outerwear or shoes
    const outer = candidates.filter(i => getCategoryGroup(i.category) === 'outerwear');
    for (const o of outer) {
      const score = calculateMatchScore(selectedItem, o);
      matches.push({ items: [selectedItem, o], score, reason: getMatchReason(score) });
    }
    if (matches.length === 0) {
      matches.push({ items: [selectedItem], score: 75, reason: 'Complete outfit on its own!' });
    }
  } else {
    // Accessories — match with everything
    for (const item of candidates) {
      const score = colorCompatibility(selectedItem.dominantColor, item.dominantColor);
      matches.push({ items: [selectedItem, item], score, reason: getMatchReason(score) });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 20);
}

function calculateMatchScore(item1: ClothingItem, item2: ClothingItem): number {
  let score = colorCompatibility(item1.dominantColor, item2.dominantColor);

  // Pattern bonus: solid + patterned is generally good
  if (item1.pattern === 'solid' && item2.pattern === 'solid') score = Math.min(100, score + 2);
  if ((item1.pattern === 'solid') !== (item2.pattern === 'solid')) score = Math.min(100, score + 5);
  // Two patterned items — risky
  if (item1.pattern !== 'solid' && item2.pattern !== 'solid') score = Math.max(0, score - 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}

function getMatchReason(score: number): string {
  if (score >= 85) return 'Excellent pairing — colors harmonize beautifully';
  if (score >= 75) return 'Great combination with complementary tones';
  if (score >= 65) return 'Good match — works well together';
  if (score >= 50) return 'Decent pairing — consider the occasion';
  return 'Bold choice — might work for casual looks';
}

export function preBuyAnalysis(newItemColor: string, newItemCategory: string, wardrobe: ClothingItem[]): PreBuyResult {
  // Check for similar items
  const similar = wardrobe.filter(i => {
    const sameCategory = i.category === newItemCategory;
    const similarColor = colorDistance(i.dominantColor, newItemColor) < 80;
    return sameCategory && similarColor;
  });

  // Check match potential with existing wardrobe
  const group = getCategoryGroup(newItemCategory);
  let compatibleItems: ClothingItem[] = [];

  if (group === 'top') {
    compatibleItems = wardrobe.filter(i => getCategoryGroup(i.category) === 'bottom');
  } else if (group === 'bottom') {
    compatibleItems = wardrobe.filter(i => getCategoryGroup(i.category) === 'top');
  } else {
    compatibleItems = wardrobe;
  }

  const avgMatch = compatibleItems.length > 0
    ? compatibleItems.reduce((sum, i) => sum + colorCompatibility(newItemColor, i.dominantColor), 0) / compatibleItems.length
    : 50;

  const matchScore = Math.round(avgMatch);

  let recommendation: PreBuyResult['recommendation'];
  let reason: string;

  if (similar.length >= 3) {
    recommendation = 'skip';
    reason = `You already have ${similar.length} similar items. This would be a duplicate.`;
  } else if (similar.length >= 1 && matchScore < 65) {
    recommendation = 'skip';
    reason = `You have ${similar.length} similar item(s) and this doesn't match well with your existing wardrobe.`;
  } else if (matchScore >= 75) {
    recommendation = 'buy';
    reason = `This pairs well with ${compatibleItems.length} items in your wardrobe!`;
  } else if (matchScore >= 60) {
    recommendation = 'consider';
    reason = `Moderate match potential. Works with some items but not a strong addition.`;
  } else {
    recommendation = 'skip';
    reason = `Low compatibility with your current wardrobe. Consider a different color.`;
  }

  return { similarItems: similar, matchScore, recommendation, reason };
}
