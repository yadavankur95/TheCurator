export type MediaType = 'image' | 'video';

export type Orientation = 'portrait' | 'landscape' | 'square';

export type Layout = 
  | 'opening' 
  | 'full' 
  | 'pair' 
  | 'trio' 
  | 'collage' 
  | 'mosaic' 
  | 'quote' 
  | 'portrait' 
  | 'video-focus' 
  | 'ending';

export type View = 'create' | 'processing' | 'website' | 'player' | 'studio';

export type ThemeStyle = 'Birthday' | 'Cinematic' | 'Rose Gold' | 'Golden Hour' | 'Midnight Velvet' | 'Blossom';

export type EventType =
  | 'mother-daughter-birthday'
  | 'milestone-birthday'
  | 'family-celebration'
  | 'daughter-birthday'
  | 'anniversary-love'
  | 'best-friends'
  | 'baby-first-year';

export interface EventPreset {
  id: EventType;
  title: string;
  shortName: string;
  badge: string;
  defaultTitle: string;
  defaultSubtitle: string;
  accentColor: string;
  description: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  name: string;
  width: number;
  height: number;
  orientation: Orientation;
  date: string;
  duration?: number; // duration in seconds for videos
  qualityScore: number;
  selected: boolean;
  isFavorite?: boolean;
  alt: string;
  tag?: 'mother' | 'daughter' | 'together' | 'celebration' | 'milestone' | 'candid';
}

export interface Scene {
  id: string;
  layout: Layout;
  media: MediaItem[];
  chapterTitle?: string;
  text?: string;
  subtitle?: string;
  date?: string;
  caption?: string;
  duration: number; // in milliseconds
  quoteAuthor?: string;
  themeNote?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  scenes: Scene[];
  mediaCount: number;
}

export interface MemoryStory {
  title: string;
  subtitle: string;
  theme: ThemeStyle;
  eventType?: EventType;
  motherName?: string;
  daughterName?: string;
  sharedDate?: string;
  sections: string[];
  chapters: Chapter[];
  scenes: Scene[];
  totalMediaCount: number;
  totalDurationSeconds: number;
}

export interface BirthdayQuote {
  id: string;
  text: string;
  author?: string;
  category: 'shared-birthday' | 'mother-love' | 'daughter-light' | 'growing-together' | 'milestones' | 'wishes' | 'classic';
  isOriginal?: boolean;
}
