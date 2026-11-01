import React from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

export const PlayerBar: React.FC = () => {
  const {
    tapes,
    selectedTapeId,
    activeTapeIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    playingTapeId,
  } = useTapeStore();

  const currentTape = selectedTapeId
    ? tapes.find((t) => t.id === selectedTapeId)
    : playingTapeId
    ? tapes.find((t) => t.id === playingTapeId)
    : tapes[activeTapeIndex];

  if (!currentTape) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-xl">
      <div className="p-3.5 px-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#E6E4DD] shadow-tape-float flex flex-col gap-2.5">
        {/* Track Title, Artist, & Status indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Mini Cassette Icon with animated spinning reels when playing */}
            <div
              className="relative w-8 h-5 rounded-[4px] border border-black/20 flex items-center justify-around px-1 overflow-hidden flex-shrink-0 shadow-xs"
              style={{ backgroundColor: currentTape.shell_color || '#FAF8F5' }}
            >
              {/* Left reel */}
              <div className={`w-2 h-2 rounded-full border border-black/40 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '1.2s' }}>
                <div className="w-0.5 h-0.5 bg-red-600 rounded-full" />
              </div>
              {/* Center tape bridge */}
              <div className="w-2 h-0.5 bg-black/60 rounded-full" />
              {/* Right reel */}
              <div className={`w-2 h-2 rounded-full border border-black/40 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '1.2s' }}>
                <div className="w-0.5 h-0.5 bg-red-600 rounded-full" />
              </div>
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-[#242420] truncate">
                  {currentTape.title}
                </h4>
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-bounce" style={{ height: '70%', animationDuration: '400ms' }} />
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-bounce" style={{ height: '100%', animationDuration: '600ms' }} />
                    <span className="w-0.5 bg-emerald-500 rounded-full animate-bounce" style={{ height: '40%', animationDuration: '350ms' }} />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#898780] truncate">
                {currentTape.artist} {currentTape.subtitle ? `• ${currentTape.subtitle}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#898780] tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Scrubbing timeline */}
        <div className="relative group w-full py-1 cursor-pointer">
          <div className="w-full h-1.5 bg-[#EFEEE9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#242420] transition-all rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Tape transport status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-[#C6BBA8]'
              }`}
            />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#898780]">
              {isPlaying ? 'PLAYING' : 'STOPPED'}
            </span>
          </div>

          {/* Main buttons: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-3">
            <button
              onClick={playPrevious}
              className="p-1.5 rounded-full text-[#76746E] hover:text-[#242420] hover:bg-[#EFEEE9] transition-all active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[#242420] text-white flex items-center justify-center hover:bg-[#383832] transition-all active:scale-95 shadow-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 rounded-full text-[#76746E] hover:text-[#242420] hover:bg-[#EFEEE9] transition-all active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 text-[#898780] hover:text-[#242420] transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-[#E6E4DD] rounded-lg appearance-none cursor-pointer accent-[#242420]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
