import React, { useState, useMemo } from 'react';
import { ClothingItem, ClothingCategory, CATEGORY_LABELS } from '@/lib/types';
import { getWardrobe } from '@/lib/storage';
import { ArrowLeft, Filter, Search } from 'lucide-react';

interface WardrobeScreenProps {
  onNavigate: (screen: string) => void;
  onSelectForMatch?: (item: ClothingItem) => void;
}

const WardrobeScreen: React.FC<WardrobeScreenProps> = ({ onNavigate, onSelectForMatch }) => {
  const wardrobe = getWardrobe();
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | 'all'>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(wardrobe.map(i => i.category));
    return Array.from(cats);
  }, [wardrobe]);

  const colors = useMemo(() => {
    const c = new Set(wardrobe.map(i => i.colorName));
    return Array.from(c);
  }, [wardrobe]);

  const filtered = useMemo(() => {
    return wardrobe.filter(i => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (colorFilter !== 'all' && i.colorName !== colorFilter) return false;
      if (search && !i.colorName.toLowerCase().includes(search.toLowerCase()) &&
          !i.category.toLowerCase().includes(search.toLowerCase()) &&
          !i.notes.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [wardrobe, categoryFilter, colorFilter, search]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-lg z-10 p-4 border-b border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => onNavigate('home')} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display flex-1">My Wardrobe</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} items</span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All</FilterChip>
          {categories.map(c => (
            <FilterChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>
              {CATEGORY_LABELS[c]}
            </FilterChip>
          ))}
        </div>

        {colors.length > 1 && (
          <div className="flex gap-2 overflow-x-auto mt-2 -mx-4 px-4">
            <FilterChip active={colorFilter === 'all'} onClick={() => setColorFilter('all')}>All Colors</FilterChip>
            {colors.map(c => (
              <FilterChip key={c} active={colorFilter === c} onClick={() => setColorFilter(c)}>{c}</FilterChip>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-4xl mb-4">👗</div>
          <h3 className="font-display text-lg mb-2">
            {wardrobe.length === 0 ? 'Your wardrobe is empty' : 'No matches found'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {wardrobe.length === 0 ? 'Start by adding your first item' : 'Try adjusting your filters'}
          </p>
          {wardrobe.length === 0 && (
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm"
              onClick={() => onNavigate('add')}>Add First Item</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {filtered.map(item => (
            <button
              key={item.id}
              className="relative aspect-square overflow-hidden group"
              onClick={() => onSelectForMatch ? onSelectForMatch(item) : onNavigate(`item:${item.id}`)}
            >
              <img src={item.frontImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <div>
                  <div className="text-xs font-medium">{CATEGORY_LABELS[item.category]}</div>
                  <div className="text-[10px] text-muted-foreground">{item.colorName}</div>
                </div>
              </div>
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-background/50" style={{ backgroundColor: item.dominantColor }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
      active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
    }`}
    onClick={onClick}
  >{children}</button>
);

export default WardrobeScreen;
