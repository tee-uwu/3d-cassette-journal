import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Database, RotateCcw, Sliders } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    collection,
    updateCollection,
  } = useTapeStore();

  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || '');

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCollection({
      title: title.trim(),
      description: description.trim(),
    });
    setSettingsModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset collection to initial 5 master studio cassettes? Your changes will be restored.')) {
      localStorage.removeItem('tape_collection_tapes_v4');
      localStorage.removeItem('tape_collection_metadata_v4');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md crystal-modal rounded-3xl overflow-hidden flex flex-col border border-white/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3a2f26] to-[#6d5543] flex items-center justify-center shadow-xs text-white">
              <Sliders className="w-4 h-4 text-[#d8a25e]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">
                Archive Settings
              </h2>
              <p className="text-xs text-[#7e6d5d]">
                Collection metadata & storage engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">
              Collection Name
            </label>
            <div className="neuro-well rounded-xl px-3 py-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs bg-transparent text-[#242420] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">
              Archival Notes / Description
            </label>
            <div className="neuro-well rounded-xl p-2.5">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-transparent text-[#242420] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Database & Cloud status */}
          <div className="p-3.5 bg-white/60 rounded-2xl border border-white/80 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#242420]">
              <Database className="w-4 h-4 text-[#898780]" />
              <span>Persistence & Storage Engine</span>
            </div>
            <p className="text-[11px] text-[#7e6d5d] leading-relaxed">
              Active: <span className="font-semibold text-[#242420]">High-Speed Local Storage</span> + Supabase Client Sync. Audio, custom journals & themes are automatically preserved.
            </p>
          </div>

          {/* Reset button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-[#7e6d5d] hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to default 5 master recordings</span>
            </button>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#3a2f26]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(false)}
              className="neuro-btn px-4 py-2 rounded-full text-xs font-medium text-[#76746E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
