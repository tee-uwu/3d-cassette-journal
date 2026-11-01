import { useEffect } from 'react';
import { SpatialEnvironment } from './three/SpatialEnvironment';
import { Header } from './components/layout/Header';
import { FooterControls } from './components/layout/FooterControls';
import { CassetteDetailsOverlay } from './features/cassette/CassetteDetailsOverlay';
import { CreateCassetteModal } from './features/cassette/CreateCassetteModal';
import { ShareModal } from './features/sharing/ShareModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { JournalReaderModal } from './features/journal/JournalReaderModal';
import { CreateJournalModal } from './features/journal/CreateJournalModal';
import { EditJournalModal } from './features/journal/EditJournalModal';
import { StudioCustomizerModal } from './components/ui/StudioCustomizerModal';
import { useTapeStore } from './stores/useTapeStore';

export function App() {
  const { setVisitorMode } = useTapeStore();

  // Detect share URL format: /c/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/c/')) {
      const token = path.split('/c/')[1];
      if (token) {
        setVisitorMode(true);
      }
    }
  }, [setVisitorMode]);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden ambient-gallery-bg text-[#3a2f26] touch-none select-none">
      {/* Subtle Analog Grain Overlay */}
      <div className="analog-grain" />

      {/* 3D Scene Viewport */}
      <SpatialEnvironment />

      {/* Interface Overlays */}
      <Header />
      <FooterControls />
      <CassetteDetailsOverlay />

      {/* Modals & Overlays */}
      <CreateCassetteModal />
      <ShareModal />
      <SettingsModal />
      <JournalReaderModal />
      <CreateJournalModal />
      <EditJournalModal />
      <StudioCustomizerModal />
    </main>
  );
}

export default App;
