import React, { useState } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Check, BookOpen, Sparkles, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_JOURNAL_COLORS = [
  { name: 'Saddle Leather', hex: '#4A3222', material: 'leather' as const },
  { name: 'Forest Linen', hex: '#263D31', material: 'linen' as const },
  { name: 'Raw Kraft', hex: '#B58E5E', material: 'kraft' as const },
  { name: 'Obsidian Matte', hex: '#1E1D1B', material: 'matte' as const },
  { name: 'Clay Terracotta', hex: '#A45B45', material: 'leather' as const },
  { name: 'Prussian Navy', hex: '#233B53', material: 'linen' as const },
  { name: 'Blush Rosé', hex: '#8B485A', material: 'leather' as const },
  { name: 'Frosted Crystal', hex: '#4A7288', material: 'crystal' as const },
];

export const CreateJournalModal: React.FC = () => {
  const { isCreateJournalModalOpen, setCreateJournalModalOpen, addJournal } = useTapeStore();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverColor, setCoverColor] = useState(PRESET_JOURNAL_COLORS[0].hex);
  const [coverMaterial, setCoverMaterial] = useState<'leather' | 'linen' | 'kraft' | 'matte' | 'crystal'>('leather');
  const [elasticColor, setElasticColor] = useState('#242420');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [initialNote, setInitialNote] = useState('');

  if (!isCreateJournalModalOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addJournal({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      cover_color: coverColor,
      cover_material: coverMaterial,
      elastic_color: elasticColor,
      cover_photo: coverPhoto || undefined,
      pages: [
        {
          id: 'page-1',
          page_number: 1,
          title: 'Opening Thoughts & Archive Genesis',
          date: 'Spread 01',
          content: initialNote.trim() || 'First page in this collection journal. Recording notes, track lyrics, and acoustic reflections.',
          photo_url: coverPhoto || undefined,
        },
      ],
    });

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: [coverColor, '#C6BBA8', '#242420'],
      });
    } catch {}

    setCreateJournalModalOpen(false);
    setTitle('');
    setSubtitle('');
    setCoverPhoto('');
    setInitialNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg crystal-modal rounded-3xl overflow-hidden flex flex-col max-h-[92vh] border border-white/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-white/80"
              style={{ backgroundColor: coverColor }}
            >
              <BookOpen className="w-4 h-4 text-white drop-shadow" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">
                Create 3D Paper Journal
              </h2>
              <p className="text-xs text-[#7e6d5d]">
                Customized sketchbook for liner notes & memories
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateJournalModalOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Journal Title *</label>
              <div className="neuro-well rounded-xl px-3 py-2">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autumn Songbook Vol. 2"
                  className="w-full text-xs bg-transparent text-[#242420] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Subtitle / Edition</label>
              <div className="neuro-well rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Master Tape Notes & Lyrics"
                  className="w-full text-xs bg-transparent text-[#242420] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cover Material Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">Cover Material Texture</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'leather', label: 'Leather' },
                { id: 'linen', label: 'Linen' },
                { id: 'kraft', label: 'Raw Kraft' },
                { id: 'matte', label: 'Soft Matte' },
                { id: 'crystal', label: '✨ Crystal' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCoverMaterial(m.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center transition-all ${
                    coverMaterial === m.id
                      ? 'bg-[#3a2f26] text-[#FAF7F2] shadow-xs'
                      : 'neuro-btn text-[#5e4f42]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Color & Elastic Strap */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Cover Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_JOURNAL_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => {
                      setCoverColor(col.hex);
                      setCoverMaterial(col.material);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      coverColor === col.hex
                        ? 'ring-2 ring-offset-2 ring-[#3a2f26] scale-110 shadow-xs'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {coverColor === col.hex && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={coverColor}
                  onChange={(e) => setCoverColor(e.target.value)}
                  className="w-7 h-7 rounded-full border border-black/10 cursor-pointer"
                  title="Custom Color"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Elastic Closure Band Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {['#242420', '#C6BBA8', '#D4AF37', '#7B8469', '#A45B45', '#4A7288'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setElasticColor(hex)}
                    className={`w-6 h-6 rounded-full border border-black/10 transition-all ${
                      elasticColor === hex ? 'ring-2 ring-offset-1 ring-[#3a2f26] scale-110' : ''
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={elasticColor}
                  onChange={(e) => setElasticColor(e.target.value)}
                  className="w-6 h-6 rounded-full border border-black/10 cursor-pointer"
                  title="Custom Strap Color"
                />
              </div>
            </div>
          </div>

          {/* Tipped-in Cover Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">
              Cover Tipped-in Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              {coverPhoto && (
                <div className="relative group">
                  <img
                    src={coverPhoto}
                    alt="Cover"
                    className="w-12 h-14 object-cover rounded-xl border border-black/10 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverPhoto('')}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] shadow"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="neuro-btn px-3 py-1.5 rounded-xl text-xs font-medium text-[#4a3b2f] cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#7e6d5d]" />
                <span>{coverPhoto ? 'Change Photo' : 'Upload Cover Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Initial Liner Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#3a2f26]">Opening Note or Lyrics</label>
            <div className="neuro-well rounded-xl p-2.5">
              <textarea
                rows={3}
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                placeholder="Recording memories, microphone setup, or reflections on the project..."
                className="w-full text-xs bg-transparent text-[#242420] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-[#3a2f26]/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateJournalModalOpen(false)}
              className="neuro-btn px-4 py-2 rounded-full text-xs font-medium text-[#76746E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d8a25e]" />
              <span>Create Journal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
