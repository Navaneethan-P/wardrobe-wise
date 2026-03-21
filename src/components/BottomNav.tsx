import React from 'react';
import { Home, Shirt, Plus, Sparkles, User } from 'lucide-react';

interface BottomNavProps {
  active: string;
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ active, onNavigate }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'wardrobe', icon: Shirt, label: 'Wardrobe' },
    { id: 'add', icon: Plus, label: 'Add', special: true },
    { id: 'match', icon: Sparkles, label: 'Match' },
    { id: 'avatar', icon: User, label: 'Avatar' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {items.map(item => (
          <button
            key={item.id}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              item.special
                ? 'bg-primary text-primary-foreground -mt-5 p-3 rounded-full shadow-lg shadow-primary/30'
                : active === item.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
            }`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon className={item.special ? 'w-6 h-6' : 'w-5 h-5'} />
            {!item.special && <span className="text-[10px]">{item.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
