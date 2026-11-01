export interface Tape {
  id: string;
  collection_id: string;
  title: string;
  artist: string;
  description?: string;
  subtitle?: string;
  audio_path: string;
  artwork_path?: string;
  duration: number;
  label_color: string;
  shell_color: string; // Cassette plastic body color/tint
  shell_type: 'transparent' | 'frosted' | 'solid';
  label_style: 'standard' | 'photo-full' | 'polaroid' | 'minimal';
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  share_token: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export type AppMode = 'carousel' | 'spatial';
export type ActiveSection = 'cassettes' | 'journals';

export type GalleryTheme = 'ethereal' | 'sunset' | 'obsidian' | 'rose' | 'crystal';
export type GlassStyle = 'crystal' | 'frosted' | 'smoked';
export type ShelfMaterial = 'light-wood' | 'dark-wood' | 'crystal-glass' | 'concrete';

export interface JournalPage {
  id: string;
  page_number: number;
  title: string;
  date: string;
  content: string;
  lyrics?: string;
  photo_url?: string;
  tape_id?: string;
  sketch_data?: string;
  paper_style?: 'blank' | 'lined' | 'dots' | 'grid' | 'kraft';
}

export interface Journal {
  id: string;
  title: string;
  subtitle?: string;
  cover_color: string;
  cover_material: 'leather' | 'linen' | 'kraft' | 'matte' | 'crystal';
  cover_photo?: string;
  elastic_color: string;
  pages: JournalPage[];
  created_at: string;
  updated_at: string;
}

export interface PlayerState {
  currentTapeId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
}
