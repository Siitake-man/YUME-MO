import React, { useState } from 'react';
import { Smartphone, Apple, Sparkles, Wifi, Battery, Signal, Palette } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';

export type DeviceMode = 'iphone' | 'android' | 'fullscreen';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('iphone');
  const { currentStyle, openStyleSelector } = useUIStyle();

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isDark = currentStyle.id === 'midnight';

  return (
    <div className="min-h-screen bg-[#131728] flex flex-col items-center justify-start sm:py-6 sm:px-4">
      {/* Top Device Switcher Toolbar */}
      <div className="hidden sm:flex items-center space-x-2 mb-4 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs text-white border border-white/15 shadow-lg">
        <span className="text-[11px] text-[#BDB1D5] font-mono mr-1">スマホ表示:</span>
        <button
          onClick={() => setDeviceMode('iphone')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            deviceMode === 'iphone'
              ? 'bg-[#D2725E] text-white shadow-xs'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>iPhone</span>
        </button>

        <button
          onClick={() => setDeviceMode('android')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            deviceMode === 'android'
              ? 'bg-[#B3C0AA] text-[#252D4B] font-bold shadow-xs'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android</span>
        </button>

        <button
          onClick={() => setDeviceMode('fullscreen')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            deviceMode === 'fullscreen'
              ? 'bg-[#252D4B] text-white border border-white/30'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span>全画面</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {/* Style Selector Trigger on Desktop Bar */}
        <button
          onClick={openStyleSelector}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer shadow-xs"
        >
          <Palette className="w-3.5 h-3.5 text-[#D2725E]" />
          <span>UIスタイル候補（{currentStyle.badge}）</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative ${
          deviceMode === 'fullscreen'
            ? 'max-w-md min-h-screen shadow-2xl'
            : deviceMode === 'iphone'
            ? 'max-w-[420px] min-h-[860px] sm:rounded-[48px] shadow-2xl border-0 sm:border-[10px] sm:border-[#22283d] overflow-hidden'
            : 'max-w-[420px] min-h-[860px] sm:rounded-[36px] shadow-2xl border-0 sm:border-[8px] sm:border-[#2a314d] overflow-hidden'
        }`}
        style={{
          backgroundColor: currentStyle.colors.bg,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* iOS / Android Status Bar */}
        <div 
          className="w-full px-6 pt-3 pb-1 flex items-center justify-between text-xs font-mono select-none border-b transition-colors"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
            color: currentStyle.colors.textPrimary,
          }}
        >
          <span className="font-bold">{timeStr}</span>

          {/* Notch or Camera punchhole for phone realism */}
          {deviceMode === 'iphone' ? (
            <div className="hidden sm:block w-24 h-4 bg-black/80 rounded-full mx-auto" />
          ) : deviceMode === 'android' ? (
            <div className="hidden sm:block w-3.5 h-3.5 bg-black/80 rounded-full mx-auto" />
          ) : null}

          <div className="flex items-center space-x-1.5 opacity-80">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* The App Viewport */}
        <div 
          className="min-h-[800px] flex flex-col transition-colors duration-200"
          style={{
            backgroundColor: currentStyle.colors.bg,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
