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
    moon: number; // 鑑賞・しみじみ
    surreal: number; // 奇観・シュール
    relatable: number; // 共鳴・わかる
  };
  userReaction?: 'moon' | 'surreal' | 'relatable' | null;
  authorName?: string;
  authorAvatar?: string;
}

export type AlarmSoundId = 
  | 'musicbox_lullaby' 
  | 'morning_birds' 
  | 'retro_digital' 
  | 'celestial_dawn' 
  | 'capybara_shishiodoshi' 
  | 'baku_fanfare' 
  | 'custom';

export interface UserProfile {
  name: string;
  avatarId: string; // 'baku' | 'sheep' | 'capybara' | 'tsukisama' | 'telescope' | 'cat'
  bio: string;
  favoriteGenre: string;
  joinDate: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface VoiceprintProfile {
  isCalibrated: boolean;
  calibratedAt?: string;
  pitchCategory: 'low' | 'mid' | 'high'; // 基本周波数 (低音: ~140Hz / 中音: 140~220Hz / 高音: 220Hz~)
  estimatedF0Hz: number; // e.g. 115Hz
  morningVoiceBoost: boolean; // 寝起きの低音・かすれ声・ぼそぼそ声の自動ゲイン増幅
  noiseSuppression: boolean; // 布団擦れや環境低周波ノイズのカット
  speakingPace: 'slow' | 'normal' | 'fast';
  frequentKeywords: string[]; // ユーザー固有の頻出ワード・人物名・ペット名（例: ["しおちゃん", "水族館", "イルカ"]）
  sampleAudioBase64?: string;
  autoAiRefinement: boolean; // 録音完了時に自動でAI声紋補正と重複除去を実行
}

export interface AppSettings {
  alarmTime: string; // "07:00"
  alarmDays: number[]; // 0..6
  alarmEnabled: boolean;
  alarmSound: AlarmSoundId | string;
  alarmVolume: number; // 0.1 - 1.0
  customAlarmAudio?: string; // Base64 Data URL for user's recorded alarm voice
  customAlarmLabel?: string;
  themeSoundEnabled: boolean; // Enable UI theme sound effects
  autoOpenOnAlarm: boolean;
  saveAudioOriginal: boolean;
  defaultPublic: boolean;
  enableVibration: boolean;
  userName: string;
  userProfile?: UserProfile;
  voiceprintProfile?: VoiceprintProfile;
  isPremiumUser: boolean; // 無料プラン / プレミアムサポーター
  showSponsorCards: boolean; // スポンサー標本枠の表示
}

