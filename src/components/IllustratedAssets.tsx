import React from 'react';

// ============================================================================
// ILLUSTRATED ASSETS & VECTOR BADGES (単純な記号・絵文字を排除したリッチアセット)
// ============================================================================

// 1. Illustrated Sparkle Star Badge (輝き・ひらめき)
export const SparkleAsset: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-4 h-4", 
  size = 18 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z"
      fill="url(#sparkleGoldGrad)"
      stroke="#D97706"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="18" cy="5" r="1.5" fill="#FDE68A" />
    <circle cx="5" cy="18" r="1.2" fill="#FDE68A" />
    <defs>
      <linearGradient id="sparkleGoldGrad" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Illustrated Moon & Cloud Crest (月と雲の夜紋)
export const MoonCrestAsset: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-5 h-5", 
  size = 20 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 28 28" 
    fill="none" 
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M16.5 3C11 3 6.5 7.5 6.5 13C6.5 18.5 11 23 16.5 23C18.2 23 19.8 22.5 21.2 21.7C17.5 20.8 14.8 17.5 14.8 13.5C14.8 9.5 17.5 6.2 21.2 5.3C19.8 3.8 18.2 3 16.5 3Z"
      fill="url(#moonNightGrad)"
      stroke="#4338CA"
      strokeWidth="1.2"
    />
    {/* Soft cloud puff */}
    <path
      d="M5 20C4 20 3 21 3 22C3 23.5 4.5 24.5 6 24.5H18C19.5 24.5 21 23.5 21 22C21 20.8 20 20 19 20C19 18.5 17.5 17.5 16 17.5C15 17.5 14 18 13.5 18.8C13 18.2 12.2 17.8 11.2 17.8C9.5 17.8 8.2 19 8 20.5C7.2 20.2 6 20 5 20Z"
      fill="#EEF2FF"
      stroke="#6366F1"
      strokeWidth="1"
    />
    <defs>
      <linearGradient id="moonNightGrad" x1="6.5" y1="3" x2="21.2" y2="23" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Illustrated Quill & Ink Well (万年筆とインク)
export const QuillInkAsset: React.FC<{ className?: string; size?: number }> = ({ 
  className = "w-4 h-4", 
  size = 18 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M20.5 3.5C19 2 16.5 2.5 14 5L5.5 13.5C4.8 14.2 4.3 15 4.1 16L3 21L8 19.9C9 19.7 9.8 19.2 10.5 18.5L19 10C21.5 7.5 22 5 20.5 3.5Z"
      fill="#F5EDE4"
      stroke="#78350F"
      strokeWidth="1.2"
    />
    <path d="M12 7L17 12" stroke="#78350F" strokeWidth="1" />
    <circle cx="6" cy="18" r="1" fill="#78350F" />
  </svg>
);

// 4. Illustrated Sound Wave Ribbon (音声波形リボン)
export const SoundWaveRibbon: React.FC<{ isRecording?: boolean; className?: string }> = ({ 
  isRecording = false,
  className = "" 
}) => (
  <div className={`flex items-center space-x-0.75 h-4 px-1 ${className}`}>
    {[8, 14, 6, 18, 11, 16, 7, 13, 17, 9].map((h, i) => (
      <span
        key={i}
        className={`w-0.75 rounded-full transition-all duration-150 ${
          isRecording ? 'bg-amber-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-600'
        }`}
        style={{
          height: isRecording ? `${Math.max(4, (h * (0.6 + Math.sin(i * 1.2 + Date.now() * 0.005) * 0.4)))}px` : '4px',
          animationDelay: `${i * 70}ms`,
        }}
      />
    ))}
  </div>
);

// 5. Illustrated 4-Koma Manga Frame Emblem (4コマ漫画エンブレム)
export const MangaFrameEmblem: React.FC<{ size?: number; className?: string }> = ({ 
  size = 20, 
  className = "" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" />
    {/* 4 mini frames */}
    <rect x="5" y="5" width="6" height="5.5" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    <rect x="13" y="5" width="6" height="5.5" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    <rect x="5" y="13.5" width="6" height="5.5" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
    <rect x="13" y="13.5" width="6" height="5.5" rx="1" fill="#FDE68A" stroke="#B45309" strokeWidth="1" />
    <circle cx="16" cy="16.2" r="1.2" fill="#B45309" />
  </svg>
);

// 6. Illustrated Footprint Paw Trail (動物の足あと)
export const PawTrailAsset: React.FC<{ size?: number; className?: string }> = ({ 
  size = 18, 
  className = "" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <ellipse cx="12" cy="15" rx="4.5" ry="3.5" fill="#A78BFA" opacity="0.8" />
    <circle cx="7" cy="9.5" r="1.8" fill="#8B5CF6" />
    <circle cx="10.5" cy="7.5" r="1.8" fill="#8B5CF6" />
    <circle cx="14" cy="7.5" r="1.8" fill="#8B5CF6" />
    <circle cx="17.5" cy="9.5" r="1.8" fill="#8B5CF6" />
  </svg>
);

// 7. Illustrated Watercolor Palette & Brush (絵の具パレット & 筆)
export const PaletteBrushAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    {/* Wooden Palette */}
    <path
      d="M12 3C6.5 3 2 7.2 2 12.5C2 17.8 6.5 21 11.5 21C13.5 21 14.5 19.8 14.5 18.5C14.5 17.5 13.8 16.8 13.8 15.8C13.8 14.5 14.8 13.5 16 13.5H18C20.5 13.5 22 11.5 22 9C22 5.5 17.5 3 12 3Z"
      fill="#FDE68A"
      stroke="#B45309"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Color blobs */}
    <circle cx="6.5" cy="9.5" r="1.6" fill="#EF4444" />
    <circle cx="10" cy="6.8" r="1.6" fill="#3B82F6" />
    <circle cx="14.5" cy="6.8" r="1.6" fill="#10B981" />
    <circle cx="18" cy="9.5" r="1.6" fill="#F59E0B" />
    {/* Thumb hole */}
    <ellipse cx="17" cy="17" rx="1.8" ry="1.4" fill="#F5EDE4" stroke="#B45309" strokeWidth="1" />
    {/* Paintbrush dipping */}
    <path
      d="M21 2.5C20.5 2 19 3 17 5L15 7L17 9L19 7C21 5 21.5 3 21 2.5Z"
      fill="#D97706"
      stroke="#78350F"
      strokeWidth="0.8"
    />
  </svg>
);

// 8. Illustrated Idea Lightbulb Lantern (手描き電球ひらめきランプ)
export const LightbulbIdeaAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    {/* Outer glow rays */}
    <line x1="12" y1="2" x2="12" y2="4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="4.5" y1="5" x2="6" y2="6.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="19.5" y1="5" x2="18" y2="6.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2" y1="12" x2="4" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="12" x2="20" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    {/* Glass bulb */}
    <path
      d="M12 5C8.7 5 6 7.7 6 11C6 13.2 7.2 15.2 9 16.3V18C9 18.5 9.5 19 10 19H14C14.5 19 15 18.5 15 18V16.3C16.8 15.2 18 13.2 18 11C18 7.7 15.3 5 12 5Z"
      fill="#FEF08A"
      stroke="#B45309"
      strokeWidth="1.3"
    />
    {/* Glowing Filament */}
    <path d="M10 11C10.5 9.5 13.5 9.5 14 11C14 12.5 12 13 12 14" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    {/* Screw base */}
    <rect x="9.5" y="19" width="5" height="2" rx="0.5" fill="#9CA3AF" stroke="#4B5563" strokeWidth="0.8" />
    <ellipse cx="12" cy="21.5" rx="1.5" ry="0.6" fill="#4B5563" />
  </svg>
);

// 9. Illustrated Pencil Sketch Asset (鉛筆スケッチ)
export const PencilSketchAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M18.5 2.5C17.5 1.5 15.8 1.5 14.8 2.5L4 13.3L3 20L9.7 19L20.5 8.2C21.5 7.2 21.5 5.5 20.5 4.5L18.5 2.5Z"
      fill="#FEF3C7"
      stroke="#92400E"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    {/* Eraser and ferrule */}
    <path d="M14.8 2.5L18.5 6.2" stroke="#92400E" strokeWidth="1.2" />
    <path d="M13 4.3L16.7 8" stroke="#92400E" strokeWidth="1" />
    {/* Lead tip */}
    <polygon points="3,20 4.5,15.5 7.5,18.5" fill="#4B5563" />
  </svg>
);

// 10. Illustrated Mini Analog Cassette (手のひらカセットテープ)
export const MiniCassetteAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 26 20"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    {/* Shell */}
    <rect x="1" y="1" width="24" height="18" rx="2.5" fill="#1E293B" stroke="#64748B" strokeWidth="1.2" />
    {/* Label */}
    <rect x="3.5" y="3" width="19" height="10" rx="1.5" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.8" />
    {/* Central Window */}
    <rect x="7" y="5.5" width="12" height="5" rx="1" fill="#0F172A" stroke="#334155" strokeWidth="0.6" />
    {/* Spool 1 */}
    <circle cx="10" cy="8" r="1.8" fill="#F59E0B" />
    <circle cx="10" cy="8" r="0.7" fill="#0F172A" />
    {/* Spool 2 */}
    <circle cx="16" cy="8" r="1.8" fill="#F59E0B" />
    <circle cx="16" cy="8" r="0.7" fill="#0F172A" />
    {/* Trapezoid bottom base */}
    <path d="M5 19L7.5 15H18.5L21 19Z" fill="#334155" stroke="#64748B" strokeWidth="0.8" />
  </svg>
);

// 11. Illustrated Speech Bubble Tale (セリフ吹き出し)
export const SpeechBubbleTaleAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M20 11C20 6.6 16.4 3 12 3C7.6 3 4 6.6 4 11C4 13.2 4.9 15.2 6.4 16.6L5.5 20.5L9.6 18.7C10.4 18.9 11.2 19 12 19C16.4 19 20 15.4 20 11Z"
      fill="#EFF6FF"
      stroke="#3B82F6"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="11" r="1" fill="#3B82F6" />
    <circle cx="12" cy="11" r="1" fill="#3B82F6" />
    <circle cx="15" cy="11" r="1" fill="#3B82F6" />
  </svg>
);

// 12. Illustrated Star Gem Badge (キラ星バッジ)
export const StarGemAsset: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 16,
  className = "",
  color = "#F59E0B",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <polygon
      points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5"
      fill={color}
      stroke="#B45309"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="1.5" fill="#FFFBEB" />
  </svg>
);

// 13. Illustrated Open Tome / Dream Journal (夢日記の魔導書)
export const BookJournalAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    {/* Book Cover Backing */}
    <path
      d="M2 5C2 4 3 3 4 3H10C11.5 3 12 4 12 5V20C12 19 11 18.5 9.5 18.5H4C3 18.5 2 19 2 20V5Z"
      fill="#FDFBF7"
      stroke="#78350F"
      strokeWidth="1.3"
    />
    <path
      d="M22 5C22 4 21 3 20 3H14C12.5 3 12 4 12 5V20C12 19 13 18.5 14.5 18.5H20C21 18.5 22 19 22 20V5Z"
      fill="#FDFBF7"
      stroke="#78350F"
      strokeWidth="1.3"
    />
    {/* Page text lines */}
    <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
    <line x1="4.5" y1="10" x2="8.5" y2="10" stroke="#B45309" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="4.5" y1="13" x2="9" y2="13" stroke="#B45309" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="14.5" y1="7" x2="19.5" y2="7" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
    <line x1="14.5" y1="10" x2="18.5" y2="10" stroke="#B45309" strokeWidth="0.8" strokeLinecap="round" />
    <line x1="14.5" y1="13" x2="19" y2="13" stroke="#B45309" strokeWidth="0.8" strokeLinecap="round" />
    {/* Bookmark ribbon */}
    <path d="M12 3V12L13.5 10.5L15 12V3" fill="#DC2626" />
  </svg>
);

// 14. Illustrated Close Cross Asset (手描き風ばつボタン)
export const CloseCrossAsset: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`inline-block align-middle shrink-0 ${className}`}
  >
    <path
      d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
