import React from 'react';
import { ClothingItem, CATEGORY_LABELS } from '@/lib/types';
import { getWardrobe, deleteItem } from '@/lib/storage';
import { ArrowLeft, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItemDetailScreenProps {
  itemId: string;
  onNavigate: (screen: string) => void;
}

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ itemId, onNavigate }) => {
  const item = getWardrobe().find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Item not found</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Delete this item from your wardrobe?')) {
      deleteItem(item.id);
      onNavigate('wardrobe');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <button onClick={() => onNavigate('wardrobe')}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display flex-1">{CATEGORY_LABELS[item.category]}</h1>
        <button onClick={handleDelete} className="p-2 text-destructive">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Images */}
      <div className="flex gap-1 p-1">
        <img src={item.frontImage} alt="Front" className={`${item.backImage ? 'w-1/2' : 'w-full'} aspect-[3/4] object-cover rounded-lg`} />
        {item.backImage && (
          <img src={item.backImage} alt="Back" className="w-1/2 aspect-[3/4] object-cover rounded-lg" />
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-border" style={{ backgroundColor: item.dominantColor }} />
          <div>
            <div className="font-medium">{item.colorName}</div>
            <div className="text-xs text-muted-foreground">{item.dominantColor}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailCard label="Category" value={CATEGORY_LABELS[item.category]} />
          <DetailCard label="Size" value={item.size} />
          <DetailCard label="Pattern" value={item.pattern} />
          <DetailCard label="Added" value={new Date(item.addedAt).toLocaleDateString()} />
        </div>

        {item.occasion && (
          <div className="glass-card rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Occasion</div>
            <div className="text-sm">{item.occasion}</div>
          </div>
        )}

        {item.notes && (
          <div className="glass-card rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1">Notes</div>
            <div className="text-sm italic">"{item.notes}"</div>
          </div>
        )}

        <Button className="w-full" onClick={() => onNavigate(`match:${item.id}`)}>
          <Sparkles className="w-4 h-4 mr-2" /> Find Matching Outfits
        </Button>
      </div>
    </div>
  );
};

const DetailCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="glass-card rounded-xl p-3">
    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
    <div className="text-sm font-medium capitalize">{value}</div>
  </div>
);

export default ItemDetailScreen;
