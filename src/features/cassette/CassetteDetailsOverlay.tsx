import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Play, Pause, Edit3, Trash2, Calendar, Clock } from 'lucide-react';
import { EditCassetteModal } from './EditCassetteModal';

export const CassetteDetailsOverlay: React.FC = () => {
  const {
    tapes,
    selectedTapeId,
    isPlaying,
    setSelectedTapeId,
    deleteTape,
    togglePlay,
    isVisitorMode,
  } = useTapeStore();

  const [isEditing, setIsEditing] = useState(false);

  const selectedTape = tapes.find((t) => t.id === selectedTapeId);
  if (!selectedTape) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Archive Record';
    }
  };

  return (
    <>
      <div className="absolute top-20 right-8 z-30 w-80 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="p-5 rounded-3xl crystal-card border border-white/80 shadow-2xl flex flex-col gap-4">
          {/* Top header with close button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border border-black/10 shadow-xs"
                style={{ backgroundColor: selectedTape.label_color }}
              />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7e6d5d]">
                TAPE #{selectedTape.id.slice(-4)}
              </span>
            </div>

            <button
              onClick={() => setSelectedTapeId(null)}
              className="p-1 rounded-full text-[#7e6d5d] hover:text-[#242420] hover:bg-black/5 transition-colors"
              title="Close Inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Artist */}
          <div>
            <h3 className="text-base font-semibold text-[#242420] tracking-tight leading-snug">
              {selectedTape.title}
            </h3>
            <p className="text-xs text-[#76746E] mt-0.5 font-medium">
              {selectedTape.artist}
            </p>
            {selectedTape.subtitle && (
              <p className="text-[11px] text-[#A8A49C] italic mt-0.5">
                {selectedTape.subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          {selectedTape.description && (
            <p className="text-xs text-[#52504A] leading-relaxed neuro-well p-3 rounded-xl border border-black/5">
              {selectedTape.description}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex items-center gap-3 text-[11px] text-[#7e6d5d] font-mono">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(selectedTape.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(selectedTape.created_at)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-[#3a2f26]/10">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#242420] text-white hover:bg-[#34342e] shadow-xs transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause' : 'Play Tape'}</span>
            </button>

            {!isVisitorMode && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#242420] hover:bg-black/5 transition-colors"
                  title="Edit Tape"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Remove "${selectedTape.title}" from your collection?`)) {
                      deleteTape(selectedTape.id);
                    }
                  }}
                  className="p-1.5 rounded-full text-[#7e6d5d] hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Tape"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <EditCassetteModal
          tape={selectedTape}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};
