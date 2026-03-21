import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { saveProfile } from '@/lib/storage';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', age: '', gender: '' as UserProfile['gender'],
    height: '', weight: '', bodyShape: '' as UserProfile['bodyShape'],
    clothingSize: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.age && form.gender;
    if (step === 2) return form.height && form.weight;
    if (step === 3) return form.bodyShape && form.clothingSize;
    return false;
  };

  const finish = () => {
    const profile: UserProfile = {
      name: form.name, age: Number(form.age), gender: form.gender,
      height: Number(form.height), weight: Number(form.weight),
      bodyShape: form.bodyShape, clothingSize: form.clothingSize, onboarded: true,
    };
    saveProfile(profile);
    onComplete(profile);
  };

  const genders = [
    { value: 'male', label: 'Male', icon: '♂' },
    { value: 'female', label: 'Female', icon: '♀' },
    { value: 'non-binary', label: 'Non-binary', icon: '⚧' },
  ];

  const bodyShapes = [
    { value: 'slim', label: 'Slim', icon: '│' },
    { value: 'athletic', label: 'Athletic', icon: '▽' },
    { value: 'average', label: 'Average', icon: '▢' },
    { value: 'curvy', label: 'Curvy', icon: '◠' },
    { value: 'plus', label: 'Plus', icon: '◉' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  return (
    <div className="min-h-screen flex flex-col bg-background p-6">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col animate-fade-in">
        {step === 0 && (
          <>
            <h1 className="text-3xl font-display mb-2">Welcome to <span className="text-gradient">MyDress</span></h1>
            <p className="text-muted-foreground mb-8">Let's set up your style profile</p>
            <label className="text-sm text-muted-foreground mb-2">Your name</label>
            <input
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              autoFocus
            />
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-display mb-6">About You</h2>
            <label className="text-sm text-muted-foreground mb-2">Age</label>
            <input
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
              type="number" placeholder="25" value={form.age}
              onChange={e => update('age', e.target.value)}
            />
            <label className="text-sm text-muted-foreground mb-2">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {genders.map(g => (
                <button key={g.value}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    form.gender === g.value ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                  onClick={() => update('gender', g.value)}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div className="text-sm">{g.label}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-display mb-6">Body Measurements</h2>
            <label className="text-sm text-muted-foreground mb-2">Height (cm)</label>
            <input
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
              type="number" placeholder="170" value={form.height}
              onChange={e => update('height', e.target.value)}
            />
            <label className="text-sm text-muted-foreground mb-2">Weight (kg)</label>
            <input
              className="bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              type="number" placeholder="70" value={form.weight}
              onChange={e => update('weight', e.target.value)}
            />
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-2xl font-display mb-6">Body Shape & Size</h2>
            <label className="text-sm text-muted-foreground mb-3">Body shape</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {bodyShapes.map(s => (
                <button key={s.value}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    form.bodyShape === s.value ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                  onClick={() => update('bodyShape', s.value)}
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xs">{s.label}</div>
                </button>
              ))}
            </div>
            <label className="text-sm text-muted-foreground mb-3">Clothing size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <button key={s}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    form.clothingSize === s ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                  onClick={() => update('clothingSize', s)}
                >{s}</button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setStep(s => s - 1)}>Back</Button>
        )}
        {step < 3 ? (
          <Button className="flex-1" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Continue</Button>
        ) : (
          <Button className="flex-1" disabled={!canNext()} onClick={finish}>Get Started</Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
