import { create } from 'zustand';
import type { Tape, Collection, AppMode, ActiveSection, Journal, JournalPage, GalleryTheme, GlassStyle, ShelfMaterial } from '../types';
import { audioEngine } from '../services/audioEngine';

const INITIAL_COLLECTION: Collection = {
  id: 'col-001',
  owner_id: 'user-001',
  title: 'bhoi ka song tapes',
  description: 'Selected acoustic recordings, midnight voice notes, and studio outtakes.',
  share_token: 'tape-studio-master-2026',
  is_public: true,
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  updated_at: new Date().toISOString(),
};

const INITIAL_TAPES: Tape[] = [
  {
    id: 'tape-jol-shopno',
    collection_id: 'col-001',
    title: 'Jol Shopno',
    artist: 'Palbasha Siddique',
    subtitle: 'Valobashi Tai · Acoustic Master',
    description: 'Beloved acoustic Bengali classic by Palbasha Siddique. Music & tune by Arafat Mohsin, lyrics by Rajib Ashraf. Recorded with warm analog tape resonance.',
    audio_path: '/audio/jol-shopno.mp3',
    artwork_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    duration: 209,
    label_color: '#D6C7B2',
    shell_color: '#F0B96A', // Vintage Warm Amber Tint
    shell_type: 'transparent',
    label_style: 'photo-full',
    position_x: -2.8,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    sort_order: 0,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tape-bol-na-halke-halke',
    collection_id: 'col-001',
    title: 'Bol Na Halke Halke',
    artist: 'Rahat Fateh Ali Khan & Mahalakshmi Iyer',
    subtitle: 'Jhoom Barabar Jhoom · Shankar-Ehsaan-Loy',
    description: 'Soulful romantic melody featuring poignant acoustic strings and vocals composed by Shankar-Ehsaan-Loy with timeless poetry by Gulzar.',
    audio_path: '/audio/bol-na-halke-halke.mp3',
    artwork_path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    duration: 62,
    label_color: '#C98A75',
    shell_color: '#2C2B29', // Smoked Obsidian Tint
    shell_type: 'transparent',
    label_style: 'polaroid',
    position_x: -1.4,
    position_y: 1.8,
    position_z: -1,
    rotation_x: 0.1,
    rotation_y: -0.2,
    rotation_z: 0,
    scale: 1,
    sort_order: 1,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tape-jokhon',
    collection_id: 'col-001',
    title: 'Jokhon',
    artist: 'Warfaze',
    subtitle: 'Obak Bhalobasha · Vintage Tape',
    description: 'Timeless rock ballad from the golden era of Bangladeshi band music. Emotive acoustic guitar routed through rich analog tape saturation.',
    audio_path: '/audio/jokhon.mp3',
    artwork_path: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    duration: 114,
    label_color: '#8C96A5',
    shell_color: '#3E6898', // Cobalt Electric Blue
    shell_type: 'transparent',
    label_style: 'photo-full',
    position_x: 0,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    sort_order: 2,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tape-ami-shunechi',
    collection_id: 'col-001',
    title: 'আমি শুনেছি সেদিন তুমি',
    artist: 'মৌসুমী ভৌমিক',
    subtitle: 'আমার কিছু কথা ছিল · Moushumi Bhowmik',
    description: '“আমি শুনেছি সেদিন তুমি সাগরের ঢেউয়ে চেপে নীল জল সীমানা ছুঁয়ে এসেছো...” Poetic Bengali ballad of memory and freedom.',
    audio_path: '/audio/ami-shunechi-sedin-tumi.mp3',
    artwork_path: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    duration: 187,
    label_color: '#7B8469',
    shell_color: '#FFFFFF', // Crystal Clear Acrylic
    shell_type: 'transparent',
    label_style: 'polaroid',
    position_x: 1.4,
    position_y: -1.8,
    position_z: -0.5,
    rotation_x: -0.1,
    rotation_y: 0.2,
    rotation_z: 0.05,
    scale: 1,
    sort_order: 3,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tape-bhalobashi-jare',
    collection_id: 'col-001',
    title: 'ভালবাসি যারে',
    artist: 'Tonmoy Tansen & Kaniz Suborna',
    subtitle: 'Vikings · Studio Master',
    description: 'Unforgettable Bangladeshi rock ballad by Vikings. Layered acoustic guitar and emotive dual vocals captured on Chrome Type II cassette.',
    audio_path: '/audio/bhalobashi-jare.mp3',
    artwork_path: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    duration: 155,
    label_color: '#D8B4A8',
    shell_color: '#E8E1D3', // Solid Matte Biscuit Ceramic
    shell_type: 'solid',
    label_style: 'standard',
    position_x: 2.8,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    scale: 1,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_JOURNALS: Journal[] = [
  {
    id: 'journal-bhoi-ka',
    title: 'bhoi ka journal',
    subtitle: '7 Original Hand-crafted Spreads · 2026',
    cover_color: '#4A3222', // Saddle Moleskine Leather
    cover_material: 'leather',
    cover_photo: '/journal/page-1.jpg',
    elastic_color: '#242420',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    pages: [
      {
        id: 'p-1',
        page_number: 1,
        title: 'bhoi ka journal · Page 1',
        date: 'Spread 01',
        content: 'Why send correspondence · Stay true',
        lyrics: '“Dream without fear, Love without limits...”',
        photo_url: '/journal/page-1.jpg',
      },
      {
        id: 'p-2',
        page_number: 2,
        title: 'bhoi ka journal · Page 2',
        date: 'Spread 02',
        content: 'Learn from yesterday, live for today · 22',
        lyrics: '“Say yes to new adventures · Good things come in small packages · Celebrate life”',
        photo_url: '/journal/page-2.jpg',
      },
      {
        id: 'p-3',
        page_number: 3,
        title: 'bhoi ka journal · Page 3',
        date: 'Spread 03',
        content: 'Love yourself · Look up you’ll see the stars',
        lyrics: '“All things grow · Fearless · How to know the butterflies”',
        photo_url: '/journal/page-3.jpg',
      },
      {
        id: 'p-4',
        page_number: 4,
        title: 'bhoi ka journal · Page 4',
        date: 'Spread 04',
        content: 'Artful collages & botanical clippings',
        lyrics: '“Fragments of memories preserved in paper and time.”',
        photo_url: '/journal/page-4.jpg',
      },
      {
        id: 'p-5',
        page_number: 5,
        title: 'bhoi ka journal · Page 5',
        date: 'Spread 05',
        content: 'Vintage stamps, postcards & coffee reflections',
        lyrics: '“Every dried flower holds a whisper of sunlight.”',
        photo_url: '/journal/page-5.jpg',
      },
      {
        id: 'p-6',
        page_number: 6,
        title: 'bhoi ka journal · Page 6',
        date: 'Spread 06',
        content: 'Late night scribbles & paper lace keepsakes',
        lyrics: '“Quiet thoughts gathered under warm amber lamp light.”',
        photo_url: '/journal/page-6.jpg',
      },
      {
        id: 'p-7',
        page_number: 7,
        title: 'bhoi ka journal · Page 7',
        date: 'Spread 07',
        content: 'Epilogue · Dreams, horizons & journeys',
        lyrics: '“The story continues on the next horizon.”',
        photo_url: '/journal/page-7.jpg',
      },
    ],
  },
];

interface TapeStore {
  // Navigation & Sections
  activeSection: ActiveSection;
  setActiveSection: (sec: ActiveSection) => void;

  // Cassettes
  tapes: Tape[];
  collection: Collection;
  activeTapeIndex: number;
  selectedTapeId: string | null;
  hoveredTapeId: string | null;
  mode: AppMode;
  
  // Playback
  isPlaying: boolean;
  playingTapeId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Journals (Paper App style)
  journals: Journal[];
  activeJournalIndex: number;
  selectedJournalId: string | null;
  activeJournalPage: number;
  isCreateJournalModalOpen: boolean;
  isEditJournalModalOpen: boolean;
  editingJournalId: string | null;
  setActiveJournalIndex: (index: number) => void;
  setSelectedJournalId: (id: string | null) => void;
  setActiveJournalPage: (page: number) => void;
  setCreateJournalModalOpen: (open: boolean) => void;
  setEditJournalModalOpen: (open: boolean, journalId?: string | null) => void;
  addJournal: (journal: Omit<Journal, 'id' | 'created_at' | 'updated_at'>) => void;
  updateJournal: (id: string, updates: Partial<Journal>) => void;
  deleteJournal: (id: string) => void;
  addJournalPage: (journalId: string, page: Omit<JournalPage, 'id' | 'page_number'>) => void;
  updateJournalPage: (journalId: string, pageId: string, updates: Partial<JournalPage>) => void;
  deleteJournalPage: (journalId: string, pageId: string) => void;

  // Customization & Aesthetics
  galleryTheme: GalleryTheme;
  setGalleryTheme: (theme: GalleryTheme) => void;
  glassStyle: GlassStyle;
  setGlassStyle: (style: GlassStyle) => void;
  shelfMaterial: ShelfMaterial;
  setShelfMaterial: (material: ShelfMaterial) => void;
  isCustomizerOpen: boolean;
  setCustomizerOpen: (open: boolean) => void;

  // UI Modals
  isCreateModalOpen: boolean;
  isShareModalOpen: boolean;
  isSettingsModalOpen: boolean;
  searchQuery: string;
  isVisitorMode: boolean;

  // Actions
  setMode: (mode: AppMode) => void;
  setActiveTapeIndex: (index: number) => void;
  setSelectedTapeId: (id: string | null) => void;
  setHoveredTapeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // Audio actions
  togglePlay: () => void;
  playTape: (tapeId: string) => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;

  // Tape CRUD & Spatial update
  addTape: (tape: Omit<Tape, 'id' | 'collection_id' | 'created_at' | 'updated_at'>) => void;
  updateTape: (id: string, updates: Partial<Tape>) => void;
  deleteTape: (id: string) => void;
  updateTapeTransform: (id: string, pos: [number, number, number], rot?: [number, number, number], scale?: number) => void;
  
  // Modals
  setCreateModalOpen: (open: boolean) => void;
  setShareModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setVisitorMode: (visitor: boolean) => void;
  updateCollection: (updates: Partial<Collection>) => void;
}

const STORAGE_KEY_TAPES = 'tape_collection_tapes_v4';
const STORAGE_KEY_COL = 'tape_collection_metadata_v4';
const STORAGE_KEY_JOURNALS = 'tape_collection_journals_v11';
const STORAGE_KEY_THEME = 'tape_collection_gallery_theme_v1';
const STORAGE_KEY_GLASS = 'tape_collection_glass_style_v1';
const STORAGE_KEY_SHELF = 'tape_collection_shelf_material_v1';

export const useTapeStore = create<TapeStore>((set, get) => {
  const savedTapes = localStorage.getItem(STORAGE_KEY_TAPES);
  const savedCol = localStorage.getItem(STORAGE_KEY_COL);
  const savedJournals = localStorage.getItem(STORAGE_KEY_JOURNALS);
  const savedTheme = (localStorage.getItem(STORAGE_KEY_THEME) as GalleryTheme) || 'ethereal';
  const savedGlass = (localStorage.getItem(STORAGE_KEY_GLASS) as GlassStyle) || 'crystal';
  const savedShelf = (localStorage.getItem(STORAGE_KEY_SHELF) as ShelfMaterial) || 'light-wood';

  // Apply initial data attributes to root element
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-glass', savedGlass);
  }

  let initialTapes: Tape[] = INITIAL_TAPES;
  if (savedTapes) {
    try {
      const parsed = JSON.parse(savedTapes);
      const hasRealAudio = Array.isArray(parsed) && parsed.some((t: Tape) => t.audio_path && !t.audio_path.startsWith('synth://'));
      if (hasRealAudio && parsed.length > 0) {
        initialTapes = parsed;
      }
    } catch {}
  }

  const initialCol = savedCol ? JSON.parse(savedCol) : INITIAL_COLLECTION;

  let initialJournals: Journal[] = [INITIAL_JOURNALS[0]];
  if (savedJournals) {
    try {
      const parsed = JSON.parse(savedJournals);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialJournals = [parsed[0]];
      }
    } catch {}
  }

  // Setup audio callbacks
  audioEngine.setCallbacks({
    onTimeUpdate: (currentTime, duration) => {
      set({ currentTime, duration: duration || get().duration });
    },
    onPlay: () => set({ isPlaying: true }),
    onPause: () => set({ isPlaying: false }),
    onEnd: () => {
      get().playNext();
    },
  });

  const persistTapes = (tapes: Tape[]) => {
    localStorage.setItem(STORAGE_KEY_TAPES, JSON.stringify(tapes));
  };

  const persistCol = (col: Collection) => {
    localStorage.setItem(STORAGE_KEY_COL, JSON.stringify(col));
  };

  const persistJournals = (journals: Journal[]) => {
    localStorage.setItem(STORAGE_KEY_JOURNALS, JSON.stringify(journals));
  };

  return {
    activeSection: 'cassettes',
    setActiveSection: (sec) => set({ activeSection: sec }),

    tapes: initialTapes,
    collection: initialCol,
    activeTapeIndex: 0,
    selectedTapeId: null,
    hoveredTapeId: null,
    mode: 'carousel',

    isPlaying: false,
    playingTapeId: initialTapes[0]?.id || null,
    currentTime: 0,
    duration: initialTapes[0]?.duration || 180,
    volume: 0.8,
    isMuted: false,

    // Journals
    journals: initialJournals,
    activeJournalIndex: 0,
    selectedJournalId: null,
    activeJournalPage: 0,
    isCreateJournalModalOpen: false,
    isEditJournalModalOpen: false,
    editingJournalId: null,

    // Customization & Aesthetics
    galleryTheme: savedTheme,
    glassStyle: savedGlass,
    shelfMaterial: savedShelf,
    isCustomizerOpen: false,

    setGalleryTheme: (theme: GalleryTheme) => {
      set({ galleryTheme: theme });
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    },

    setGlassStyle: (style: GlassStyle) => {
      set({ glassStyle: style });
      localStorage.setItem(STORAGE_KEY_GLASS, style);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-glass', style);
      }
    },

    setShelfMaterial: (material: ShelfMaterial) => {
      set({ shelfMaterial: material });
      localStorage.setItem(STORAGE_KEY_SHELF, material);
    },

    setCustomizerOpen: (open: boolean) => set({ isCustomizerOpen: open }),

    setActiveJournalIndex: (index) => {
      const journals = get().journals;
      const valid = Math.max(0, Math.min(index, journals.length - 1));
      set({ activeJournalIndex: valid, activeJournalPage: 0 });
    },

    setSelectedJournalId: (id) => {
      set({ selectedJournalId: id, activeJournalPage: 0 });
      if (id) {
        const index = get().journals.findIndex((j) => j.id === id);
        if (index !== -1) set({ activeJournalIndex: index });
      }
    },

    setActiveJournalPage: (page) => {
      audioEngine.playPageFlipSound();
      set({ activeJournalPage: page });
    },
    setCreateJournalModalOpen: (open) => set({ isCreateJournalModalOpen: open }),
    setEditJournalModalOpen: (open, journalId = null) => {
      set({ isEditJournalModalOpen: open, editingJournalId: journalId });
    },

    addJournal: (data) => {
      const { journals } = get();
      const newJournal: Journal = {
        ...data,
        id: 'journal-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newJournal, ...journals];
      set({ journals: updated, activeJournalIndex: 0, selectedJournalId: null });
      persistJournals(updated);
    },

    updateJournal: (id, updates) => {
      const { journals } = get();
      const updated = journals.map((j) => (j.id === id ? { ...j, ...updates, updated_at: new Date().toISOString() } : j));
      set({ journals: updated });
      persistJournals(updated);
    },

    deleteJournal: (id) => {
      const { journals, selectedJournalId } = get();
      if (journals.length <= 1) return; // Always preserve at least 1 journal
      const updated = journals.filter((j) => j.id !== id);
      set({
        journals: updated,
        selectedJournalId: selectedJournalId === id ? null : selectedJournalId,
        activeJournalIndex: 0,
      });
      persistJournals(updated);
    },

    addJournalPage: (journalId, pageData) => {
      const { journals } = get();
      const updated = journals.map((j) => {
        if (j.id !== journalId) return j;
        const newPage: JournalPage = {
          ...pageData,
          id: 'page-' + Date.now(),
          page_number: j.pages.length + 1,
        };
        return {
          ...j,
          pages: [...j.pages, newPage],
          updated_at: new Date().toISOString(),
        };
      });
      set({ journals: updated });
      persistJournals(updated);
    },

    updateJournalPage: (journalId, pageId, updates) => {
      const { journals } = get();
      const updated = journals.map((j) => {
        if (j.id !== journalId) return j;
        return {
          ...j,
          pages: j.pages.map((p) => (p.id === pageId ? { ...p, ...updates } : p)),
          updated_at: new Date().toISOString(),
        };
      });
      set({ journals: updated });
      persistJournals(updated);
    },

    deleteJournalPage: (journalId, pageId) => {
      const { journals } = get();
      const updated = journals.map((j) => {
        if (j.id !== journalId) return j;
        const remaining = j.pages.filter((p) => p.id !== pageId).map((p, idx) => ({ ...p, page_number: idx + 1 }));
        return {
          ...j,
          pages: remaining,
          updated_at: new Date().toISOString(),
        };
      });
      set({ journals: updated, activeJournalPage: 0 });
      persistJournals(updated);
    },

    isCreateModalOpen: false,
    isShareModalOpen: false,
    isSettingsModalOpen: false,
    searchQuery: '',
    isVisitorMode: false,

    setMode: (mode) => set({ mode }),
    
    setActiveTapeIndex: (index) => {
      const tapes = get().tapes;
      const validIndex = Math.max(0, Math.min(index, tapes.length - 1));
      set({ activeTapeIndex: validIndex });
    },

    setSelectedTapeId: (id) => {
      set({ selectedTapeId: id });
      if (id) {
        const tapes = get().tapes;
        const index = tapes.findIndex((t) => t.id === id);
        if (index !== -1) {
          set({ activeTapeIndex: index });
        }
      }
    },

    setHoveredTapeId: (id) => set({ hoveredTapeId: id }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    togglePlay: () => {
      const { isPlaying, selectedTapeId, activeTapeIndex, tapes, playingTapeId } = get();
      if (isPlaying) {
        audioEngine.pause();
        set({ isPlaying: false });
      } else {
        const currentTape = selectedTapeId 
          ? tapes.find((t) => t.id === selectedTapeId) 
          : playingTapeId
          ? tapes.find((t) => t.id === playingTapeId)
          : tapes[activeTapeIndex];
        
        if (currentTape) {
          audioEngine.play(currentTape.audio_path, currentTape.duration);
          set({ isPlaying: true, playingTapeId: currentTape.id, selectedTapeId: currentTape.id });
        }
      }
    },

    playTape: (tapeId) => {
      const { tapes } = get();
      const tape = tapes.find((t) => t.id === tapeId);
      if (!tape) return;

      const index = tapes.findIndex((t) => t.id === tapeId);
      set({ 
        playingTapeId: tapeId,
        selectedTapeId: tapeId, 
        activeTapeIndex: index !== -1 ? index : get().activeTapeIndex,
        isPlaying: true, 
        duration: tape.duration 
      });
      audioEngine.play(tape.audio_path, tape.duration);
    },

    pause: () => {
      audioEngine.pause();
      set({ isPlaying: false });
    },

    seek: (seconds) => {
      audioEngine.seek(seconds);
      set({ currentTime: seconds });
    },

    setVolume: (vol) => {
      audioEngine.setVolume(vol);
      set({ volume: vol, isMuted: vol === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      if (isMuted) {
        audioEngine.setVolume(volume || 0.8);
        set({ isMuted: false });
      } else {
        audioEngine.setVolume(0);
        set({ isMuted: true });
      }
    },

    playNext: () => {
      const { tapes, activeTapeIndex } = get();
      if (tapes.length === 0) return;
      const nextIndex = (activeTapeIndex + 1) % tapes.length;
      const nextTape = tapes[nextIndex];
      set({ activeTapeIndex: nextIndex, selectedTapeId: nextTape.id, playingTapeId: nextTape.id, isPlaying: true, duration: nextTape.duration });
      audioEngine.play(nextTape.audio_path, nextTape.duration);
    },

    playPrevious: () => {
      const { tapes, activeTapeIndex, currentTime } = get();
      if (currentTime > 3) {
        audioEngine.seek(0);
        return;
      }
      if (tapes.length === 0) return;
      const prevIndex = (activeTapeIndex - 1 + tapes.length) % tapes.length;
      const prevTape = tapes[prevIndex];
      set({ activeTapeIndex: prevIndex, selectedTapeId: prevTape.id, playingTapeId: prevTape.id, isPlaying: true, duration: prevTape.duration });
      audioEngine.play(prevTape.audio_path, prevTape.duration);
    },

    addTape: (newTapeData) => {
      const { tapes, collection } = get();
      const newTape: Tape = {
        ...newTapeData,
        id: 'tape-' + Date.now(),
        collection_id: collection.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newTape, ...tapes];
      set({ tapes: updated, activeTapeIndex: 0, selectedTapeId: newTape.id });
      persistTapes(updated);
    },

    updateTape: (id, updates) => {
      const { tapes } = get();
      const updated = tapes.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
      set({ tapes: updated });
      persistTapes(updated);
    },

    deleteTape: (id) => {
      const { tapes, selectedTapeId } = get();
      const updated = tapes.filter((t) => t.id !== id);
      set({
        tapes: updated,
        selectedTapeId: selectedTapeId === id ? null : selectedTapeId,
        activeTapeIndex: 0,
      });
      persistTapes(updated);
    },

    updateTapeTransform: (id, pos, rot, scale) => {
      const { tapes } = get();
      const updated = tapes.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          position_x: pos[0],
          position_y: pos[1],
          position_z: pos[2],
          rotation_x: rot ? rot[0] : t.rotation_x,
          rotation_y: rot ? rot[1] : t.rotation_y,
          rotation_z: rot ? rot[2] : t.rotation_z,
          scale: scale !== undefined ? scale : t.scale,
          updated_at: new Date().toISOString(),
        };
      });
      set({ tapes: updated });
      persistTapes(updated);
    },

    setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    setShareModalOpen: (open) => set({ isShareModalOpen: open }),
    setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
    setVisitorMode: (visitor) => set({ isVisitorMode: visitor }),
    
    updateCollection: (updates) => {
      const { collection } = get();
      const updated = { ...collection, ...updates, updated_at: new Date().toISOString() };
      set({ collection: updated });
      persistCol(updated);
    },
  };
});
