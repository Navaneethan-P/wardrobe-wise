import React from 'react';
import { ClothingItem } from '@/lib/types';
import { getWardrobe } from '@/lib/storage';
import { Camera, Shirt, Sparkles, ShoppingBag } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  userName: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, userName }) => {
  const wardrobe = getWardrobe();
  const totalItems = wardrobe.length;

  const actions = [
    { icon: Camera, label: 'Add Item', desc: 'Capture new clothing', screen: 'add', color: 'bg-primary/15' },
    { icon: Shirt, label: 'My Wardrobe', desc: `${totalItems} items`, screen: 'wardrobe', color: 'bg-secondary' },
    { icon: Sparkles, label: 'Match Outfit', desc: 'Find combinations', screen: 'wardrobe', color: 'bg-success/15' },
    { icon: ShoppingBag, label: 'Pre-Buy Check', desc: 'Before you shop', screen: 'prebuy', color: 'bg-warning/15' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-8 animate-fade-in">
        <p className="text-muted-foreground text-sm">Good {getGreeting()}</p>
        <h1 className="text-3xl font-display mt-1">
          Hi, <span className="text-gradient">{userName}</span>
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Items" value={totalItems} />
        <StatCard label="Categories" value={new Set(wardrobe.map(i => i.category)).size} />
        <StatCard label="Colors" value={new Set(wardrobe.map(i => i.colorName)).size} />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-display mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(a => (
          <button
            key={a.label}
            className="glass-card rounded-xl p-4 text-left transition-all active:scale-[0.98] hover:border-primary/30"
            onClick={() => onNavigate(a.screen)}
          >
            <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center mb-3`}>
              <a.icon className="w-5 h-5 text-foreground" />
            </div>
            <div className="font-medium text-sm">{a.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
          </button>
        ))}
      </div>

      {/* Recent Items */}
      {wardrobe.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-display mb-4">Recently Added</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
            {wardrobe.slice(0, 6).map(item => (
              <button
                key={item.id}
                className="flex-shrink-0 w-20 text-center"
                onClick={() => onNavigate(`item:${item.id}`)}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border mb-1.5">
                  <img src={item.frontImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs text-muted-foreground truncate">{item.colorName}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="glass-card rounded-xl p-3 text-center">
    <div className="text-2xl font-display text-gradient">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default HomeScreen;
