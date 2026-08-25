import React from 'react';
import { Sparkles, Bell, Moon, Palette } from 'lucide-react';
import { AppSettings } from '../types';
import { useUIStyle } from '../context/UIStyleContext';

interface HeaderProps {
  settings: AppSettings;
  onSimulateAlarm: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onSimulateAlarm }) => {
  const { currentStyle, openStyleSelector } = useUIStyle();

  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });

  const hour = now.getHours();
  let greeting = 'おはようございます';
  let subGreeting = '消えてしまう前の世界を、声でつかまえる。';
  if (hour >= 11 && hour < 17) {
    greeting = 'こんにちは';
    subGreeting = '今朝の夢の余白を、ふり返る。';
  } else if (hour >= 17 || hour < 4) {
    greeting = 'こんばんは';
    subGreeting = '明日の朝、覚えているといいですね。';
  }

  return (
    <header 
      className="pt-5 pb-3.5 px-4 border-b transition-colors"
      style={{
        backgroundColor: currentStyle.colors.bg,
        borderColor: currentStyle.colors.border,
      }}
    >
      <div className="max-w-lg mx-auto">
        {/* Top brand row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.accentSecondary,
                color: currentStyle.colors.bg,
              }}
            >
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span 
                className={`${currentStyle.typography.headingFont} text-xl font-bold tracking-widest`}
                style={{ color: currentStyle.colors.accentSecondary }}
              >
                夢のあと
              </span>
              <span 
                className="text-[10px] font-mono tracking-tighter ml-1.5 font-bold uppercase"
                style={{ color: currentStyle.colors.accent }}
              >
                Yume no Ato
              </span>
            </div>
          </div>

          {/* Style Selector & Alarm Buttons */}
          <div className="flex items-center space-x-1.5">
            {/* Style Selector Button */}
            <button
              onClick={openStyleSelector}
              className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
              title="UIスタイルの方向性を切り替え"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
              <span className="font-bold text-[11px] hidden xs:inline">{currentStyle.badge}</span>
            </button>

            {/* Alarm Demo Trigger */}
            <button
              id="header-alarm-demo-btn"
              onClick={onSimulateAlarm}
              className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs active:scale-95"
              style={{
                backgroundColor: currentStyle.colors.accent + '15',
                borderColor: currentStyle.colors.accent + '40',
                color: currentStyle.colors.textPrimary,
              }}
              title="起床アラームから夢記録への流れをテスト"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" style={{ color: currentStyle.colors.accent }} />
              <span className="font-medium text-[11px]">朝テスト</span>
            </button>
          </div>
        </div>

        {/* Date & Subtext */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono opacity-70">
              <span>{dateStr}</span>
              <span>•</span>
              <span className="font-medium">
                次回アラーム {settings.alarmTime}
              </span>
            </div>
            <h1 
              className={`${currentStyle.typography.headingFont} text-lg font-bold mt-0.5`}
              style={{ color: currentStyle.colors.textPrimary }}
            >
              {greeting}
            </h1>
            <p 
              className="text-xs mt-0.5 leading-relaxed opacity-75"
              style={{ color: currentStyle.colors.textPrimary }}
            >
              {subGreeting}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span 
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono border"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" style={{ color: currentStyle.colors.accent }} />
              AI記録稼働
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
