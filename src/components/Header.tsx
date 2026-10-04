import React from 'react';
import { Palette, HelpCircle, Bell } from 'lucide-react';
import { AppSettings } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { MoonCrestAsset } from './IllustratedAssets';

interface HeaderProps {
  settings: AppSettings;
  onSimulateAlarm: () => void;
  onOpenHelp?: () => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  settings, 
  onSimulateAlarm,
  onOpenHelp,
  onOpenTour,
}) => {
  const { currentStyle, openStyleSelector } = useUIStyle();

  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <header 
      className="sticky top-0 z-30 px-5 py-3.5 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: currentStyle.colors.navBg,
        borderColor: currentStyle.colors.border,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: currentStyle.colors.accent + '20',
              color: currentStyle.colors.accent,
            }}
          >
            <MoonCrestAsset size={16} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span 
              className={`${currentStyle.typography.headingFont} text-lg font-bold tracking-wider`}
              style={{ color: currentStyle.colors.textPrimary }}
            >
              夢のあと
            </span>
            <span className="text-[11px] font-sans opacity-50 tracking-tight hidden sm:inline">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Zone 2: Primary Actions */}
        <div className="flex items-center space-x-1.5">
          {/* UI Style Selector Trigger */}
          <button
            onClick={openStyleSelector}
            className="flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: currentStyle.colors.cardBg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
            title="装丁・UIスタイルの切替"
          >
            <Palette className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
            <span className="font-medium text-[11px] hidden xs:inline">{currentStyle.badge}</span>
          </button>

          {/* Help & Guide Modal Trigger */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="flex items-center space-x-1 text-xs p-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
              title="ヘルプ & ガイド"
            >
              <HelpCircle className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {/* Next Alarm Trigger Button */}
          <button
            id="header-alarm-demo-btn"
            onClick={onSimulateAlarm}
            className="flex items-center space-x-1 text-xs px-2 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-95"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
            title="起床アラーム動作テスト"
          >
            <Bell className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
            <span className="text-[11px] font-mono tabular-nums opacity-80 hidden sm:inline">
              {settings.alarmTime}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

