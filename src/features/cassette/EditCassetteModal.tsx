import React, { useState } from 'react';
import type { Tape } from '../../types';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Check, Disc3, Image as ImageIcon } from 'lucide-react';

const PRESET_LABEL_COLORS = [
  { name: 'Warm Ivory', hex: '#D6C7B2' },
  { name: 'Dusty Sage', hex: '#A8B5A0' },
  { name: 'Clay Terracotta', hex: '#C98A75' },
  { name: 'Slate Indigo', hex: '#8C96A5' },
  { name: 'Pale Rose', hex: '#D8B4A8' },
  { name: 'Studio Noir', hex: '#3C3B37' },
  { name: 'Analog Amber', hex: '#D97746' },
  { name: 'Vintage Moss', hex: '#7B8469' },
];

const PRESET_SHELL_COLORS = [
  { name: 'Crystal Clear', hex: '#FFFFFF', type: 'transparent' as const },
  { name: 'Vintage Amber Tint', hex: '#F0B96A', type: 'transparent' as const },
  { name: 'Smoked Obsidian', hex: '#2C2B29', type: 'transparent' as const },
  { name: 'Cobalt Blue', hex: '#3E6898', type: 'transparent' as const },
  { name: 'Ruby Tint', hex: '#C94452', type: 'transparent' as const },
  { name: 'Jade Frosted', hex: '#589B77', type: 'frosted' as const },
  { name: 'Matte Cream Biscuit', hex: '#E8E1D3', type: 'solid' as const },
  { name: 'Matte Jet Black', hex: '#161614', type: 'solid' as const },
];

interface EditCassetteModalProps {
  tape: Tape;
  onClose: () => void;
}

export const EditCassetteModal: React.FC<EditCassetteModalProps> = ({ tape, onClose }) => {
  const { updateTape } = useTapeStore();

  const [title, setTitle] = useState(tape.title);
  const [artist, setArtist] = useState(tape.artist);
  const [subtitle, setSubtitle] = useState(tape.subtitle || '');
  const [description, setDescription] = useState(tape.description || '');
  const [labelColor, setLabelColor] = useState(tape.label_color);
  const [shellColor, setShellColor] = useState(tape.shell_color || '#FFFFFF');
  const [shellType, setShellType] = useState(tape.shell_type || 'transparent');
  const [labelStyle, setLabelStyle] = useState(tape.label_style || 'photo-full');
  const [artworkUrl, setArtworkUrl] = useState(tape.artwork_path || '');

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setArtworkUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTape(tape.id, {
      title: title.trim(),
      artist: artist.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      label_color: labelColor,
      shell_color: shellColor,
      shell_type: shellType,
      label_style: labelStyle,
      artwork_path: artworkUrl || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg crystal-modal rounded-3xl overflow-hidden flex flex-col max-h-[92vh] border border-white/60 shadow-2xl">
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3a2f26] to-[#6d5543] flex items-center justify-center shadow-xs text-white">
              <Disc3 className="w-4 h-4 text-[#d8a25e]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">Customize Cassette</h2>
              <p className="text-xs text-[#7e6d5d]">Physical acrylic shell, tape label & artwork</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Cassette Shell Color & Label Accent */}
          <div className="space-y-3 p-4 bg-white/60 rounded-2xl border border-white/80 shadow-xs">
            <div>
              <label className="text-xs font-semibold text-[#3a2f26]">
                Cassette Body Color & Shell Tint
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {PRESET_SHELL_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => {
                      setShellColor(col.hex);
                      setShellType(col.type);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      shellColor === col.hex ? 'ring-2 ring-offset-2 ring-[#3a2f26] scale-110 shadow-xs' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex, border: '1px solid rgba(0,0,0,0.1)' }}
                    title={col.name}
                  >
                    {shellColor === col.hex && (
                      <Check className={`w-3.5 h-3.5 ${col.hex === '#FFFFFF' ? 'text-black' : 'text-white'} drop-shadow`} />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={shellColor}
                  onChange={(e) => setShellColor(e.target.value)}
                  className="w-7 h-7 rounded-full border border-black/10 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#3a2f26]/10">
              <label className="text-xs font-semibold text-[#3a2f26]">
                Label Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {PRESET_LABEL_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setLabelColor(col.hex)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      labelColor === col.hex ? 'ring-2 ring-offset-2 ring-[#3a2f26] scale-110 shadow-xs' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {labelColor === col.hex && (
                      <Check className="w-3 h-3 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Picture & Label Style */}
          <div className="space-y-2 p-4 bg-white/60 rounded-2xl border border-white/80 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#3a2f26]">Artwork Style on Cassette</label>
              <div className="flex items-center gap-1.5 text-[11px]">
                {(['photo-full', 'polaroid', 'standard'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setLabelStyle(s)}
                    className={`px-2.5 py-0.5 rounded-full capitalize font-medium transition-all ${
                      labelStyle === s ? 'bg-[#3a2f26] text-white shadow-xs' : 'text-[#7e6d5d] hover:text-[#3a2f26]'
                    }`}
                  >
                    {s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {artworkUrl && (
                <img
                  src={artworkUrl}
                  alt="Current Artwork"
                  className="w-12 h-12 rounded-xl object-cover border border-black/10 shadow-xs"
                />
              )}
              <label className="neuro-btn px-3 py-1.5 rounded-xl text-xs font-medium text-[#4a3b2f] cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#7e6d5d]" />
                <span>{artworkUrl ? 'Change Artwork' : 'Upload Tape Artwork'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Title & Artist */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Title</label>
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
              <label className="text-xs font-semibold text-[#3a2f26]">Artist</label>
              <div className="neuro-well rounded-xl px-3 py-2">
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full text-xs bg-transparent text-[#242420] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">Subtitle</label>
            <div className="neuro-well rounded-xl px-3 py-2">
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs bg-transparent text-[#242420] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">Description</label>
            <div className="neuro-well rounded-xl p-2.5">
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-transparent text-[#242420] focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#3a2f26]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="neuro-btn px-4 py-2 rounded-full text-xs font-medium text-[#76746E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#3a2f26] text-white hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
