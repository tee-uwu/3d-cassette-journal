import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { Share2, Settings, Search, Eye, Disc3, BookOpen, Layers, LayoutGrid, Sparkles, X, PenTool } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    selectedJournalId,
    tapes,
    journals,
    activeJournalIndex,
    mode,
    setMode,
    searchQuery,
    isVisitorMode,
    setSearchQuery,
    setShareModalOpen,
    setSettingsModalOpen,
    setCustomizerOpen,
  } = useTapeStore();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const currentJournal = journals[activeJournalIndex] || journals[0];
  const isJournalMode = activeSection === 'journals';

  // Prevent duplicate header overlay when journal reader is open
  if (isJournalMode && selectedJournalId) {
    return null;
  }

  const countText =
    activeSection === 'cassettes'
      ? `${tapes.length} recording${tapes.length === 1 ? '' : 's'}`
      : `${currentJournal?.pages?.length || 7} Pages`;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-6 pt-[max(0.6rem,env(safe-area-inset-top))] pb-1 sm:pb-2 flex flex-col pointer-events-none select-none">
      {/* Top Action Row */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Brand Monogram & Desktop Search */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs transition-colors ${
              isJournalMode
                ? 'bg-white/12 border border-white/20 text-white backdrop-blur-md'
                : 'crystal-pill text-[#3a2f26]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] tracking-wider ${
                isJournalMode ? 'bg-white text-[#181d2c]' : 'bg-[#3a2f26] text-[#FAF7F2]'
              }`}
            >
              {isJournalMode ? 'P' : 'T'}
            </div>
            <span className={`font-semibold tracking-wider text-[11px] ${isJournalMode ? 'text-white' : 'text-[#3a2f26]'}`}>
              {isJournalMode ? 'PAPER' : 'TAPE'}
            </span>
          </div>

          {/* Desktop Search */}
          <div className="relative hidden md:flex items-center">
            <Search className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${isJournalMode ? 'text-white/60' : 'text-[#7d6e5d]'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isJournalMode ? 'Search journals...' : 'Search tapes...'}
              className={`w-28 focus:w-44 transition-all duration-300 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none ${
                isJournalMode
                  ? 'bg-white/12 border border-white/20 text-white placeholder-white/50 backdrop-blur-md focus:ring-1 focus:ring-white/40'
                  : 'crystal-pill text-[#3a2f26] placeholder-[#9c8e7e] focus:ring-1 focus:ring-[#7d6e5d]/30'
              }`}
            />
          </div>
        </div>

        {/* Center: Segment Pill (Tapes / Journals) */}
        <div className="pointer-events-auto">
          <div
            className={`flex items-center gap-1 p-0.5 sm:p-1 rounded-full shadow-xs transition-colors ${
              isJournalMode
                ? 'bg-black/25 border border-white/15 backdrop-blur-md'
                : 'crystal-pill'
            }`}
          >
            <button
              onClick={() => setActiveSection('cassettes')}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                activeSection === 'cassettes'
                  ? 'bg-[#3a2f26] text-[#FAF7F2] shadow-xs'
                  : isJournalMode
                  ? 'text-white/70 hover:text-white'
                  : 'text-[#7d6e5d] hover:text-[#3a2f26]'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Tapes</span>
            </button>

            <button
              onClick={() => setActiveSection('journals')}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                activeSection === 'journals'
                  ? isJournalMode
                    ? 'bg-white text-[#181d2c] shadow-md'
                    : 'bg-[#3a2f26] text-[#FAF7F2] shadow-xs'
                  : 'text-[#7d6e5d] hover:text-[#3a2f26]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Journals</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`md:hidden p-1.5 rounded-full shadow-xs transition-colors ${
              isJournalMode
                ? 'bg-white/12 border border-white/20 text-white'
                : 'crystal-pill text-[#7d6e5d] hover:text-[#3a2f26]'
            }`}
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Spatial / Shelf arrangement (cassettes only) */}
          {activeSection === 'cassettes' && (
            <button
              onClick={() => setMode(mode === 'carousel' ? 'spatial' : 'carousel')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium crystal-pill text-[#3a2f26] hover:bg-white/70 active:scale-95 transition-all shadow-xs"
              title="Switch between the shelf and a free spatial arrangement"
            >
              {mode === 'carousel' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-[#7d6e5d]" />
                  <span>Arrange</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#7d6e5d]" />
                  <span>Shelf</span>
                </>
              )}
            </button>
          )}

          {/* Studio Customizer Pill */}
          <button
            onClick={() => setCustomizerOpen(true)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all active:scale-95 group ${
              isJournalMode
                ? 'bg-white/12 border border-white/20 text-white hover:bg-white/20'
                : 'crystal-pill text-[#3a2f26] hover:bg-white/80'
            }`}
            title="Customize Studio Ambiance & Materials"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d8a25e] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Look</span>
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium shadow-xs transition-all active:scale-95 ${
              isJournalMode
                ? 'bg-white/12 border border-white/20 text-white hover:bg-white/20'
                : 'crystal-pill text-[#3a2f26] hover:bg-white/70'
            }`}
            title="Share Collection"
          >
            <Share2 className={`w-3.5 h-3.5 ${isJournalMode ? 'text-white/80' : 'text-[#7d6e5d]'}`} />
            <span className="hidden md:inline">Share</span>
          </button>

          <button
            onClick={() => setSettingsModalOpen(true)}
            className={`p-1.5 rounded-full shadow-xs transition-all active:scale-95 ${
              isJournalMode
                ? 'bg-white/12 border border-white/20 text-white hover:bg-white/20'
                : 'crystal-pill text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-white/70'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isVisitorMode && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-900 bg-amber-50/80 border border-amber-200 backdrop-blur-sm">
              <Eye className="w-3 h-3" /> Visitor
            </span>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="w-full mt-2 pointer-events-auto md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center w-full">
            <Search className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${isJournalMode ? 'text-white/60' : 'text-[#7d6e5d]'}`} />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isJournalMode ? 'Search journals...' : 'Search tapes...'}
              className={`w-full pl-8 pr-8 py-1.5 rounded-full text-xs focus:outline-none ${
                isJournalMode
                  ? 'bg-white/15 border border-white/25 text-white placeholder-white/50'
                  : 'crystal-pill text-[#3a2f26] placeholder-[#9c8e7e]'
              }`}
            />
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute right-2.5 p-0.5 text-white/70"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtitle / Active Collection Info (Paper for iOS style when in journals) */}
      <div className="text-center mt-1 sm:mt-2 pointer-events-auto">
        {isJournalMode ? (
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight capitalize">
              {currentJournal?.title || 'Journal'}
            </h1>
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 font-medium tracking-wide mt-0.5">
              <PenTool className="w-3 h-3 text-white/60" />
              <span>{countText}</span>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="font-serif-title text-base sm:text-2xl font-medium tracking-tight text-[#3a2f26] leading-tight truncate max-w-xs sm:max-w-md mx-auto">
              bhoi ka song tapes
            </h1>
            <p className="text-[10px] sm:text-xs text-[#7d6e5d] font-medium tracking-wide">
              {countText}
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
