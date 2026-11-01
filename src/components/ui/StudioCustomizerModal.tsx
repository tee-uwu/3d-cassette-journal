import React from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Sparkles, Sun, Sunset, Moon, Heart, Gem, Layers } from 'lucide-react';
import type { GalleryTheme, GlassStyle, ShelfMaterial } from '../../types';

export const StudioCustomizerModal: React.FC = () => {
  const {
    isCustomizerOpen,
    setCustomizerOpen,
    galleryTheme,
    setGalleryTheme,
    glassStyle,
    setGlassStyle,
    shelfMaterial,
    setShelfMaterial,
  } = useTapeStore();

  if (!isCustomizerOpen) return null;

  const themes: { id: GalleryTheme; name: string; desc: string; icon: React.ReactNode; bg: string }[] = [
    {
      id: 'ethereal',
      name: 'Ethereal Gallery',
      desc: 'Daylight warm exhibition lighting with soft pastel tones',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      bg: 'linear-gradient(135deg, #fcfcfb, #e8ebef)',
    },
    {
      id: 'sunset',
      name: 'Sunset Amber',
      desc: 'Golden hour warmth with rich terracotta radiance',
      icon: <Sunset className="w-4 h-4 text-orange-500" />,
      bg: 'linear-gradient(135deg, #fff8f0, #eed7c5)',
    },
    {
      id: 'obsidian',
      name: 'Obsidian Studio',
      desc: 'Deep OLED darkness with luminous neon highlights',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
      bg: 'linear-gradient(135deg, #1c1815, #0c0908)',
    },
    {
      id: 'rose',
      name: 'Rosé Champagne',
      desc: 'Blush quartz elegance with delicate warm accents',
      icon: <Heart className="w-4 h-4 text-pink-400" />,
      bg: 'linear-gradient(135deg, #fff7f9, #f2dde4)',
    },
    {
      id: 'crystal',
      name: 'Prismatic Crystal',
      desc: 'High-refraction optic ice with crystalline prism glow',
      icon: <Gem className="w-4 h-4 text-cyan-400" />,
      bg: 'linear-gradient(135deg, #f8fcff, #e1eff8)',
    },
  ];

  const glassStyles: { id: GlassStyle; name: string; desc: string }[] = [
    {
      id: 'crystal',
      name: '✨ Crystal Prismatic',
      desc: 'Hyper-specular edge reflections with vibrant saturation & deep blur',
    },
    {
      id: 'frosted',
      name: '🌫️ Frosted Silk',
      desc: 'Soft matte diffusion with understated analog texture',
    },
    {
      id: 'smoked',
      name: '🕶️ Smoked Glass',
      desc: 'Stealth charcoal tinted crystal with ambient back-glow',
    },
  ];

  const shelfMaterials: { id: ShelfMaterial; name: string; desc: string; color: string }[] = [
    {
      id: 'light-wood',
      name: 'Scandinavian Oak',
      desc: 'Natural honey woodgrain shelf with warm studio bounce',
      color: '#d4bda4',
    },
    {
      id: 'dark-wood',
      name: 'Smoked Cedar',
      desc: 'Deep espresso timber with vintage Japanese acoustics',
      color: '#4a382a',
    },
    {
      id: 'crystal-glass',
      name: 'Optical Crystal',
      desc: 'Floating transparent monolithic glass with refraction',
      color: '#a8d5e5',
    },
    {
      id: 'concrete',
      name: 'Architectural Stone',
      desc: 'Raw matte gallery pedestal with subtle mineral flecks',
      color: '#9e9e98',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl crystal-modal rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3a2f26] to-[#7d604b] flex items-center justify-center shadow-xs text-white">
              <Sparkles className="w-4 h-4 text-[#ffd89b]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">
                Studio Customizer
              </h2>
              <p className="text-xs text-[#7e6d5d]">
                Lighting ambiance, crystal glassmorphism & shelf materials
              </p>
            </div>
          </div>
          <button
            onClick={() => setCustomizerOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Ambient Lighting Theme */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3a2f26] uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#d8a25e]" />
                Ambient Gallery Lighting
              </label>
              <span className="text-[10px] font-mono text-[#7e6d5d] capitalize">
                {galleryTheme}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((t) => {
                const isActive = galleryTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setGalleryTheme(t.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-start gap-3 relative overflow-hidden ${
                      isActive
                        ? 'border-[#3a2f26] ring-2 ring-[#3a2f26]/20 bg-white/80 shadow-md scale-[1.01]'
                        : 'border-white/60 bg-white/40 hover:bg-white/70 hover:border-white'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border border-black/10 shadow-xs"
                      style={{ background: t.bg }}
                    >
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#242420] flex items-center justify-between">
                        <span>{t.name}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#3a2f26]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#7e6d5d] leading-snug mt-0.5 line-clamp-2">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Glassmorphism & Neuromorphism Style */}
          <div className="space-y-2.5 pt-2 border-t border-[#3a2f26]/10">
            <label className="text-xs font-bold text-[#3a2f26] uppercase tracking-wider flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-[#d8a25e]" />
              Glass & Neuromorphic Texture
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {glassStyles.map((g) => {
                const isActive = glassStyle === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGlassStyle(g.id)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      isActive
                        ? 'border-[#3a2f26] ring-2 ring-[#3a2f26]/20 bg-white/80 shadow-sm'
                        : 'border-white/60 bg-white/40 hover:bg-white/70 hover:border-white'
                    }`}
                  >
                    <div className="text-xs font-semibold text-[#242420]">
                      {g.name}
                    </div>
                    <p className="text-[10px] text-[#7e6d5d] leading-snug mt-1">
                      {g.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Shelf Pedestal Material */}
          <div className="space-y-2.5 pt-2 border-t border-[#3a2f26]/10">
            <label className="text-xs font-bold text-[#3a2f26] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#d8a25e]" />
              Physical Stand Material
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shelfMaterials.map((s) => {
                const isActive = shelfMaterial === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setShelfMaterial(s.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'border-[#3a2f26] ring-2 ring-[#3a2f26]/20 bg-white/80 shadow-sm'
                        : 'border-white/60 bg-white/40 hover:bg-white/70 hover:border-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg border border-black/10 shadow-xs flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#242420]">
                        {s.name}
                      </div>
                      <p className="text-[10px] text-[#7e6d5d] truncate">
                        {s.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#3a2f26]/10 flex items-center justify-between bg-white/50">
          <p className="text-[11px] text-[#7e6d5d]">
            Preferences automatically persist to your local studio profile
          </p>
          <button
            onClick={() => setCustomizerOpen(false)}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudioCustomizerModal;
