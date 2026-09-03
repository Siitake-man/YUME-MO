import React from 'react';
import { Bell, Palette } from 'lucide-react';
import { AppSettings } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { TsukisamaMascot } from './DreamMascots';
import { SparkleAsset, MoonCrestAsset } from './IllustratedAssets';

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
  let mascotNote = 'バクくんが待ってるよ♪';
  if (hour >= 11 && hour < 17) {
    greeting = 'こんにちは';
    subGreeting = '今朝の夢の余白を、ふり返る。';
    mascotNote = '4コマ漫画できた？';
  } else if (hour >= 17 || hour < 4) {
    greeting = 'こんばんは';
    subGreeting = '明日の朝、覚えているといいですね。';
    mascotNote = 'いい夢みてね Zzz...';
  }

  return (
    <header 
      className="pt-4 pb-3 px-4 border-b transition-colors relative"
      style={{
        backgroundColor: currentStyle.colors.bg,
        borderColor: currentStyle.colors.border,
      }}
    >
      <div className="max-w-lg mx-auto">
        {/* Top brand row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs border border-white/40"
              style={{
                backgroundColor: currentStyle.colors.accentSecondary,
                color: currentStyle.colors.bg,
              }}
            >
              <MoonCrestAsset size={20} />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span 
                  className={`${currentStyle.typography.headingFont} text-xl font-bold tracking-widest`}
                  style={{ color: currentStyle.colors.accentSecondary }}
                >
                  夢のあと
                </span>
                <span 
                  className="text-[10px] font-mono tracking-tighter font-bold uppercase"
                  style={{ color: currentStyle.colors.accent }}
                >
                  Yume no Ato
                </span>
              </div>
              <div className="text-[10px] font-handwriting text-neutral-600 dark:text-neutral-400 -mt-0.5">
                {mascotNote}
              </div>
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

        {/* Date & Subtext + Tsukisama Mascot Avatar */}
        <div className="flex items-center justify-between pt-1">
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

          <div className="flex items-center space-x-2 shrink-0">
            <TsukisamaMascot size="sm" isWalking={false} showSpeech={false} />
            <span 
              className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono border"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <SparkleAsset size={12} className="mr-1" />
              AI記録稼働
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
