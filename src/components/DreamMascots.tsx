import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { SparkleAsset, MoonCrestAsset, MangaFrameEmblem, PawTrailAsset } from './IllustratedAssets';

// Quotes for each mascot
const BAKU_QUOTES = [
  'テクテク… いい夢さがし中♪',
  '今朝の夢、どんな味だった？',
  '夢の欠片を4コマにするよ！',
  '起きたての言葉、あつめよう！',
  'モグモグ… 不思議な夢だなぁ',
  '忘れるまえに、声でつかまえて！',
  'Zzz… まだ少しねむいかも？',
];

const SHEEP_QUOTES = [
  'トコトコ… 羊が一匹、羊が…',
  'ふわぁ〜 よく眠れた？',
  '夢の世界からお見送りだよ',
  '今日もいい朝になりますように',
  'メェ〜♪ 夢日記つけてね！',
  '星のかけらを集めてるの！',
];

const TSUKISAMA_QUOTES = [
  '今夜も素敵な夢の世界へ…',
  'すやすや… 静かな夜だよ',
  '夜の静けさに耳を澄まして',
  '星のランタンが夢を照らすよ',
  '枕元でそっと見守っているね',
];

const USAGI_QUOTES = [
  '夢の傾向をピョンと解析中！',
  '感情の波に星のサインが出てるよ！',
  '昨日の夢とキーワードがつながったよ！',
  'ピョン♪ 記憶のデータ帳に記録完了！',
  'シュール度高めの夢、発見！',
];

const NEKO_QUOTES = [
  'ニャ〜… おもしろい夢のにおい♪',
  'ゴロゴロ… 丸くなって夢を聴くニャ',
  '夢の標本箱をチョイチョイっと整理ニャ',
  'ふわふわ雲のベッド、最高ニャ〜',
  'お魚が空を飛ぶ夢、また見たいニャ',
];

const CAPYBARA_QUOTES = [
  'ふぅ〜… 音の露天風呂でぽかぽか極楽',
  'あせらず、のんびり、夢を反芻しよう',
  'ゆずの香りと優しい音色でリラックス〜',
  'いい夢を育てるには深呼吸が一番だよ',
  'の〜んびり、マイペースにいこう',
];

const TANUKI_QUOTES = [
  'ドロン！ 不思議な夢を4コマに大変化！',
  'ポンポコ♪ オチのコマは任せておくれ！',
  '現実じゃありえないヘンテコな夢、大好物！',
  '葉っぱ一枚あればどんな夢物語も描けるポン！',
  'クスッと笑える展開にしてあげるよ♪',
];

export interface MascotBaseProps {
  size?: 'sm' | 'md' | 'lg';
  isWalking?: boolean;
  interactive?: boolean;
  onTap?: () => void;
  showSpeech?: boolean;
  speechText?: string;
  className?: string;
}

// ============================================================================
// 1. BAKU MASCOT (夢喰いバクくん - 紺碧と和紙のツートン)
// ============================================================================
export const BakuMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = true,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-10',
    md: 'w-18 h-14',
    lg: 'w-24 h-20',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setShowHeart(true);
    setQuoteIndex((prev) => (prev + 1) % BAKU_QUOTES.length);
    if (onTap) onTap();

    setTimeout(() => setIsJumping(false), 500);
    setTimeout(() => setShowHeart(false), 1200);
  };

  const currentSpeech = speechText || BAKU_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showHeart && (
        <div className="absolute -top-6 pointer-events-none flex items-center space-x-1 animate-bounce z-30">
          <SparkleAsset size={16} />
          <span className="text-rose-500 text-xs font-handwriting font-bold">もぐもぐ♪</span>
          <MoonCrestAsset size={16} />
        </div>
      )}

      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[-1.5deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-3 scale-110' : ''} transition-all duration-300`}>
        <div className={isWalking ? 'animate-mascot-bob' : ''}>
          <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-sm overflow-visible">
            <defs>
              <linearGradient id="bakuBodyGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#39446B" />
                <stop offset="50%" stopColor="#2A3152" />
                <stop offset="100%" stopColor="#1E233D" />
              </linearGradient>
              <linearGradient id="bakuBellyGradNew" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5EFEB" />
                <stop offset="100%" stopColor="#E2D7CC" />
              </linearGradient>
            </defs>

            {/* Back Feet */}
            <g className={isWalking ? 'animate-foot-right' : ''}>
              <ellipse cx="68" cy="55" rx="4.5" ry="6.5" fill="#1C2138" />
            </g>
            <g className={isWalking ? 'animate-foot-left' : ''}>
              <ellipse cx="32" cy="55" rx="4" ry="6.5" fill="#1C2138" />
            </g>

            {/* Tail */}
            <ellipse cx="78" cy="40" rx="3.5" ry="3.5" fill="#F5EFEB" />

            {/* Main Body */}
            <ellipse cx="52" cy="38" rx="26" ry="18" fill="url(#bakuBodyGradNew)" />

            {/* Belly Patch */}
            <path
              d="M38,26 Q52,24 66,26 Q68,48 64,52 Q52,55 40,52 Q36,46 38,26 Z"
              fill="url(#bakuBellyGradNew)"
            />

            {/* Star Constellation on Back */}
            <circle cx="68" cy="32" r="1.5" fill="#F7D070" />
            <circle cx="73" cy="36" r="1.2" fill="#F7D070" opacity="0.9" />
            <path d="M68,32 L73,36" stroke="#F7D070" strokeWidth="0.6" strokeDasharray="1,1" opacity="0.6" />

            {/* Front Feet */}
            <g className={isWalking ? 'animate-foot-left' : ''}>
              <ellipse cx="44" cy="56" rx="4.5" ry="7" fill="#252D4B" stroke="#181D33" strokeWidth="1" />
            </g>
            <g className={isWalking ? 'animate-foot-right' : ''}>
              <ellipse cx="58" cy="56" rx="4.5" ry="7" fill="#252D4B" stroke="#181D33" strokeWidth="1" />
            </g>

            {/* Head & Snout */}
            <ellipse cx="28" cy="34" rx="14" ry="13" fill="url(#bakuBodyGradNew)" />
            <path
              d="M20,35 C14,35 9,33 7,37 C6,39 8,41 12,41 C16,41 20,40 22,39"
              fill="none"
              stroke="url(#bakuBodyGradNew)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="8" cy="38" r="1.2" fill="#141828" />

            {/* Cute Ear */}
            <ellipse cx="36" cy="22" rx="4.5" ry="6.5" fill="#252D4B" transform="rotate(-20, 36, 22)" />
            <ellipse cx="36" cy="22" rx="2.5" ry="4" fill="#E8B4B8" transform="rotate(-20, 36, 22)" />

            {/* Smiling Sleepy Eye */}
            <path d="M22,31 Q26,34 30,31" fill="none" stroke="#F7D070" strokeWidth="1.8" strokeLinecap="round" />
            {/* Cheek blush */}
            <ellipse cx="24" cy="37" rx="3" ry="2" fill="#E8B4B8" opacity="0.75" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. HITSUJI MASCOT (ふわふわ羊さん)
// ============================================================================
export const HitsujiMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = true,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [showZzz, setShowZzz] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-10',
    md: 'w-18 h-14',
    lg: 'w-24 h-20',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setShowZzz(true);
    setQuoteIndex((prev) => (prev + 1) % SHEEP_QUOTES.length);
    if (onTap) onTap();

    setTimeout(() => setIsJumping(false), 500);
    setTimeout(() => setShowZzz(false), 1200);
  };

  const currentSpeech = speechText || SHEEP_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showZzz && (
        <div className="absolute -top-6 pointer-events-none flex items-center space-x-1 animate-bounce z-30 font-handwriting text-amber-500 font-bold text-xs">
          <span>メェ〜♪</span>
          <SparkleAsset size={14} />
        </div>
      )}

      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[1.5deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-3 scale-110' : ''} transition-all duration-300`}>
        <div className={isWalking ? 'animate-mascot-bob' : ''}>
          <svg viewBox="0 0 100 70" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Legs */}
            <g className={isWalking ? 'animate-foot-left' : ''}>
              <line x1="38" y1="52" x2="38" y2="64" stroke="#4A3B32" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="38" cy="64" rx="2.5" ry="1.5" fill="#2C221C" />
            </g>
            <g className={isWalking ? 'animate-foot-right' : ''}>
              <line x1="48" y1="52" x2="48" y2="64" stroke="#4A3B32" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="48" cy="64" rx="2.5" ry="1.5" fill="#2C221C" />
            </g>
            <g className={isWalking ? 'animate-foot-left' : ''}>
              <line x1="60" y1="52" x2="60" y2="64" stroke="#4A3B32" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="60" cy="64" rx="2.5" ry="1.5" fill="#2C221C" />
            </g>
            <g className={isWalking ? 'animate-foot-right' : ''}>
              <line x1="70" y1="52" x2="70" y2="64" stroke="#4A3B32" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="70" cy="64" rx="2.5" ry="1.5" fill="#2C221C" />
            </g>

            {/* Cloud Wool Body */}
            <g fill="#FFFDF9" stroke="#E5DDD0" strokeWidth="1.5">
              <circle cx="44" cy="34" r="14" />
              <circle cx="58" cy="32" r="15" />
              <circle cx="70" cy="36" r="13" />
              <circle cx="52" cy="46" r="12" />
              <circle cx="66" cy="44" r="12" />
              <circle cx="36" cy="42" r="10" />
            </g>

            {/* Wool Inner Texture */}
            <path d="M46,30 Q48,27 52,29" fill="none" stroke="#E8DFD1" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M60,34 Q62,31 66,33" fill="none" stroke="#E8DFD1" strokeWidth="1.2" strokeLinecap="round" />

            {/* Head */}
            <ellipse cx="26" cy="38" rx="9" ry="8" fill="#F4ECE1" stroke="#4A3B32" strokeWidth="1.2" />

            {/* Horns (Curled golden ram horns) */}
            <path
              d="M24,31 C20,28 16,30 18,34 C19,36 21,35 22,34"
              fill="none"
              stroke="#D4A373"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cute Droopy Ears */}
            <ellipse cx="28" cy="42" rx="4" ry="2" fill="#E8B4B8" transform="rotate(25, 28, 42)" />

            {/* Head Wool Tuft */}
            <circle cx="25" cy="28" r="4.5" fill="#FFFDF9" stroke="#E5DDD0" strokeWidth="1" />
            <circle cx="28" cy="29" r="4" fill="#FFFDF9" stroke="#E5DDD0" strokeWidth="1" />

            {/* Sleepy Eyes */}
            <path d="M20,38 Q22,40 24,38" fill="none" stroke="#4A3B32" strokeWidth="1.4" strokeLinecap="round" />
            {/* Cheek Blush */}
            <circle cx="21" cy="42" r="2.2" fill="#F4A261" opacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. TSUKISAMA MASCOT (お月様 - すやすやナイトキャップ三日月)
// ============================================================================
export const TsukisamaMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = false,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-12',
    md: 'w-18 h-18',
    lg: 'w-24 h-24',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setQuoteIndex((prev) => (prev + 1) % TSUKISAMA_QUOTES.length);
    if (onTap) onTap();
    setTimeout(() => setIsJumping(false), 500);
  };

  const currentSpeech = speechText || TSUKISAMA_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-indigo-950/95 text-indigo-100 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-indigo-400 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[-1deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-950 border-r-1.5 border-b-1.5 border-indigo-400 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-2 scale-110' : ''} transition-all duration-300`}>
        <div className="animate-pulse" style={{ animationDuration: '4s' }}>
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-md overflow-visible">
            {/* Glowing Moon Halo */}
            <circle cx="40" cy="40" r="32" fill="#FEF08A" opacity="0.18" />

            {/* Crescent Moon Body */}
            <path
              d="M48,16 C30,16 18,28 18,44 C18,60 30,72 48,72 C53,72 58,70 62,68 C48,64 38,50 38,44 C38,36 48,22 62,20 C58,18 53,16 48,16 Z"
              fill="#FDE047"
              stroke="#CA8A04"
              strokeWidth="2"
            />

            {/* Nightcap Hat (Poaked with stars) */}
            <path
              d="M44,17 C42,10 52,2 62,4 C60,12 50,16 44,17 Z"
              fill="#312E81"
              stroke="#4338CA"
              strokeWidth="1.5"
            />
            {/* Cap Brim */}
            <ellipse cx="48" cy="16" rx="7" ry="2.5" fill="#E0E7FF" />
            {/* Cap Pom-Pom */}
            <circle cx="63" cy="4" r="3.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />

            {/* Peaceful Closed Eye */}
            <path d="M30,42 Q34,45 38,42" fill="none" stroke="#713F12" strokeWidth="1.8" strokeLinecap="round" />
            {/* Rosy Cheek */}
            <ellipse cx="32" cy="47" rx="3.5" ry="2" fill="#F87171" opacity="0.6" />

            {/* Hanging Star Lantern */}
            <g transform="translate(20, 48)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#CA8A04" strokeWidth="1" strokeDasharray="1,1" />
              <polygon points="0,11 2.5,14 6,14 3,16.5 4,20 0,18 -4,20 -3,16.5 -6,14 -2.5,14" fill="#FACC15" stroke="#A16207" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. USAGI MASCOT (星耳うさぎの夢分析官)
// ============================================================================
export const UsagiMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = true,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-14',
    md: 'w-16 h-18',
    lg: 'w-22 h-24',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setQuoteIndex((prev) => (prev + 1) % USAGI_QUOTES.length);
    if (onTap) onTap();
    setTimeout(() => setIsJumping(false), 500);
  };

  const currentSpeech = speechText || USAGI_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[1deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-3 scale-110' : ''} transition-all duration-300`}>
        <div className={isWalking ? 'animate-mascot-bob' : ''}>
          <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Long Floppy Ears */}
            <ellipse cx="28" cy="18" rx="5" ry="15" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" transform="rotate(-12, 28, 18)" />
            <ellipse cx="28" cy="18" rx="2.5" ry="10" fill="#FBCFE8" transform="rotate(-12, 28, 18)" />

            <ellipse cx="42" cy="18" rx="5" ry="15" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" transform="rotate(12, 42, 18)" />
            <ellipse cx="42" cy="18" rx="2.5" ry="10" fill="#FBCFE8" transform="rotate(12, 42, 18)" />

            {/* Tiny Star Ear Piercing */}
            <circle cx="43" cy="8" r="1.5" fill="#FBBF24" />

            {/* Round Body */}
            <ellipse cx="35" cy="54" rx="16" ry="14" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" />

            {/* Feet */}
            <ellipse cx="27" cy="67" rx="5" ry="3.5" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" />
            <ellipse cx="43" cy="67" rx="5" ry="3.5" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" />

            {/* Head */}
            <circle cx="35" cy="38" r="15" fill="#FAF5EF" stroke="#473C35" strokeWidth="1.5" />

            {/* Eyes */}
            <circle cx="29" cy="36" r="2.2" fill="#473C35" />
            <circle cx="30" cy="35" r="0.8" fill="#FFF" />
            <circle cx="41" cy="36" r="2.2" fill="#473C35" />
            <circle cx="42" cy="35" r="0.8" fill="#FFF" />

            {/* Twitching Nose & Mouth */}
            <path d="M33.5,41 L36.5,41 L35,43 Z" fill="#F472B6" />
            <path d="M33,44 Q35,46 37,44" fill="none" stroke="#473C35" strokeWidth="1" strokeLinecap="round" />

            {/* Cheek Blush */}
            <circle cx="26" cy="41" r="2.5" fill="#FDA4AF" opacity="0.7" />
            <circle cx="44" cy="41" r="2.5" fill="#FDA4AF" opacity="0.7" />

            {/* Little Magnifying Glass held in hand */}
            <g transform="translate(43, 44)">
              <line x1="0" y1="0" x2="6" y2="8" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill="#BFDBFE" opacity="0.6" stroke="#D97706" strokeWidth="1.5" />
              <path d="M-2,-2 L1,1" stroke="#FFF" strokeWidth="1" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. NEKO MASCOT (雲の上の三毛猫さん)
// ============================================================================
export const NekoMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = true,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-10',
    md: 'w-18 h-14',
    lg: 'w-24 h-18',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setQuoteIndex((prev) => (prev + 1) % NEKO_QUOTES.length);
    if (onTap) onTap();
    setTimeout(() => setIsJumping(false), 500);
  };

  const currentSpeech = speechText || NEKO_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[-1.5deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-3 scale-110' : ''} transition-all duration-300`}>
        <div className={isWalking ? 'animate-mascot-bob' : ''}>
          <svg viewBox="0 0 90 70" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Swishing Tail */}
            <path
              d="M72,44 C82,42 84,30 80,24 C78,20 74,22 75,25 C77,30 74,38 68,42"
              fill="#D97706"
              stroke="#3F3F46"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Cloud Cushion Base */}
            <path
              d="M20,54 Q30,48 44,52 Q60,46 72,54 Q76,62 64,64 Q42,66 22,62 Q16,58 20,54 Z"
              fill="#F4F4F5"
              stroke="#E4E4E7"
              strokeWidth="1"
            />

            {/* Cat Body (Round Calico) */}
            <ellipse cx="48" cy="42" rx="20" ry="14" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="1.5" />
            {/* Orange Calico Patch */}
            <path d="M38,30 Q46,32 52,29 Q54,42 42,44 Z" fill="#F97316" />
            {/* Black Calico Patch */}
            <path d="M56,36 Q64,34 66,42 Q60,46 54,44 Z" fill="#27272A" />

            {/* Paws tucked in */}
            <ellipse cx="32" cy="50" rx="4" ry="2.5" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="1" />
            <ellipse cx="42" cy="50" rx="4" ry="2.5" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="1" />

            {/* Cat Head */}
            <circle cx="28" cy="34" r="12" fill="#FFFFFF" stroke="#3F3F46" strokeWidth="1.5" />
            {/* Pointy Ears */}
            <polygon points="18,26 24,16 28,24" fill="#F97316" stroke="#3F3F46" strokeWidth="1.2" />
            <polygon points="28,24 34,16 38,26" fill="#27272A" stroke="#3F3F46" strokeWidth="1.2" />

            {/* Sleepy Smiling Eyes */}
            <path d="M22,33 Q25,36 28,33" fill="none" stroke="#3F3F46" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M29,33 Q32,36 35,33" fill="none" stroke="#3F3F46" strokeWidth="1.4" strokeLinecap="round" />
            {/* Nose & Mouth */}
            <circle cx="28.5" cy="36" r="1" fill="#FB7185" />
            <path d="M26,38 Q28.5,40 31,38" fill="none" stroke="#3F3F46" strokeWidth="1" />

            {/* Whiskers */}
            <line x1="17" y1="34" x2="22" y2="35" stroke="#71717A" strokeWidth="0.8" />
            <line x1="17" y1="38" x2="22" y2="37" stroke="#71717A" strokeWidth="0.8" />
            <line x1="35" y1="35" x2="40" y2="34" stroke="#71717A" strokeWidth="0.8" />
            <line x1="35" y1="37" x2="40" y2="38" stroke="#71717A" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. CAPYBARA MASCOT (雲の露天風呂カピバラさん)
// ============================================================================
export const CapybaraMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = false,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const scaleMap = {
    sm: 'w-14 h-12',
    md: 'w-20 h-16',
    lg: 'w-26 h-20',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('low');
    setIsJumping(true);
    setQuoteIndex((prev) => (prev + 1) % CAPYBARA_QUOTES.length);
    if (onTap) onTap();
    setTimeout(() => setIsJumping(false), 500);
  };

  const currentSpeech = speechText || CAPYBARA_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[1deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-2 scale-105' : ''} transition-all duration-300`}>
        <div className="animate-mascot-bob">
          <svg viewBox="0 0 90 70" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Steamy Vapor rising */}
            <path d="M42,12 Q45,6 42,2" fill="none" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M52,10 Q56,4 52,0" fill="none" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

            {/* Bath Tub Cloud Ripples */}
            <ellipse cx="45" cy="56" rx="34" ry="10" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.5" />
            <path d="M22,54 Q45,60 68,54" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Capybara Body (Warm Caramel Brown) */}
            <ellipse cx="46" cy="44" rx="24" ry="16" fill="#A2673F" stroke="#452614" strokeWidth="1.5" />

            {/* Capybara Distinct Square Snout Head */}
            <path
              d="M26,32 C26,26 36,24 46,26 C48,34 46,44 40,46 C32,46 26,40 26,32 Z"
              fill="#A2673F"
              stroke="#452614"
              strokeWidth="1.5"
            />
            {/* Tiny Ear */}
            <circle cx="44" cy="27" r="3" fill="#6B3E26" stroke="#452614" strokeWidth="1" />

            {/* Zen Sleepy Slit Eye (- ‿ -) */}
            <line x1="32" y1="33" x2="38" y2="33" stroke="#26150C" strokeWidth="2" strokeLinecap="round" />

            {/* Square Nostril */}
            <ellipse cx="27" cy="36" rx="1.5" ry="2" fill="#26150C" />

            {/* Yuzu Citrus on Head */}
            <circle cx="36" cy="21" r="5.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
            <circle cx="36" cy="18" r="1" fill="#65A30D" />
            {/* Yuzu leaf */}
            <path d="M37,17 Q42,14 41,18 Z" fill="#84CC16" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. TANUKI MASCOT (夢変化 & 4コマオチ師 たぬきさん)
// ============================================================================
export const TanukiMascot: React.FC<MascotBaseProps> = ({
  size = 'md',
  isWalking = true,
  interactive = true,
  onTap,
  showSpeech = true,
  speechText,
  className = '',
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const scaleMap = {
    sm: 'w-12 h-12',
    md: 'w-18 h-16',
    lg: 'w-24 h-22',
  };

  const handleTap = () => {
    if (!interactive) return;
    audioEngine.playMechanicalClick('high');
    setIsJumping(true);
    setQuoteIndex((prev) => (prev + 1) % TANUKI_QUOTES.length);
    if (onTap) onTap();
    setTimeout(() => setIsJumping(false), 500);
  };

  const currentSpeech = speechText || TANUKI_QUOTES[quoteIndex];

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      onClick={handleTap}
    >
      {showSpeech && (
        <div className="relative mb-1 pointer-events-none transition-transform group-hover:scale-105 z-20">
          <div className="bg-white/95 text-neutral-800 text-[11px] font-handwriting font-medium px-2.5 py-1 rounded-2xl border-1.5 border-neutral-800 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] max-w-[170px] text-center leading-snug rotate-[-2deg]">
            {currentSpeech}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-1.5 border-b-1.5 border-neutral-800 rotate-45" />
          </div>
        </div>
      )}

      <div className={`relative ${scaleMap[size]} ${isJumping ? '-translate-y-3 scale-110' : ''} transition-all duration-300`}>
        <div className={isWalking ? 'animate-mascot-bob' : ''}>
          <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Striped Bushy Tail */}
            <path
              d="M58,54 C72,50 78,38 72,30 C66,32 62,42 56,48"
              fill="#8B5A2B"
              stroke="#3E2723"
              strokeWidth="1.5"
            />
            {/* Tail dark bands */}
            <path d="M64,36 Q68,40 62,45" stroke="#3E2723" strokeWidth="2.5" />

            {/* Plump Round Body */}
            <ellipse cx="38" cy="52" rx="18" ry="16" fill="#A0522D" stroke="#3E2723" strokeWidth="1.5" />
            {/* Cream Tummy (Drum belly) */}
            <ellipse cx="36" cy="54" rx="12" ry="11" fill="#FDF5E6" stroke="#D7CCC8" strokeWidth="1" />

            {/* Feet */}
            <ellipse cx="28" cy="67" rx="5" ry="3" fill="#3E2723" />
            <ellipse cx="46" cy="67" rx="5" ry="3" fill="#3E2723" />

            {/* Head */}
            <circle cx="36" cy="34" r="14" fill="#A0522D" stroke="#3E2723" strokeWidth="1.5" />

            {/* Round Ears */}
            <circle cx="26" cy="23" r="4.5" fill="#3E2723" />
            <circle cx="26" cy="23" r="2" fill="#D7CCC8" />
            <circle cx="46" cy="23" r="4.5" fill="#3E2723" />
            <circle cx="46" cy="23" r="2" fill="#D7CCC8" />

            {/* Tanuki Eye Mask Patches */}
            <ellipse cx="30" cy="34" rx="4.5" ry="3.5" fill="#2E1C14" transform="rotate(-15, 30, 34)" />
            <ellipse cx="42" cy="34" rx="4.5" ry="3.5" fill="#2E1C14" transform="rotate(15, 42, 34)" />

            {/* Sparkling Eyes */}
            <circle cx="30" cy="34" r="1.6" fill="#FFF" />
            <circle cx="42" cy="34" r="1.6" fill="#FFF" />

            {/* Snout & Smiling Mouth */}
            <ellipse cx="36" cy="38" rx="4" ry="3" fill="#FDF5E6" />
            <polygon points="36,36 34.5,38 37.5,38" fill="#1B0F09" />
            <path d="M34,40 Q36,42 38,40" fill="none" stroke="#3E2723" strokeWidth="1" strokeLinecap="round" />

            {/* Magical Green Leaf on Head (🍃 ドロン！) */}
            <g transform="translate(36, 18)">
              <path d="M0,0 C-6,-8 6,-10 0,-1 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
              <line x1="0" y1="0" x2="0" y2="-6" stroke="#15803D" strokeWidth="0.8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 8. INTERACTIVE MASCOT WALK LANE (すべての仲間を選べるさんぽ道)
// ============================================================================
export type MascotType = 'baku' | 'hitsuji' | 'tsukisama' | 'usagi' | 'neko' | 'capybara' | 'tanuki';

export const MascotWalkLane: React.FC<{
  onRecordClick?: () => void;
  className?: string;
}> = ({ onRecordClick, className = '' }) => {
  const [selectedMascot, setSelectedMascot] = useState<MascotType>('baku');

  const mascotList: { id: MascotType; label: string; tag: string }[] = [
    { id: 'baku', label: 'バクくん', tag: '夢喰い' },
    { id: 'hitsuji', label: 'ひつじ', tag: '快眠' },
    { id: 'tsukisama', label: 'お月様', tag: '夜守り' },
    { id: 'usagi', label: 'うさぎ', tag: '夢分析' },
    { id: 'neko', label: '夢ねこ', tag: '採集' },
    { id: 'capybara', label: 'カピバラ', tag: '極楽' },
    { id: 'tanuki', label: 'たぬき', tag: '4コマ' },
  ];

  return (
    <div className={`my-3 p-3 sm:p-4 rounded-3xl bg-linear-to-b from-[#FFFDF9]/95 to-[#F5EEE6]/95 dark:from-[#181E2B]/95 dark:to-[#121622]/95 border-2 border-[#D8C7B5] dark:border-[#2D3748] shadow-md ${className}`}>
      {/* Header bar with character selector */}
      <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#D8C7B5]/80 dark:border-neutral-700">
        <div className="flex items-center space-x-1.5">
          <PawTrailAsset size={16} />
          <span className="font-handwriting font-bold text-xs text-neutral-800 dark:text-neutral-200">
            夢のさんぽ道
          </span>
          <span className="text-[10px] text-neutral-500 font-handwriting">
            （タップしてリアクション♪）
          </span>
        </div>

        {/* Mascot switcher pills */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-none py-0.5">
          {mascotList.map((m) => {
            const isSelected = selectedMascot === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setSelectedMascot(m.id);
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-handwriting font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-amber-400 dark:text-neutral-950 dark:border-amber-400 shadow-xs'
                    : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:bg-white'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage display for the active mascot */}
      <div className="relative h-28 sm:h-32 flex items-center justify-around pt-2">
        <div className="transition-all transform hover:scale-105">
          {selectedMascot === 'baku' && <BakuMascot size="md" isWalking={true} showSpeech={true} />}
          {selectedMascot === 'hitsuji' && <HitsujiMascot size="md" isWalking={true} showSpeech={true} />}
          {selectedMascot === 'tsukisama' && <TsukisamaMascot size="md" isWalking={false} showSpeech={true} />}
          {selectedMascot === 'usagi' && <UsagiMascot size="md" isWalking={true} showSpeech={true} />}
          {selectedMascot === 'neko' && <NekoMascot size="md" isWalking={true} showSpeech={true} />}
          {selectedMascot === 'capybara' && <CapybaraMascot size="md" isWalking={false} showSpeech={true} />}
          {selectedMascot === 'tanuki' && <TanukiMascot size="md" isWalking={true} showSpeech={true} />}
        </div>
      </div>

      {/* Playful prompt banner */}
      {onRecordClick && (
        <div className="mt-1 pt-2 border-t border-dashed border-neutral-300/80 dark:border-neutral-700 flex items-center justify-between">
          <span className="text-[11px] font-handwriting text-neutral-700 dark:text-neutral-300 flex items-center space-x-1">
            <SparkleAsset size={14} />
            <span>「起きたての一言、マスコット達が待ってるよ！」</span>
          </span>
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onRecordClick();
            }}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-handwriting font-bold text-xs rounded-xl border-1.5 border-neutral-900 shadow-[2px_2px_0px_rgba(0,0,0,0.85)] cursor-pointer flex items-center space-x-1 active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>夢を録音する</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 9. MASCOT RECORDING LISTENER BADGE
// ============================================================================
export const MascotListeningBadge: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 my-2 bg-indigo-50/90 dark:bg-indigo-950/40 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-sm">
      <div className="flex items-center space-x-3">
        <BakuMascot size="sm" isWalking={isRecording} showSpeech={false} interactive={false} />
        <div>
          <div className="font-handwriting text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
            <SparkleAsset size={14} />
            <span>{isRecording ? 'バクくんが夢の声を採集中…' : 'マイクを押して話しかけてね'}</span>
          </div>
          <p className="font-handwriting text-[10px] sm:text-xs text-indigo-700/80 dark:text-indigo-300/70">
            {isRecording ? '「もぐもぐ… いい夢のにおいがするよ♪」' : '「まとまっていなくてOK！思い出した順でどうぞ」'}
          </p>
        </div>
      </div>
    </div>
  );
};
