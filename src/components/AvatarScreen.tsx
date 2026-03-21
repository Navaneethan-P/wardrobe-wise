import React, { useMemo } from 'react';
import { UserProfile, ClothingItem, CATEGORY_LABELS, TOPS, BOTTOMS, FULL_BODY } from '@/lib/types';
import { getWardrobe } from '@/lib/storage';
import { ArrowLeft } from 'lucide-react';

interface AvatarScreenProps {
  profile: UserProfile;
  onNavigate: (screen: string) => void;
}

const AvatarScreen: React.FC<AvatarScreenProps> = ({ profile, onNavigate }) => {
  const wardrobe = getWardrobe();
  const tops = wardrobe.filter(i => TOPS.includes(i.category as any));
  const bottoms = wardrobe.filter(i => BOTTOMS.includes(i.category as any));
  const dresses = wardrobe.filter(i => FULL_BODY.includes(i.category as any));

  const [selectedTop, setSelectedTop] = React.useState<ClothingItem | null>(tops[0] || null);
  const [selectedBottom, setSelectedBottom] = React.useState<ClothingItem | null>(bottoms[0] || null);
  const [selectedDress, setSelectedDress] = React.useState<ClothingItem | null>(null);

  const bodyWidth = profile.bodyShape === 'slim' ? 60 : profile.bodyShape === 'athletic' ? 70 : profile.bodyShape === 'curvy' ? 80 : profile.bodyShape === 'plus' ? 90 : 72;
  const hipWidth = profile.bodyShape === 'curvy' || profile.bodyShape === 'plus' ? bodyWidth + 10 : bodyWidth;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <button onClick={() => onNavigate('home')}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display flex-1">Avatar Try-On</h1>
      </div>

      {/* Avatar */}
      <div className="flex justify-center py-8">
        <svg viewBox="0 0 200 380" width="200" height="380">
          {/* Head */}
          <circle cx="100" cy="40" r="28" fill="hsl(30, 40%, 70%)" />
          <circle cx="90" cy="36" r="3" fill="hsl(220, 15%, 20%)" />
          <circle cx="110" cy="36" r="3" fill="hsl(220, 15%, 20%)" />
          <path d="M 93 48 Q 100 54 107 48" stroke="hsl(0, 40%, 60%)" fill="none" strokeWidth="2" />

          {/* Neck */}
          <rect x="92" y="65" width="16" height="15" rx="4" fill="hsl(30, 40%, 68%)" />

          {/* Body - Top */}
          {selectedDress ? (
            <rect x={100 - bodyWidth / 2} y="78" width={bodyWidth} height="160" rx="8"
              fill={selectedDress.dominantColor} stroke="hsl(220, 12%, 30%)" strokeWidth="1" />
          ) : (
            <>
              {selectedTop ? (
                <rect x={100 - bodyWidth / 2} y="78" width={bodyWidth} height="80" rx="8"
                  fill={selectedTop.dominantColor} stroke="hsl(220, 12%, 30%)" strokeWidth="1" />
              ) : (
                <rect x={100 - bodyWidth / 2} y="78" width={bodyWidth} height="80" rx="8"
                  fill="hsl(220, 14%, 14%)" stroke="hsl(220, 12%, 30%)" strokeWidth="1" strokeDasharray="4" />
              )}

              {/* Bottom */}
              {selectedBottom ? (
                <>
                  <rect x={100 - hipWidth / 2} y="155" width={hipWidth / 2 - 3} height="90" rx="6"
                    fill={selectedBottom.dominantColor} stroke="hsl(220, 12%, 30%)" strokeWidth="1" />
                  <rect x={100 + 3} y="155" width={hipWidth / 2 - 3} height="90" rx="6"
                    fill={selectedBottom.dominantColor} stroke="hsl(220, 12%, 30%)" strokeWidth="1" />
                </>
              ) : (
                <>
                  <rect x={100 - hipWidth / 2} y="155" width={hipWidth / 2 - 3} height="90" rx="6"
                    fill="hsl(220, 14%, 14%)" stroke="hsl(220, 12%, 30%)" strokeWidth="1" strokeDasharray="4" />
                  <rect x={100 + 3} y="155" width={hipWidth / 2 - 3} height="90" rx="6"
                    fill="hsl(220, 14%, 14%)" stroke="hsl(220, 12%, 30%)" strokeWidth="1" strokeDasharray="4" />
                </>
              )}
            </>
          )}

          {/* Arms */}
          <rect x={100 - bodyWidth / 2 - 14} y="80" width="14" height="60" rx="7" fill="hsl(30, 40%, 68%)" />
          <rect x={100 + bodyWidth / 2} y="80" width="14" height="60" rx="7" fill="hsl(30, 40%, 68%)" />

          {/* Legs */}
          <rect x="78" y="242" width="14" height="60" rx="7" fill="hsl(30, 40%, 68%)" />
          <rect x="108" y="242" width="14" height="60" rx="7" fill="hsl(30, 40%, 68%)" />

          {/* Shoes */}
          <ellipse cx="85" cy="308" rx="14" ry="8" fill="hsl(220, 14%, 20%)" />
          <ellipse cx="115" cy="308" rx="14" ry="8" fill="hsl(220, 14%, 20%)" />
        </svg>
      </div>

      {/* Selectors */}
      <div className="px-4 space-y-4">
        {dresses.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Dresses</div>
            <div className="flex gap-2 overflow-x-auto">
              <OptionBtn active={!selectedDress} onClick={() => setSelectedDress(null)} label="None" />
              {dresses.map(d => (
                <ItemOption key={d.id} item={d} active={selectedDress?.id === d.id}
                  onClick={() => { setSelectedDress(d); setSelectedTop(null); setSelectedBottom(null); }} />
              ))}
            </div>
          </div>
        )}

        {!selectedDress && (
          <>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Tops ({tops.length})</div>
              <div className="flex gap-2 overflow-x-auto">
                <OptionBtn active={!selectedTop} onClick={() => setSelectedTop(null)} label="None" />
                {tops.map(t => (
                  <ItemOption key={t.id} item={t} active={selectedTop?.id === t.id} onClick={() => setSelectedTop(t)} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Bottoms ({bottoms.length})</div>
              <div className="flex gap-2 overflow-x-auto">
                <OptionBtn active={!selectedBottom} onClick={() => setSelectedBottom(null)} label="None" />
                {bottoms.map(b => (
                  <ItemOption key={b.id} item={b} active={selectedBottom?.id === b.id} onClick={() => setSelectedBottom(b)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ItemOption: React.FC<{ item: ClothingItem; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => (
  <button
    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${active ? 'border-primary' : 'border-border'}`}
    onClick={onClick}
  >
    <img src={item.frontImage} alt="" className="w-full h-full object-cover" />
  </button>
);

const OptionBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex items-center justify-center text-xs transition-all ${
      active ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
    }`}
    onClick={onClick}
  >{label}</button>
);

export default AvatarScreen;
