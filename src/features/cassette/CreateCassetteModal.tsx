import React, { useState, useRef } from 'react';
import { useTapeStore } from '../../stores/useTapeStore';
import { X, Upload, Music, Image as ImageIcon, Play, Pause, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

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

const PRESET_PHOTOS = [
  { name: 'Tokyo Neon Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
  { name: 'Acoustic Guitar', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Studio Synth', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
  { name: 'Parisian Rain', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
];

export const CreateCassetteModal: React.FC = () => {
  const { isCreateModalOpen, setCreateModalOpen, addTape } = useTapeStore();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Customization: Shell & Label
  const [labelColor, setLabelColor] = useState(PRESET_LABEL_COLORS[0].hex);
  const [shellColor, setShellColor] = useState(PRESET_SHELL_COLORS[1].hex);
  const [shellType, setShellType] = useState<'transparent' | 'frosted' | 'solid'>('transparent');
  const [labelStyle, setLabelStyle] = useState<'standard' | 'photo-full' | 'polaroid' | 'minimal'>('photo-full');

  // Audio upload & preview
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(180);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Artwork upload
  const [artworkUrl, setArtworkUrl] = useState<string>(PRESET_PHOTOS[0].url);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isCreateModalOpen) return null;

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      setError('Please upload an audio file (MP3, WAV, M4A)');
      return;
    }

    setError(null);
    setAudioFile(file);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    const tempAudio = new Audio(objectUrl);
    tempAudio.addEventListener('loadedmetadata', () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setAudioDuration(Math.round(tempAudio.duration));
      }
    });
  };

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

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(audioUrl);
      previewAudioRef.current.addEventListener('ended', () => setIsPreviewPlaying(false));
    }

    if (isPreviewPlaying) {
      previewAudioRef.current.pause();
      setIsPreviewPlaying(false);
    } else {
      previewAudioRef.current.play();
      setIsPreviewPlaying(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Recording title is required.');
      return;
    }
    if (!artist.trim()) {
      setError('Artist or creator name is required.');
      return;
    }

    setIsSubmitting(true);
    const finalAudioPath = audioUrl || 'synth://lofi-demo-' + Date.now();

    addTape({
      title: title.trim(),
      artist: artist.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      label_color: labelColor,
      shell_color: shellColor,
      shell_type: shellType,
      label_style: labelStyle,
      audio_path: finalAudioPath,
      artwork_path: artworkUrl || undefined,
      duration: audioDuration || 180,
      position_x: 0,
      position_y: 0,
      position_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,
      scale: 1,
      sort_order: 0,
    });

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: [shellColor, labelColor, '#242420', '#C6BBA8'],
      });
    } catch {}

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }

    setCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/45 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl crystal-modal rounded-3xl overflow-hidden flex flex-col max-h-[92vh] border border-white/60 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3a2f26]/10 flex items-center justify-between bg-white/40">
          <div>
            <h2 className="text-base font-semibold text-[#2b221a] tracking-tight">
              Create Custom 3D Cassette
            </h2>
            <p className="text-xs text-[#7e6d5d]">
              Upload audio, choose cassette body color, and add custom picture
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(false)}
            className="p-1.5 rounded-full text-[#7e6d5d] hover:text-[#2b221a] hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* 1. Audio Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#242420] flex items-center justify-between">
              <span>Audio Recording (MP3, WAV, M4A)</span>
              <span className="text-[11px] text-[#898780] font-normal">
                {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(1)} MB` : 'Optional (lo-fi synth included)'}
              </span>
            </label>

            <div className="border-2 border-dashed border-[#E6E4DD] hover:border-[#C6BBA8] rounded-2xl p-4 transition-all text-center bg-white/50 relative">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={handleAudioUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {audioFile ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5 text-left truncate">
                    <Music className="w-5 h-5 text-[#242420] flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-medium text-[#242420] truncate">
                        {audioFile.name}
                      </p>
                      <p className="text-[11px] text-[#898780] font-mono">
                        Duration: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview();
                    }}
                    className="z-10 p-2 rounded-full bg-[#242420] text-white hover:bg-[#383832] transition-colors"
                  >
                    {isPreviewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <Upload className="w-5 h-5 text-[#898780]" />
                  <p className="text-xs font-medium text-[#242420]">
                    Drop song recording here, or click to browse
                  </p>
                  <p className="text-[11px] text-[#ADA9A0]">
                    MP3, WAV, M4A audio formats
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Cassette Shell Body Color & Label Accent */}
          <div className="space-y-3 p-3.5 bg-white rounded-2xl border border-[#E6E4DD]">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#242420]">
                  Cassette Body Color & Shell Tint
                </label>
                <span className="text-[11px] font-mono text-[#898780] capitalize">
                  {shellType} shell
                </span>
              </div>

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
                      shellColor === col.hex
                        ? 'ring-2 ring-offset-2 ring-[#242420] scale-110'
                        : 'hover:scale-105'
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
                  className="w-7 h-7 rounded-full border border-[#E6E4DD] cursor-pointer"
                  title="Custom Shell Color"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6E4DD]/60">
              <label className="text-xs font-semibold text-[#242420]">
                Label Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1.5">
                {PRESET_LABEL_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setLabelColor(col.hex)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      labelColor === col.hex
                        ? 'ring-2 ring-offset-2 ring-[#242420] scale-110'
                        : 'hover:scale-105'
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

          {/* 3. Picture on Cassette & Label Style */}
          <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-[#E6E4DD]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#242420]">
                Picture on Cassette
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLabelStyle('photo-full')}
                  className={`px-2 py-0.5 rounded-full font-medium transition-all ${
                    labelStyle === 'photo-full' ? 'bg-[#242420] text-white' : 'text-[#898780]'
                  }`}
                >
                  Full Print
                </button>
                <button
                  type="button"
                  onClick={() => setLabelStyle('polaroid')}
                  className={`px-2 py-0.5 rounded-full font-medium transition-all ${
                    labelStyle === 'polaroid' ? 'bg-[#242420] text-white' : 'text-[#898780]'
                  }`}
                >
                  Polaroid
                </button>
                <button
                  type="button"
                  onClick={() => setLabelStyle('standard')}
                  className={`px-2 py-0.5 rounded-full font-medium transition-all ${
                    labelStyle === 'standard' ? 'bg-[#242420] text-white' : 'text-[#898780]'
                  }`}
                >
                  Standard
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {artworkUrl ? (
                <img
                  src={artworkUrl}
                  alt="Artwork preview"
                  className="w-14 h-14 rounded-xl object-cover border border-[#E6E4DD] shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#E6E4DD] flex items-center justify-center text-[#ADA9A0] flex-shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1.5 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleArtworkUpload}
                  className="text-xs text-[#898780] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[#EFEEE9] file:text-[#242420]"
                />
                {/* Instant preset photos */}
                <div className="flex items-center gap-1.5 text-[10px] text-[#898780]">
                  <span>Or try:</span>
                  {PRESET_PHOTOS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setArtworkUrl(p.url)}
                      className="underline hover:text-[#242420]"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Title & Artist */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#242420]">Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Reverie"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E6E4DD] text-[#242420] focus:outline-none focus:border-[#C6BBA8]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#242420]">Artist / Author *</label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Your Name"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E6E4DD] text-[#242420] focus:outline-none focus:border-[#C6BBA8]"
              />
            </div>
          </div>

          {/* Subtitle & Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#242420]">Session Notes / Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Tape 02 • Otari 2-Track Master"
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E6E4DD] text-[#242420] focus:outline-none focus:border-[#C6BBA8]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#242420]">Liner Notes & Story</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Acoustic reflections, instruments used, or memory behind the track..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-[#E6E4DD] text-[#242420] focus:outline-none focus:border-[#C6BBA8] resize-none"
            />
          </div>

          {/* Submit footer */}
          <div className="pt-3 border-t border-[#E6E4DD] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#76746E] hover:bg-[#EFEEE9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#242420] text-white hover:bg-[#383832] active:scale-95 disabled:opacity-50"
            >
              Create Cassette
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
