export interface ComicPanel {
  panelNumber: number; // 1 to 4
  stage: '起' | '承' | '転' | '結';
  heading: string;
  description: string;
  dialogue: string;
  motifIcon: string;
  colorTone: string;
  imageUrl?: string; // AI generated visual illustration (Base64 or URL)
}

export interface ComicStrip {
  id: string;
  title: string;
  style: 'storybook' | 'retro_manga' | 'cyber_game' | 'news_flash' | 'movie_poster' | 'custom' | string;
  styleLabel: string;
  customStylePrompt?: string;
  panels: ComicPanel[];
  punchline: string;
  generatedAt: string;
  costInfo?: {
    totalUsd: number;
    totalJpy: number;
    generatedCount: number;
  };
}

export interface MoviePoster {
  catchphrase: string;
  directorNote: string;
  genreTag: string;
  cast: string[];
  releaseSeason: string;
}

export interface DreamParameters {
  surrealism: number; // シュール度 0-100
  workFactor: number; // 職場成分 0-100
  catFactor: number; // 猫成分 0-100
  floatiness: number; // 浮遊感 0-100
  logicBreak: number; // ロジック崩壊度 0-100
  vividness: number; // 色彩・鮮明度 0-100
}

export interface DreamRecord {
  id: string;
  createdAt: string;
  timeLabel: string; // e.g. "07:14"
  dateLabel: string; // e.g. "2026.08.22"
  rawTranscription: string;
  title: string;
  summary: string;
  category: string;
  characters: string[];
  places: string[];
  motifs: string[];
  mood: string[];
  parameters: DreamParameters;
  shareCopy: string;
  isPublic: boolean;
  audioDurationSec?: number;
  comicStrip?: ComicStrip;
  moviePoster?: MoviePoster;
  keyVisualImageUrl?: string; // AI generated single-cut art/poster
  likesCount?: number;
  reactions?: {
    moon: number; // 🌙 しみじみ
    surreal: number; // 🌀 シュール
    relatable: number; // 💭 わかる
  };
  userReaction?: 'moon' | 'surreal' | 'relatable' | null;
  authorName?: string;
  authorAvatar?: string;
}

export interface AppSettings {
  alarmTime: string; // "07:00"
  alarmDays: number[]; // 0..6
  alarmEnabled: boolean;
  alarmSound: string;
  autoOpenOnAlarm: boolean;
  saveAudioOriginal: boolean;
  defaultPublic: boolean;
  enableVibration: boolean;
  userName: string;
  isPremiumUser: boolean; // 無料プラン / プレミアムサポーター
  showSponsorCards: boolean; // スポンサー標本枠の表示
}
