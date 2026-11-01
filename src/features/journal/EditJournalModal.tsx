import React, { useState, useEffect } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Check, BookOpen, Trash2, Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import type { JournalPage } from '../../types';

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

export const EditJournalModal: React.FC = () => {
  const {
    isEditJournalModalOpen,
    editingJournalId,
    journals,
    setEditJournalModalOpen,
    updateJournal,
    deleteJournal,
    addJournalPage,
    deleteJournalPage,
  } = useTapeStore();

  const journal = journals.find((j) => j.id === editingJournalId) || journals[0];

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverColor, setCoverColor] = useState('#4A3222');
  const [coverMaterial, setCoverMaterial] = useState<'leather' | 'linen' | 'kraft' | 'matte' | 'crystal'>('leather');
  const [elasticColor, setElasticColor] = useState('#242420');
  const [coverPhoto, setCoverPhoto] = useState('');

  // Page adding states
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageContent, setNewPageContent] = useState('');
  const [newPageLyrics, setNewPageLyrics] = useState('');
  const [newPagePhoto, setNewPagePhoto] = useState('');

  // Load journal data when modal opens
  useEffect(() => {
    if (journal && isEditJournalModalOpen) {
      setTitle(journal.title || '');
      setSubtitle(journal.subtitle || '');
      setCoverColor(journal.cover_color || '#4A3222');
      setCoverMaterial(journal.cover_material || 'leather');
      setElasticColor(journal.elastic_color || '#242420');
      setCoverPhoto(journal.cover_photo || '');
      setIsAddingPage(false);
    }
  }, [journal, isEditJournalModalOpen]);

  if (!isEditJournalModalOpen || !journal) return null;

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

  const handleNewPagePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPagePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() && !newPagePhoto && !newPageContent.trim()) return;

    addJournalPage(journal.id, {
      title: newPageTitle.trim() || `Spread ${(journal.pages?.length || 0) + 1}`,
      date: `Spread ${String((journal.pages?.length || 0) + 1).padStart(2, '0')}`,
      content: newPageContent.trim() || 'Handcrafted reflections and notes',
      lyrics: newPageLyrics.trim() || undefined,
      photo_url: newPagePhoto || undefined,
    });

    setNewPageTitle('');
    setNewPageContent('');
    setNewPageLyrics('');
    setNewPagePhoto('');
    setIsAddingPage(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateJournal(journal.id, {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      cover_color: coverColor,
      cover_material: coverMaterial,
      elastic_color: elasticColor,
      cover_photo: coverPhoto || undefined,
    });

    setEditJournalModalOpen(false);
  };

  const handleDeleteJournal = () => {
    if (journals.length <= 1) {
      alert('Cannot delete the only journal in your collection.');
      return;
    }
    if (confirm(`Are you sure you want to delete "${journal.title}"?`)) {
      deleteJournal(journal.id);
      setEditJournalModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl crystal-modal rounded-3xl overflow-hidden flex flex-col max-h-[92vh] border border-white/60 shadow-2xl">
        {/* Modal Header */}
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
                Edit Journal
              </h2>
              <p className="text-xs text-[#7e6d5d]">
                Customize covers, archival materials, and spreads
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditJournalModalOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSave} id="edit-journal-form" className="space-y-4">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a2f26]">Journal Title *</label>
                <div className="neuro-well rounded-xl px-3 py-2">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Journal title..."
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
                    placeholder="Archival notes & lyrics..."
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

            {/* Colors: Cover & Elastic Band */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cover Color */}
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

              {/* Elastic Band Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#3a2f26]">Elastic Band Strap Color</label>
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

            {/* Cover Tipped-in Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3a2f26]">Cover Tipped-in Photo (Optional)</label>
              <div className="flex items-center gap-3">
                {coverPhoto && (
                  <div className="relative group">
                    <img
                      src={coverPhoto}
                      alt="Cover"
                      className="w-14 h-14 object-cover rounded-xl border border-black/10 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverPhoto('')}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow"
                      title="Remove Cover Photo"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <label className="neuro-btn px-3 py-1.5 rounded-xl text-xs font-medium text-[#4a3b2f] cursor-pointer flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#7e6d5d]" />
                  <span>{coverPhoto ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </form>

          {/* Archival Spreads / Pages Section */}
          <div className="pt-4 border-t border-[#3a2f26]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#3a2f26] uppercase tracking-wider">
                  Journal Spreads ({journal.pages?.length || 0})
                </h3>
                <p className="text-[11px] text-[#7e6d5d]">
                  Pages flip seamlessly with 3D physical book animation
                </p>
              </div>

              {!isAddingPage && (
                <button
                  type="button"
                  onClick={() => setIsAddingPage(true)}
                  className="neuro-btn px-3 py-1.5 rounded-full text-xs font-medium text-[#3a2f26] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Page Spread</span>
                </button>
              )}
            </div>

            {/* Add New Page Form */}
            {isAddingPage && (
              <form onSubmit={handleAddPageSubmit} className="crystal-card p-4 rounded-2xl space-y-3 border border-white/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-semibold text-[#3a2f26] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#d8a25e]" />
                    New Page Spread #{((journal.pages?.length || 0) + 1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPage(false)}
                    className="text-xs text-[#7e6d5d] hover:text-[#3a2f26]"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="Page Title or Subject..."
                    className="neuro-well px-3 py-2 rounded-xl text-xs bg-white/70 text-[#242420] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newPageLyrics}
                    onChange={(e) => setNewPageLyrics(e.target.value)}
                    placeholder="Poetic quote / Lyrics / Date..."
                    className="neuro-well px-3 py-2 rounded-xl text-xs bg-white/70 text-[#242420] focus:outline-none"
                  />
                </div>

                <textarea
                  rows={2}
                  value={newPageContent}
                  onChange={(e) => setNewPageContent(e.target.value)}
                  placeholder="Notes, liner reflections, or memory entries..."
                  className="neuro-well w-full px-3 py-2 rounded-xl text-xs bg-white/70 text-[#242420] focus:outline-none resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="neuro-btn px-3 py-1.5 rounded-xl text-xs font-medium text-[#4a3b2f] cursor-pointer flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#7e6d5d]" />
                    <span>{newPagePhoto ? 'Spread Photo Ready' : 'Upload Spread Photo (Optional)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleNewPagePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
                  >
                    Insert Spread
                  </button>
                </div>
              </form>
            )}

            {/* List of Existing Pages */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {journal.pages && journal.pages.length > 0 ? (
                journal.pages.map((p: JournalPage, idx: number) => (
                  <div
                    key={p.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-white/80 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 rounded-md overflow-hidden bg-[#e0d6c5] border border-black/10 flex-shrink-0 flex items-center justify-center">
                        {p.photo_url ? (
                          <img
                            src={p.photo_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-[#7e6d5d]">
                            #{idx + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#242420] truncate max-w-xs">
                          {p.title || `Spread ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-[#897968] truncate max-w-xs">
                          {p.content || p.lyrics || 'Handwritten scrapbook entry'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#7e6d5d] px-2 py-0.5 rounded-md bg-black/5">
                        #{idx + 1}
                      </span>
                      {journal.pages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteJournalPage(journal.id, p.id)}
                          className="p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete this page spread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl text-center text-xs text-[#7e6d5d] bg-black/5">
                  No pages added yet. Click &quot;Add Page Spread&quot; above to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#3a2f26]/10 flex items-center justify-between bg-white/50">
          <div>
            {journals.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteJournal}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 transition-colors"
                title="Delete this journal"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Journal</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditJournalModalOpen(false)}
              className="neuro-btn px-4 py-2 rounded-full text-xs font-medium text-[#6e5d4e]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-journal-form"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#3a2f26] text-[#FAF7F2] hover:bg-[#251e18] shadow-xs active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJournalModal;
