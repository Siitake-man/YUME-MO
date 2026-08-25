import React, { useState, useEffect } from 'react';
import { audioEngine } from '../utils/audioEngine';

// ==========================================
// 1. 活版手帖・和紙コラージュ (Washi Storybook Assets)
// ==========================================
export const StorybookDecorations = {
  // Torn paper masking tape with texture
  WashiTape: ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <div 
      className={`h-4.5 w-24 bg-[#EADCC8]/90 shadow-xs transform -rotate-1 border-l-2 border-r-2 border-dashed border-[#b8a791]/60 relative select-none pointer-events-none ${className}`} 
      style={{ 
        clipPath: 'polygon(2% 0%, 98% 2%, 100% 98%, 0% 100%)',
        backgroundImage: 'radial-gradient(#c2b39f 0.5px, transparent 0.5px)',
        backgroundSize: '4px 4px',
        ...style
      }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent opacity-60" />
    </div>
  ),

  // Authentic Japanese Hanko Seal (印泥・角印)
  StampHanko: ({ text = "夢録", subtext = "済" }: { text?: string; subtext?: string }) => (
    <div className="inline-flex flex-col items-center justify-center w-11 h-11 rounded-sm border-2 border-[#A84432] text-[#A84432] font-serif font-black text-[9px] p-0.5 rotate-3 shadow-2xs select-none relative bg-[#FAF7F2]/40">
      <div className="w-full h-full border border-[#A84432]/70 flex flex-col items-center justify-center leading-none p-0.5">
        <span className="tracking-tighter font-bold">{text}</span>
        {subtext && <span className="text-[7px] tracking-widest mt-0.5 opacity-85">[{subtext}]</span>}
      </div>
    </div>
  ),

  // Hand-drawn fountain pen nib
  FeatherPenIcon: ({ className = "w-5 h-5 text-[#A84432]" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current stroke-1.5`}>
      <path d="M19 3L11 11M19 3C17 5 14 6 12 9L4 21L7 20L15 12C18 10 19 7 21 5L19 3Z" />
      <circle cx="11" cy="13" r="1" fill="currentColor" />
      <path d="M4 21L7 17" />
    </svg>
  ),

  // Delicate glass ink bottle sketch
  DreamBottleSketch: ({ className = "w-7 h-9 text-[#635D54]" }: { className?: string }) => (
    <svg viewBox="0 0 40 50" className={`${className} fill-none stroke-current stroke-1.5 opacity-80`}>
      {/* Bottle Neck & Cork */}
      <rect x="14" y="3" width="12" height="5" rx="1" stroke="currentColor" fill="#FAF7F2" />
      <path d="M13 8H27" stroke="currentColor" />
      {/* Body */}
      <path d="M13 8C13 13 8 16 8 23V41C8 45 11 47 20 47C29 47 32 45 32 41V23C32 16 27 13 27 8" stroke="currentColor" />
      {/* Liquid line & star specks */}
      <path d="M10 32 Q 20 28, 30 32" stroke="currentColor" strokeDasharray="2 2" />
      <circle cx="20" cy="38" r="2.5" fill="#A84432" stroke="none" />
      <circle cx="15" cy="39" r="1.2" fill="#2A3A4D" stroke="none" />
      <circle cx="25" cy="36" r="1.5" fill="#A84432" stroke="none" />
    </svg>
  )
};

// ==========================================
// 2. 星辰天球・タロット占星術 (Celestial Astrolabe Assets)
// ==========================================
export const CelestialDecorations = {
  // Rotating brass astrolabe ring
  AstrolabeRing: ({ className = "" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      <svg 
        viewBox="0 0 160 160" 
        className="w-36 h-36 animate-spin text-[#C8A962]/70 fill-none stroke-current stroke-1" 
        style={{ animationDuration: '40s' }}
      >
        <circle cx="80" cy="80" r="76" strokeDasharray="3 3" />
        <circle cx="80" cy="80" r="70" />
        <circle cx="80" cy="80" r="54" strokeDasharray="8 4" />
        <path d="M80 4 L80 156 M4 80 L156 80 M26 26 L134 134 M26 134 L134 26" opacity="0.35" />
        <polygon points="80,12 83,20 80,28 77,20" fill="currentColor" />
        <polygon points="80,132 83,140 80,148 77,140" fill="currentColor" />
        <polygon points="12,80 20,83 28,80 20,77" fill="currentColor" />
        <polygon points="132,80 140,83 148,80 140,77" fill="currentColor" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-20 h-20 rounded-full border border-[#C8A962]/30 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-[#C8A962]/50 flex items-center justify-center">
            <span className="text-[#C8A962] text-[10px] font-serif tracking-widest">✦ ☽ ✦</span>
          </div>
        </div>
      </div>
    </div>
  ),

  // Geometric Tarot Corner Ornament
  TarotCorner: ({ position = "top-left" }: { position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const rotateClass = {
      'top-left': 'rotate-0',
      'top-right': 'rotate-90',
      'bottom-right': 'rotate-180',
      'bottom-left': '-rotate-90',
    }[position];
    return (
      <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 text-[#C8A962]/75 fill-none stroke-current stroke-1.5 ${rotateClass} select-none`}>
        <path d="M2 22 L2 2 L22 2" />
        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
        <path d="M2 9 L9 2" opacity="0.6" />
      </svg>
    );
  },

  // Lunar Phase Wheel
  MoonPhaseIcon: ({ className = "w-4 h-4 text-[#C8A962]" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={`${className} fill-current select-none`}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 0 1 0-16 8 8 0 1 1 0 16z" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 7.07 17.07A8 8 0 0 0 12 4z" />
    </svg>
  )
};

// ==========================================
// 3. 昭和電波カセットレコーダー (Vintage Tape Recorder Assets)
// ==========================================
export const RetroCassetteDecorations = {
  // Realistic Japanese 1980s Cassette Tape Unit
  CassetteTape: ({ 
    isPlaying = false, 
    counter = "02:18", 
    tapeName = "TYPE-II CrO2 / DREAM CH-98",
    onPlayToggle 
  }: { 
    isPlaying?: boolean; 
    counter?: string; 
    tapeName?: string;
    onPlayToggle?: () => void;
  }) => {
    const [tapeProgress, setTapeProgress] = useState(35); // 0-100%

    useEffect(() => {
      let interval: any;
      if (isPlaying) {
        interval = setInterval(() => {
          setTapeProgress(prev => (prev >= 95 ? 10 : prev + 1));
        }, 800);
      }
      return () => clearInterval(interval);
    }, [isPlaying]);

    return (
      <div className="w-full bg-[#1A1E27] rounded-xl p-3.5 border-2 border-[#2D3646] shadow-xl text-[#E2E7EE] font-mono text-xs relative overflow-hidden select-none">
        {/* Cassette Top Header with Screws */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#2D3646] text-[10px]">
          <div className="flex items-center space-x-1 text-[#D97706] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span>ANALOG TAPE DECK</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${isPlaying ? 'bg-[#DC2626] text-white animate-pulse' : 'bg-[#2D3646] text-[#8D9AA8]'}`}>
              {isPlaying ? '● REC / PLAY' : '■ STOPPED'}
            </span>
            <span className="font-mono text-[#E2E7EE] bg-[#0E1117] px-1.5 py-0.5 rounded border border-[#2D3646]">
              {counter}
            </span>
          </div>
        </div>

        {/* Cassette Shell & Tape Window */}
        <div className="my-2 bg-[#12151C] rounded-lg p-2 border border-[#2D3646] relative">
          {/* Cassette Label Strip */}
          <div className="bg-[#242C3A] text-[#D97706] px-2.5 py-1 rounded text-[10px] flex items-center justify-between font-bold border-b border-[#364357]">
            <span className="truncate">{tapeName}</span>
            <span className="text-[#8D9AA8] text-[9px] font-normal">HIGH BIAS 70μs</span>
          </div>

          {/* Transparent Acrylic Window with Moving Reels */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#080A0E] rounded-md my-1.5 border border-[#232B3A] relative">
            {/* Left Reel (Spooling out) */}
            <div className="flex flex-col items-center">
              <div className="relative w-11 h-11 flex items-center justify-center">
                {/* Spooled tape thickness circle */}
                <div 
                  className="absolute rounded-full bg-[#3D291D] transition-all duration-500" 
                  style={{ width: `${40 - tapeProgress * 0.2}px`, height: `${40 - tapeProgress * 0.2}px` }} 
                />
                {/* Reel Hub with 5-tooth gear */}
                <div 
                  className={`relative z-10 w-8 h-8 rounded-full border-2 border-[#D97706] bg-[#12151C] flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '2.5s' }}
                >
                  <div className="w-2.5 h-2.5 bg-[#D97706] rounded-xs" />
                  <div className="absolute w-1 h-7 bg-[#D97706]/40" />
                  <div className="absolute w-7 h-1 bg-[#D97706]/40" />
                </div>
              </div>
            </div>

            {/* Tape bridge / window ruler center */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-1.5 bg-[#1A1E27] rounded-full overflow-hidden border border-[#2D3646]">
                <div 
                  className="h-full bg-[#D97706] rounded-full transition-all duration-300"
                  style={{ width: `${tapeProgress}%` }}
                />
              </div>
              <span className="text-[8px] text-[#8D9AA8] tracking-widest font-mono">100 • 50 • 0</span>
            </div>

            {/* Right Reel (Spooling in) */}
            <div className="flex flex-col items-center">
              <div className="relative w-11 h-11 flex items-center justify-center">
                {/* Spooled tape thickness circle */}
                <div 
                  className="absolute rounded-full bg-[#3D291D] transition-all duration-500" 
                  style={{ width: `${20 + tapeProgress * 0.2}px`, height: `${20 + tapeProgress * 0.2}px` }} 
                />
                {/* Reel Hub */}
                <div 
                  className={`relative z-10 w-8 h-8 rounded-full border-2 border-[#D97706] bg-[#12151C] flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '2.5s' }}
                >
                  <div className="w-2.5 h-2.5 bg-[#D97706] rounded-xs" />
                  <div className="absolute w-1 h-7 bg-[#D97706]/40" />
                  <div className="absolute w-7 h-1 bg-[#D97706]/40" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analog VU Meter and LED Peak Bar */}
        <div className="flex items-center justify-between pt-1 text-[9px] text-[#8D9AA8]">
          <div className="flex items-center space-x-1.5 flex-1 pr-2">
            <span className="font-bold text-[#E2E7EE]">VU:</span>
            <div className="flex-1 flex space-x-0.5 h-2 bg-[#0E1117] p-0.5 rounded border border-[#2D3646]">
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#16A34A]' : 'bg-[#16A34A]/20'}`} />
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#16A34A]' : 'bg-[#16A34A]/20'}`} />
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#16A34A]' : 'bg-[#16A34A]/20'}`} />
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#D97706]' : 'bg-[#D97706]/20'}`} />
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#D97706]' : 'bg-[#D97706]/20'}`} />
              <div className={`w-2.5 h-full rounded-2xs ${isPlaying ? 'bg-[#DC2626] animate-pulse' : 'bg-[#DC2626]/20'}`} />
            </div>
          </div>

          <span className="font-mono text-[#D97706] font-bold">STEREO 44.1kHz</span>
        </div>
      </div>
    );
  },

  // Dual needle VU Meter Display
  VUMeterDial: ({ level = 65 }: { level?: number }) => (
    <div className="w-16 h-8 bg-[#101319] border border-[#2D3646] rounded p-1 flex flex-col justify-between select-none">
      <div className="flex justify-between text-[7px] text-[#8D9AA8] font-mono leading-none">
        <span>-20</span>
        <span>0</span>
        <span className="text-[#DC2626]">+3</span>
      </div>
      {/* Needle scale arc */}
      <div className="relative h-3 w-full border-b border-[#364153]">
        <div 
          className="absolute bottom-0 left-1/2 w-0.5 h-3.5 bg-[#D97706] origin-bottom transition-transform duration-100"
          style={{ transform: `rotate(${(level - 50) * 0.8}deg)` }}
        />
      </div>
    </div>
  ),

  // Tactile Mechanical Push Keys
  PianoKeyRow: ({ 
    activeKey, 
    onKeyClick 
  }: { 
    activeKey?: string; 
    onKeyClick?: (key: string) => void; 
  }) => {
    const keys = [
      { id: 'rec', label: '● REC', color: 'text-[#DC2626]' },
      { id: 'play', label: '▶ PLAY', color: 'text-[#16A34A]' },
      { id: 'rew', label: '◀◀ REW', color: 'text-[#E2E7EE]' },
      { id: 'ff', label: '▶▶ FF', color: 'text-[#E2E7EE]' },
      { id: 'stop', label: '■ STOP', color: 'text-[#8D9AA8]' },
    ];

    return (
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-[#101319] rounded-lg border border-[#2D3646]">
        {keys.map(k => {
          const isPressed = activeKey === k.id;
          return (
            <button
              key={k.id}
              onClick={() => {
                audioEngine.playMechanicalClick(k.id === 'rec' ? 'high' : 'low');
                onKeyClick?.(k.id);
              }}
              className={`py-2 rounded font-mono text-[9px] font-bold border transition-all cursor-pointer select-none flex items-center justify-center ${
                isPressed
                  ? 'bg-[#2A3444] translate-y-0.5 border-[#D97706] shadow-inner'
                  : 'bg-[#1D2430] border-[#2D3646] hover:bg-[#252E3E] active:translate-y-0.5 shadow-xs'
              } ${k.color}`}
            >
              {k.label}
            </button>
          );
        })}
      </div>
    );
  }
};

// ==========================================
// 4. 記憶標本・博物誌アーカイブ (Museum Specimen Archive Assets)
// ==========================================
export const GlassSpecimenDecorations = {
  // Scientific Museum Specimen Label
  SpecimenLabel: ({ id = "SPEC-084", name = "記憶の結晶" }: { id?: string; name?: string }) => (
    <div className="inline-flex items-center space-x-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-sm border border-[#CBD5E1] shadow-2xs text-[10px] text-[#334155] select-none font-sans">
      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
      <span className="font-mono font-bold text-[#64748B]">{id}</span>
      <span>•</span>
      <span className="font-medium text-[#1E293B]">{name}</span>
    </div>
  ),

  // Museum Glass Bell Jar outline
  GlassSpecimenVial: ({ className = "w-6 h-8 text-[#0D9488]" }: { className?: string }) => (
    <svg viewBox="0 0 24 32" className={`${className} fill-none stroke-current stroke-1.5 select-none`}>
      <path d="M8 2h8v3H8z" />
      <path d="M6 5h12v20a6 6 0 0 1-12 0V5z" />
      <circle cx="12" cy="18" r="2.5" fill="currentColor" stroke="none" opacity="0.8" />
      <path d="M9 10h1.5M9 14h1.5M9 18h1.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),

  // Floating specimen bubble orb
  FloatingOrb: ({ className = "w-16 h-16" }: { className?: string }) => (
    <div className={`relative ${className} rounded-full bg-linear-to-tr from-[#0D9488]/10 via-[#0D9488]/5 to-transparent border border-[#0D9488]/20 flex items-center justify-center`}>
      <div className="w-8 h-8 rounded-full bg-white/40 border border-white/60 shadow-inner" />
      <div className="absolute top-2 right-3 w-2 h-2 rounded-full bg-white" />
    </div>
  )
};
