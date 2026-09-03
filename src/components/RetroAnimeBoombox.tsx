import React, { useState, useEffect } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { SparkleAsset } from './IllustratedAssets';

interface RetroAnimeBoomboxProps {
  isRecording?: boolean;
  isPlaying?: boolean;
  onRecordToggle?: () => void;
  onPlayToggle?: () => void;
  className?: string;
  tapeTitle?: string;
}

export const RetroAnimeBoombox: React.FC<RetroAnimeBoomboxProps> = ({
  isRecording = false,
  isPlaying = false,
  onRecordToggle,
  onPlayToggle,
  className = '',
  tapeTitle = 'DREAM ARCHIVE Vol.1',
}) => {
  const [activeKey, setActiveKey] = useState<string>(isRecording ? 'rec' : isPlaying ? 'play' : 'stop');
  const [counter, setCounter] = useState<number>(42);
  const [vuLevel, setVuLevel] = useState<number>(35);

  const isActive = isRecording || isPlaying;

  // Mechanical tape counter ticking and VU meter animation
  useEffect(() => {
    if (!isActive) {
      setVuLevel(20);
      return;
    }
    const interval = setInterval(() => {
      setCounter((prev) => (prev + 1) % 999);
      // Realistic VU meter bounce
      const target = isRecording 
        ? 55 + Math.random() * 35 
        : 45 + Math.random() * 25;
      setVuLevel(target);
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, isRecording]);

  useEffect(() => {
    if (isRecording) setActiveKey('rec');
    else if (isPlaying) setActiveKey('play');
    else setActiveKey('stop');
  }, [isRecording, isPlaying]);

  const handleKeyPress = (key: string) => {
    audioEngine.playMechanicalClick(key === 'rec' ? 'high' : 'low');
    setActiveKey(key);

    if (key === 'rec') {
      onRecordToggle?.();
    } else if (key === 'play') {
      onPlayToggle?.();
    } else if (key === 'stop') {
      if (isRecording) onRecordToggle?.();
      if (isPlaying) onPlayToggle?.();
    } else if (key === 'rew') {
      setCounter((prev) => Math.max(0, prev - 15));
    } else if (key === 'ff') {
      setCounter((prev) => (prev + 15) % 999);
    }
  };

  return (
    <div className={`relative w-full max-w-md mx-auto select-none ${className}`}>
      {/* Carrying Handle on top */}
      <div className="flex justify-center -mb-2 relative z-0">
        <div className="w-48 h-6 rounded-t-xl bg-linear-to-b from-[#7E8B99] to-[#475569] border-2 border-[#1E293B] shadow-sm flex items-center justify-center">
          <div className="w-36 h-2 rounded-full bg-[#1E293B]/40" />
        </div>
      </div>

      {/* Main Boombox Retro Anime Chassis */}
      <div className="relative z-10 rounded-2xl bg-linear-to-b from-[#2E384D] via-[#1F2636] to-[#161B26] border-3 border-[#0F131D] shadow-[0_12px_24px_rgba(0,0,0,0.6)] p-3 sm:p-4 text-white">
        {/* Top Trim: Brand Logo & Backlit Tuning Dial */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#3E4C64]/70">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-black text-xs sm:text-sm tracking-widest text-[#F59E0B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              AIWA-SONIC
            </span>
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#0F131D] text-[#94A3B8] border border-[#334155]">
              STEREO 4-TRACK
            </span>
          </div>

          {/* Glowing Status LEDs */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isRecording 
                    ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E] animate-pulse' 
                    : 'bg-rose-950/80 border border-rose-900/50'
                }`} 
              />
              <span className="text-[9px] font-mono font-bold text-rose-300">REC</span>
            </div>

            <div className="flex items-center space-x-1">
              <span 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' 
                    : 'bg-emerald-950/80 border border-emerald-900/50'
                }`} 
              />
              <span className="text-[9px] font-mono font-bold text-emerald-300">TAPE</span>
            </div>
          </div>
        </div>

        {/* Center Section: Left Speaker + Tape Deck + Right Speaker */}
        <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center py-1">
          {/* Left Speaker Grille */}
          <div className="col-span-3 flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#141923] border border-[#2B3547] aspect-square">
            <div className="w-full h-full rounded-full border-2 border-[#334155] bg-radial from-[#1E293B] to-[#0A0D14] flex items-center justify-center p-2 relative overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-[#D97706]/80 border border-[#F59E0B] shadow-inner" />
              {/* Speaker concentric acoustic ridges */}
              <div className="absolute inset-2 rounded-full border border-dashed border-[#475569]/40 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-[#475569]/30 pointer-events-none" />
            </div>
          </div>

          {/* Center: Cassette Deck Window with Spools */}
          <div className="col-span-6 rounded-xl bg-[#0B0E14] border-2 border-[#3B4861] p-2 relative shadow-inner overflow-hidden">
            {/* Cassette Label Strip */}
            <div className="bg-[#FEF3C7] text-neutral-900 text-[9px] font-mono font-bold px-2 py-0.5 rounded-t flex items-center justify-between border-b border-amber-300">
              <span className="truncate max-w-[130px]">{tapeTitle}</span>
              <span className="text-amber-800">C-60</span>
            </div>

            {/* Clear Cassette Glass Window */}
            <div className="relative bg-[#181F2C]/90 rounded-b p-2 border-t border-[#334155] flex items-center justify-between">
              {/* Left Tape Reel (Source) */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full border-2 border-[#D97706] bg-[#0E131C] flex items-center justify-center shadow-md relative ${
                    isActive ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '2.8s' }}
                >
                  {/* Tape Spool Teeth / Spokes */}
                  <div className="w-3 h-3 bg-[#F59E0B] rounded-xs shadow-inner" />
                  <div className="absolute w-1 h-10 bg-[#D97706]/70 rounded" />
                  <div className="absolute w-10 h-1 bg-[#D97706]/70 rounded" />
                  <div className="absolute w-7 h-7 rounded-full border border-dashed border-amber-400/50" />
                </div>
              </div>

              {/* Center Tape Magnetic Ribbon & Progress Window */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-10 h-3 bg-[#2A1810] border border-[#523223] rounded flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-[#8B5A2B]" />
                </div>
                {/* Mechanical Counter */}
                <div className="mt-1 bg-black text-[#F59E0B] font-mono font-black text-[10px] px-1.5 py-0.2 rounded border border-neutral-700 tracking-wider">
                  {String(counter).padStart(3, '0')}
                </div>
              </div>

              {/* Right Tape Reel (Take-up) */}
              <div className="relative flex flex-col items-center">
                <div 
                  className={`w-12 h-12 rounded-full border-2 border-[#D97706] bg-[#0E131C] flex items-center justify-center shadow-md relative ${
                    isActive ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '2.8s' }}
                >
                  <div className="w-3 h-3 bg-[#F59E0B] rounded-xs shadow-inner" />
                  <div className="absolute w-1 h-10 bg-[#D97706]/70 rounded" />
                  <div className="absolute w-10 h-1 bg-[#D97706]/70 rounded" />
                  <div className="absolute w-7 h-7 rounded-full border border-dashed border-amber-400/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Speaker Grille */}
          <div className="col-span-3 flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#141923] border border-[#2B3547] aspect-square">
            <div className="w-full h-full rounded-full border-2 border-[#334155] bg-radial from-[#1E293B] to-[#0A0D14] flex items-center justify-center p-2 relative overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-[#D97706]/80 border border-[#F59E0B] shadow-inner" />
              <div className="absolute inset-2 rounded-full border border-dashed border-[#475569]/40 pointer-events-none" />
              <div className="absolute inset-4 rounded-full border border-[#475569]/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dual Backlit Analog VU Meter Bar */}
        <div className="mt-2 p-1.5 rounded-xl bg-[#0F131D] border border-[#2B3547] flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 pr-3">
            <span className="font-mono text-[9px] font-bold text-[#F59E0B]">VU METERS</span>
            {/* Dynamic Needle Scale Left */}
            <div className="flex-1 relative h-4 bg-[#182030] rounded border border-[#334155] overflow-hidden flex items-end px-1">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-100 rounded-xs"
                style={{ width: `${Math.min(100, Math.max(8, vuLevel))}%`, opacity: isActive ? 0.9 : 0.25 }}
              />
            </div>
          </div>

          <span className="font-mono text-[9px] text-[#94A3B8]">
            {isRecording ? '● RECORDING LIVE' : isPlaying ? '▶ PLAYING TAPE' : '■ STANDBY'}
          </span>
        </div>

        {/* Piano Push Mechanical Keys Row */}
        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
          <button
            onClick={() => handleKeyPress('rec')}
            className={`py-2 rounded-lg font-mono text-[10px] sm:text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeKey === 'rec'
                ? 'bg-rose-600 text-white border-rose-400 translate-y-1 shadow-inner'
                : 'bg-[#1E2638] text-rose-400 border-[#334155] hover:bg-[#28334A] shadow-md'
            }`}
          >
            <span>●</span>
            <span className="text-[8px] font-sans">録音</span>
          </button>

          <button
            onClick={() => handleKeyPress('play')}
            className={`py-2 rounded-lg font-mono text-[10px] sm:text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeKey === 'play'
                ? 'bg-emerald-600 text-white border-emerald-400 translate-y-1 shadow-inner'
                : 'bg-[#1E2638] text-emerald-400 border-[#334155] hover:bg-[#28334A] shadow-md'
            }`}
          >
            <span>▶</span>
            <span className="text-[8px] font-sans">再生</span>
          </button>

          <button
            onClick={() => handleKeyPress('rew')}
            className="py-2 rounded-lg font-mono text-[10px] sm:text-xs font-bold border bg-[#1E2638] text-[#94A3B8] border-[#334155] hover:bg-[#28334A] active:translate-y-1 shadow-md cursor-pointer flex flex-col items-center justify-center"
          >
            <span>◀◀</span>
            <span className="text-[8px] font-sans">巻戻し</span>
          </button>

          <button
            onClick={() => handleKeyPress('ff')}
            className="py-2 rounded-lg font-mono text-[10px] sm:text-xs font-bold border bg-[#1E2638] text-[#94A3B8] border-[#334155] hover:bg-[#28334A] active:translate-y-1 shadow-md cursor-pointer flex flex-col items-center justify-center"
          >
            <span>▶▶</span>
            <span className="text-[8px] font-sans">早送り</span>
          </button>

          <button
            onClick={() => handleKeyPress('stop')}
            className={`py-2 rounded-lg font-mono text-[10px] sm:text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeKey === 'stop'
                ? 'bg-[#334155] text-white border-[#64748B] translate-y-1 shadow-inner'
                : 'bg-[#1E2638] text-[#E2E8F0] border-[#334155] hover:bg-[#28334A] shadow-md'
            }`}
          >
            <span>■</span>
            <span className="text-[8px] font-sans">停止</span>
          </button>
        </div>
      </div>
    </div>
  );
};
