import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/lib/types';
import { getProfile, getWardrobe } from '@/lib/storage';
import Onboarding from '@/components/Onboarding';
import HomeScreen from '@/components/HomeScreen';
import WardrobeScreen from '@/components/WardrobeScreen';
import AddItemScreen from '@/components/AddItemScreen';
import MatchScreen from '@/components/MatchScreen';
import ItemDetailScreen from '@/components/ItemDetailScreen';
import PreBuyScreen from '@/components/PreBuyScreen';
import AvatarScreen from '@/components/AvatarScreen';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screen, setScreen] = useState('home');
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const p = getProfile();
    if (p?.onboarded) setProfile(p);
  }, []);

  const navigate = useCallback((target: string) => {
    setScreen(target);
    forceUpdate(n => n + 1); // refresh data
    window.scrollTo(0, 0);
  }, []);

  if (!profile) {
    return <Onboarding onComplete={p => setProfile(p)} />;
  }

  const activeNav = screen.startsWith('item:') ? 'wardrobe' : screen.startsWith('match') ? 'match' : screen;
  const showNav = !['add'].includes(screen);

  const renderScreen = () => {
    if (screen === 'home') return <HomeScreen onNavigate={navigate} userName={profile.name} />;
    if (screen === 'wardrobe') return <WardrobeScreen onNavigate={navigate} />;
    if (screen === 'add') return <AddItemScreen onNavigate={navigate} onDone={() => navigate('wardrobe')} />;
    if (screen === 'prebuy') return <PreBuyScreen onNavigate={navigate} />;
    if (screen === 'avatar') return <AvatarScreen profile={profile} onNavigate={navigate} />;

    if (screen.startsWith('item:')) {
      const id = screen.split(':')[1];
      return <ItemDetailScreen itemId={id} onNavigate={navigate} />;
    }

    if (screen.startsWith('match')) {
      const id = screen.split(':')[1];
      const item = id ? getWardrobe().find(i => i.id === id) : undefined;
      return <MatchScreen onNavigate={navigate} selectedItem={item} />;
    }

    return <HomeScreen onNavigate={navigate} userName={profile.name} />;
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background">
      {renderScreen()}
      {showNav && <BottomNav active={activeNav} onNavigate={navigate} />}
    </div>
  );
};

export default Index;
