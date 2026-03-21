import React, { useState, useRef } from 'react';
import { ClothingItem, ClothingCategory, CATEGORY_LABELS } from '@/lib/types';
import { addItem, generateId } from '@/lib/storage';
import { extractDominantColor } from '@/lib/colorUtils';
import { Camera, Image, ArrowLeft, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddItemScreenProps {
  onNavigate: (screen: string) => void;
  onDone: () => void;
}

type Step = 'capture' | 'details' | 'confirm';

const PATTERNS = ['solid', 'striped', 'plaid', 'floral', 'printed', 'other'] as const;
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ClothingCategory[];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const AddItemScreen: React.FC<AddItemScreenProps> = ({ onNavigate, onDone }) => {
  const [step, setStep] = useState<Step>('capture');
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [capturingSide, setCapturingSide] = useState<'front' | 'back'>('front');
  const [dominantColor, setDominantColor] = useState({ hex: '#888888', name: 'Gray' });
  const [category, setCategory] = useState<ClothingCategory>('tshirt');
  const [pattern, setPattern] = useState<typeof PATTERNS[number]>('solid');
  const [size, setSize] = useState('M');
  const [notes, setNotes] = useState('');
  const [occasion, setOccasion] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (dataUrl: string) => {
    if (capturingSide === 'front') {
      setFrontImage(dataUrl);
      setProcessing(true);
      const color = await extractDominantColor(dataUrl);
      setDominantColor(color);
      setProcessing(false);
    } else {
      setBackImage(dataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveItem = () => {
    const item: ClothingItem = {
      id: generateId(),
      frontImage, backImage: backImage || undefined,
      category, dominantColor: dominantColor.hex, colorName: dominantColor.name,
      pattern, size, notes, occasion: occasion || undefined,
      addedAt: Date.now(),
    };
    addItem(item);
    onDone();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <button onClick={() => onNavigate('home')}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-display flex-1">Add Item</h1>
        <div className="flex gap-1.5">
          {['capture', 'details', 'confirm'].map((s, i) => (
            <div key={s} className={`w-2 h-2 rounded-full ${step === s ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="p-6 pb-24 animate-fade-in">
        {step === 'capture' && (
          <>
            <h2 className="text-xl font-display mb-1">
              {capturingSide === 'front' ? 'Front View' : 'Back View (Optional)'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {capturingSide === 'front' ? 'Capture or upload the front of your item' : 'Add the back view for better matching'}
            </p>

            {(capturingSide === 'front' ? frontImage : backImage) ? (
              <div className="relative mb-6">
                <img src={capturingSide === 'front' ? frontImage : backImage}
                  alt="" className="w-full aspect-[3/4] object-cover rounded-xl border border-border" />
                <button
                  className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm p-2 rounded-full"
                  onClick={() => capturingSide === 'front' ? setFrontImage('') : setBackImage('')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {processing && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="text-sm text-muted-foreground">Analyzing colors...</div>
                  </div>
                )}
                {capturingSide === 'front' && frontImage && !processing && (
                  <div className="absolute bottom-3 left-3 right-3 glass-card rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-border" style={{ backgroundColor: dominantColor.hex }} />
                    <div>
                      <div className="text-sm font-medium">{dominantColor.name}</div>
                      <div className="text-xs text-muted-foreground">{dominantColor.hex}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-6">
                <button
                  className="w-full aspect-[3/4] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Take Photo</span>
                </button>
                <button
                  className="w-full py-3 border border-border rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload from Gallery</span>
                </button>
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="flex gap-3">
              {capturingSide === 'front' && frontImage && (
                <>
                  <Button variant="secondary" className="flex-1" onClick={() => setCapturingSide('back')}>
                    Add Back View
                  </Button>
                  <Button className="flex-1" onClick={() => setStep('details')}>
                    Continue
                  </Button>
                </>
              )}
              {capturingSide === 'back' && (
                <Button className="flex-1" onClick={() => setStep('details')}>
                  {backImage ? 'Continue' : 'Skip'}
                </Button>
              )}
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <h2 className="text-xl font-display mb-6">Item Details</h2>

            <label className="text-sm text-muted-foreground mb-2 block">Category</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {ALL_CATEGORIES.map(c => (
                <button key={c}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    category === c ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                  onClick={() => setCategory(c)}
                >{CATEGORY_LABELS[c]}</button>
              ))}
            </div>

            <label className="text-sm text-muted-foreground mb-2 block">Pattern</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {PATTERNS.map(p => (
                <button key={p}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                    pattern === p ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
                  }`}
                  onClick={() => setPattern(p)}
                >{p}</button>
              ))}
            </div>

            <label className="text-sm text-muted-foreground mb-2 block">Size</label>
            <div className="flex gap-2 mb-6">
              {SIZES.map(s => (
                <button key={s}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                    size === s ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
                  }`}
                  onClick={() => setSize(s)}
                >{s}</button>
              ))}
            </div>

            <label className="text-sm text-muted-foreground mb-2 block">Occasion (optional)</label>
            <input
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Work, Casual, Party"
              value={occasion} onChange={e => setOccasion(e.target.value)}
            />

            <label className="text-sm text-muted-foreground mb-2 block">Notes / Memory</label>
            <textarea
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3} placeholder="Where did you get it? Special memory?"
              value={notes} onChange={e => setNotes(e.target.value)}
            />

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('capture')}>Back</Button>
              <Button className="flex-1" onClick={() => setStep('confirm')}>Review</Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 className="text-xl font-display mb-6">Confirm Item</h2>
            <div className="glass-card rounded-xl p-4 mb-6">
              <div className="flex gap-4">
                <img src={frontImage} alt="" className="w-24 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="font-medium mb-1">{CATEGORY_LABELS[category]}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: dominantColor.hex }} />
                    <span className="text-sm text-muted-foreground">{dominantColor.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">Pattern: {pattern}</div>
                  <div className="text-xs text-muted-foreground">Size: {size}</div>
                  {occasion && <div className="text-xs text-muted-foreground mt-1">{occasion}</div>}
                  {notes && <div className="text-xs text-muted-foreground mt-1 italic">"{notes}"</div>}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('details')}>Edit</Button>
              <Button className="flex-1" onClick={saveItem}>
                <Check className="w-4 h-4 mr-1" /> Save Item
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddItemScreen;
