import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowLeft,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { EditCassetteModal } from '../../features/cassette/EditCassetteModal';

export const FooterControls: React.FC = () => {
  const {
    activeSection,
    tapes,
    activeTapeIndex,
    setActiveTapeIndex,
    selectedTapeId,
    setSelectedTapeId,
    isPlaying,
    playingTapeId,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    playTape,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    deleteTape,
    setCreateModalOpen,
    setShareModalOpen,
    journals,
    activeJournalIndex,
    setActiveJournalIndex,
    setSelectedJournalId,
    setCreateJournalModalOpen,
    setEditJournalModalOpen,
  } = useTapeStore();

  const [isEditingTape, setIsEditingTape] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const currentTape = tapes[activeTapeIndex] || tapes[0];
  const currentJournal = journals[activeJournalIndex] || journals[0];
  const isTapeSelected = !!selectedTapeId;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex flex-col items-center pointer-events-none select-none pb-[max(0.6rem,env(safe-area-inset-bottom))] px-2 sm:px-4">
        {/* 1. Item Title & Meta (Serif Newsreader Style from Reference) */}
        <div className="mb-2 sm:mb-3 text-center pointer-events-auto transition-opacity duration-300 max-w-xs sm:max-w-md mx-auto">
          {activeSection === 'cassettes' && currentTape && (
            <div>
              <h2 className="font-serif-title text-base sm:text-2xl font-medium tracking-tight text-[#3a2f26] leading-snug truncate">
                {currentTape.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#7d6e5d] mt-0.5 tracking-wide truncate">
                {currentTape.artist} · {formatTime(currentTape.duration)}
                {currentTape.subtitle ? ` · ${currentTape.subtitle}` : ''}
              </p>
            </div>
          )}

          {activeSection === 'journals' && currentJournal && (
            <div>
              <h2 className="font-serif-title text-base sm:text-2xl font-medium tracking-tight text-[#3a2f26] leading-snug truncate">
                {currentJournal.title}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#7d6e5d] mt-0.5 tracking-wide truncate">
                {currentJournal.pages?.length || 0} pages · {currentJournal.subtitle || 'Handcrafted Journal'}
              </p>
            </div>
          )}
        </div>

        {/* 2. Frosted Pill Floating Dock */}
        <div className="pointer-events-auto max-w-[96vw]">
          {activeSection === 'cassettes' ? (
            isTapeSelected ? (
              /* FOCUSED / AUDIO PLAYBACK TOOLBAR */
              <div className="flex items-center gap-1.5 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full crystal-pill shadow-tape-float transition-all animate-in fade-in duration-300 max-w-[96vw]">
                {/* Back to Shelf */}
                <button
                  onClick={() => setSelectedTapeId(null)}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium text-[#3a2f26] hover:bg-black/5 active:scale-95 transition-all"
                  title="Back to shelf"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#7d6e5d]" />
                  <span className="hidden sm:inline">Shelf</span>
                </button>

                <div className="h-4 w-px bg-[#3a2f26]/15" />

                {/* Skip Previous Track */}
                <button
                  onClick={playPrevious}
                  className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 active:scale-95 transition-all"
                  title="Previous song"
                >
                  <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Play / Pause Toggle */}
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] flex items-center justify-center shadow-xs active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play recording'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Skip Next Track */}
                <button
                  onClick={playNext}
                  className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 active:scale-95 transition-all"
                  title="Next song"
                >
                  <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Seek Bar */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="relative w-20 sm:w-48 flex items-center">
                    <div className="w-full h-1.5 bg-[#3a2f26]/12 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3a2f26] rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step="0.5"
                      value={currentTime}
                      onChange={(e) => seek(parseFloat(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>

                  <span className="font-mono text-[10px] sm:text-[11px] text-[#7d6e5d] tabular-nums whitespace-nowrap min-w-[55px] sm:min-w-[70px]">
                    {formatTime(currentTime)}
                  </span>
                </div>

                <div className="hidden sm:block h-4 w-px bg-[#3a2f26]/15" />

                {/* Volume / Mute (Desktop) */}
                <div className="relative hidden sm:flex items-center">
                  <button
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 transition-all"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {showVolumeSlider && (
                    <div
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      className="absolute bottom-full mb-2 -left-8 p-2 rounded-xl crystal-pill shadow-lg flex items-center gap-1.5"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-20 accent-[#3a2f26] cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Edit Cassette */}
                <button
                  onClick={() => setIsEditingTape(true)}
                  className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 transition-all"
                  title="Customize cassette"
                >
                  <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              /* SHELF BROWSING DOCK */
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full crystal-pill shadow-tape-subtle transition-all">
                {/* Previous Cassette */}
                <button
                  onClick={() => setActiveTapeIndex(Math.max(0, activeTapeIndex - 1))}
                  disabled={activeTapeIndex <= 0}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                  title="Previous cassette"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Add New Cassette */}
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 transition-all active:scale-95"
                  title="Add a new recording"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Edit Cassette */}
                <button
                  onClick={() => setIsEditingTape(true)}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 transition-all active:scale-95"
                  title="Edit this cassette"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Share Cassette */}
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 transition-all active:scale-95"
                  title="Share this cassette"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Delete Cassette */}
                <button
                  onClick={() => {
                    if (currentTape && window.confirm(`Remove "${currentTape.title}" from your shelf?`)) {
                      deleteTape(currentTape.id);
                    }
                  }}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-red-700 hover:bg-red-50/50 transition-all active:scale-95"
                  title="Delete this cassette"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Next Cassette */}
                <button
                  onClick={() => setActiveTapeIndex(Math.min(tapes.length - 1, activeTapeIndex + 1))}
                  disabled={activeTapeIndex >= tapes.length - 1}
                  className="p-2 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                  title="Next cassette"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-[#3a2f26]/15 mx-1" />

                {/* Play Button Shortcut */}
                <button
                  onClick={() => {
                    if (isPlaying && (selectedTapeId === currentTape.id || playingTapeId === currentTape.id)) {
                      togglePlay();
                    } else {
                      setSelectedTapeId(currentTape.id);
                      playTape(currentTape.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] text-xs font-medium shadow-xs active:scale-95 transition-all"
                  title={isPlaying && playingTapeId === currentTape.id ? 'Pause recording' : 'Play recording'}
                >
                  {isPlaying && playingTapeId === currentTape.id ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            )
          ) : (
            /* JOURNAL BROWSING DOCK */
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full crystal-pill shadow-tape-subtle transition-all">
              {journals.length > 1 && (
                <>
                  {/* Previous Journal */}
                  <button
                    onClick={() => setActiveJournalIndex(Math.max(0, activeJournalIndex - 1))}
                    disabled={activeJournalIndex <= 0}
                    className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    title="Previous Journal"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-[#7d6e5d] px-1 select-none">
                    {activeJournalIndex + 1} / {journals.length}
                  </span>

                  {/* Next Journal */}
                  <button
                    onClick={() => setActiveJournalIndex(Math.min(journals.length - 1, activeJournalIndex + 1))}
                    disabled={activeJournalIndex >= journals.length - 1}
                    className="p-1.5 rounded-full text-[#7d6e5d] hover:text-[#3a2f26] hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95"
                    title="Next Journal"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-[#3a2f26]/15 mx-1" />
                </>
              )}

              {/* Open Journal 3D Reader */}
              <button
                onClick={() => setSelectedJournalId(currentJournal?.id || null)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] text-xs font-semibold shadow-xs active:scale-95 transition-all"
                title={`Open and read ${currentJournal?.title}`}
              >
                <BookOpen className="w-4 h-4 text-[#d8a25e]" />
                <span>Open {currentJournal?.title || 'Journal'}</span>
              </button>

              {/* Edit Active Journal */}
              {currentJournal && (
                <button
                  onClick={() => setEditJournalModalOpen(true, currentJournal.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full neuro-btn text-xs font-medium text-[#3a2f26] active:scale-95 transition-all"
                  title="Edit this journal's cover, colors, or pages"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#7d6e5d]" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}

              {/* Add More Journals */}
              <button
                onClick={() => setCreateJournalModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full neuro-btn text-xs font-medium text-[#3a2f26] active:scale-95 transition-all"
                title="Create and add a new journal"
              >
                <Plus className="w-3.5 h-3.5 text-[#7d6e5d]" />
                <span>Add Journal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tape Customization / Edit Modal */}
      {isEditingTape && currentTape && (
        <EditCassetteModal
          tape={currentTape}
          onClose={() => setIsEditingTape(false)}
        />
      )}
    </>
  );
};
