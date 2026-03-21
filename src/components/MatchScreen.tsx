import React, { useState } from 'react';
import { ClothingItem, CATEGORY_LABELS } from '@/lib/types';
import { getWardrobe } from '@/lib/storage';
import { findMatches } from '@/lib/matchingEngine';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface MatchScreenProps {
  onNavigate: (screen: string) => void;
  selectedItem?: ClothingItem;
}

const MatchScreen: React.FC<MatchScreenProps> = ({ onNavigate, selectedItem: initialItem }) => {
  const wardrobe = getWardrobe();
  const [selectedItem, setSelectedItem] = useState<ClothingItem | undefined>(initialItem);
  const matches = selectedItem ? findMatches(selectedItem, wardrobe) : [];

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <button onClick={() => onNavigate('home')}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-display">Match Outfit</h1>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground text-sm mb-4">Select an item to find matching outfits</p>
          <div className="grid grid-cols-3 gap-2">
            {wardrobe.map(item => (
              <button key={item.id} className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                onClick={() => setSelectedItem(item)}>
                <img src={item.frontImage} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {wardrobe.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-muted-foreground">Add items to your wardrobe first</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <button onClick={() => setSelectedItem(undefined)}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-display flex-1">Matches</h1>
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      {/* Selected item */}
      <div className="p-4 glass-card mx-4 mt-4 rounded-xl flex items-center gap-3">
        <img src={selectedItem.frontImage} alt="" className="w-14 h-14 rounded-lg object-cover" />
        <div>
          <div className="font-medium text-sm">{CATEGORY_LABELS[selectedItem.category]}</div>
          <div className="text-xs text-muted-foreground">{selectedItem.colorName} · {selectedItem.size}</div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <div className="text-sm text-muted-foreground mb-3">{matches.length} combinations found</div>
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No matching items found. Add more items to your wardrobe!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="glass-card rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <ScoreBadge score={match.score} />
                  <span className="text-xs text-muted-foreground">{match.reason}</span>
                </div>
                <div className="flex gap-2">
                  {match.items.map(item => (
                    <button key={item.id} className="flex-1" onClick={() => onNavigate(`item:${item.id}`)}>
                      <img src={item.frontImage} alt="" className="w-full aspect-square object-cover rounded-lg border border-border" />
                      <div className="text-[10px] text-muted-foreground mt-1 text-center">{CATEGORY_LABELS[item.category]}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const cls = score >= 80 ? 'score-high' : score >= 60 ? 'score-medium' : 'score-low';
  return (
    <div className={`font-display text-lg font-bold ${cls}`}>
      {score}<span className="text-xs font-body font-normal text-muted-foreground">/100</span>
    </div>
  );
};

export default MatchScreen;
