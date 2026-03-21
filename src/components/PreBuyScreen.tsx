import React, { useState, useRef } from 'react';
import { ClothingCategory, CATEGORY_LABELS } from '@/lib/types';
import { getWardrobe } from '@/lib/storage';
import { extractDominantColor } from '@/lib/colorUtils';
import { preBuyAnalysis } from '@/lib/matchingEngine';
import { ArrowLeft, Camera, Image, ShoppingBag, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreBuyScreenProps {
  onNavigate: (screen: string) => void;
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ClothingCategory[];

const PreBuyScreen: React.FC<PreBuyScreenProps> = ({ onNavigate }) => {
  const [image, setImage] = useState('');
  const [color, setColor] = useState({ hex: '#888888', name: 'Gray' });
  const [category, setCategory] = useState<ClothingCategory>('tshirt');
  const [result, setResult] = useState<ReturnType<typeof preBuyAnalysis> | null>(null);
  const [step, setStep] = useState<'capture' | 'category' | 'result'>('capture');
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImage(dataUrl);
      setProcessing(true);
      const c = await extractDominantColor(dataUrl);
      setColor(c);
      setProcessing(false);
      setStep('category');
    };
    reader.readAsDataURL(file);
  };

  const analyze = () => {
    const wardrobe = getWardrobe();
    const r = preBuyAnalysis(color.hex, category, wardrobe);
    setResult(r);
    setStep('result');
  };

  const recIcon = result?.recommendation === 'buy' ? Check : result?.recommendation === 'skip' ? X : AlertTriangle;
  const RecIcon = recIcon;
  const recColor = result?.recommendation === 'buy' ? 'text-success' : result?.recommendation === 'skip' ? 'text-destructive' : 'text-warning';
  const recBg = result?.recommendation === 'buy' ? 'bg-success/10' : result?.recommendation === 'skip' ? 'bg-destructive/10' : 'bg-warning/10';
  const recLabel = result?.recommendation === 'buy' ? 'Go for it!' : result?.recommendation === 'skip' ? 'Skip it' : 'Think about it';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <button onClick={() => onNavigate('home')}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display flex-1">Pre-Buy Assistant</h1>
        <ShoppingBag className="w-5 h-5 text-primary" />
      </div>

      <div className="p-6 animate-fade-in">
        {step === 'capture' && (
          <>
            <h2 className="text-xl font-display mb-2">Thinking of buying?</h2>
            <p className="text-sm text-muted-foreground mb-6">Snap a photo and we'll check if it fits your wardrobe</p>

            <div className="space-y-3">
              <button className="w-full aspect-[3/4] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors"
                onClick={() => cameraRef.current?.click()}>
                <Camera className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Take Photo</span>
              </button>
              <button className="w-full py-3 border border-border rounded-xl flex items-center justify-center gap-2 hover:border-primary/50"
                onClick={() => fileRef.current?.click()}>
                <Image className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload from Gallery</span>
              </button>
            </div>

            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </>
        )}

        {step === 'category' && (
          <>
            <div className="flex gap-4 mb-6">
              <img src={image} alt="" className="w-24 h-32 object-cover rounded-lg" />
              <div>
                <div className="text-sm font-medium mb-1">Detected Color</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: color.hex }} />
                  <span className="text-sm text-muted-foreground">{color.name}</span>
                </div>
              </div>
            </div>

            <label className="text-sm text-muted-foreground mb-2 block">What type of item is this?</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ALL_CATEGORIES.map(c => (
                <button key={c}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    category === c ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
                  }`}
                  onClick={() => setCategory(c)}
                >{CATEGORY_LABELS[c]}</button>
              ))}
            </div>

            <Button className="w-full" onClick={analyze}>Analyze Compatibility</Button>
          </>
        )}

        {step === 'result' && result && (
          <>
            {/* Verdict */}
            <div className={`${recBg} rounded-xl p-6 text-center mb-6`}>
              <RecIcon className={`w-12 h-12 mx-auto mb-3 ${recColor}`} />
              <div className={`text-2xl font-display font-bold ${recColor}`}>{recLabel}</div>
              <div className="text-sm text-muted-foreground mt-2">{result.reason}</div>
            </div>

            {/* Score */}
            <div className="glass-card rounded-xl p-4 mb-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Wardrobe Compatibility</div>
              <div className={`text-4xl font-display font-bold ${
                result.matchScore >= 75 ? 'score-high' : result.matchScore >= 60 ? 'score-medium' : 'score-low'
              }`}>
                {result.matchScore}<span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Similar items */}
            {result.similarItems.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-2">Similar items you own ({result.similarItems.length})</div>
                <div className="flex gap-2 overflow-x-auto">
                  {result.similarItems.map(item => (
                    <div key={item.id} className="flex-shrink-0 w-16">
                      <img src={item.frontImage} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="secondary" className="w-full" onClick={() => { setStep('capture'); setImage(''); setResult(null); }}>
              Check Another Item
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreBuyScreen;
