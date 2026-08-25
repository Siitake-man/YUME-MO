import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Bell, Clock, Shield, Volume2, Mic, Lock, Eye, Trash2, Smartphone, 
  HelpCircle, Sparkles, Check, ChevronRight, Palette, DollarSign, Award, HeartHandshake, Zap
} from 'lucide-react';
import { useUIStyle, UI_STYLES, UIStyleId } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onSimulateAlarm: () => void;
  onResetAllData: () => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onSimulateAlarm,
  onResetAllData,
}) => {
  const { currentStyle, setStyle, openStyleSelector } = useUIStyle();

  const toggleDay = (dayIndex: number) => {
    const nextDays = settings.alarmDays.includes(dayIndex)
      ? settings.alarmDays.filter((d) => d !== dayIndex)
      : [...settings.alarmDays, dayIndex].sort();
    onUpdateSettings({ ...settings, alarmDays: nextDays });
  };

  return (
    <div className="pb-28 max-w-lg mx-auto p-4 space-y-4 animate-in fade-in duration-200">
      {/* Settings Header */}
      <div className="space-y-1">
        <h2 
          className={`${currentStyle.typography.headingFont} text-xl font-bold`}
          style={{ color: currentStyle.colors.accentSecondary }}
        >
          設定 & カスタマイズ
        </h2>
        <p className="text-xs opacity-70 leading-relaxed">
          UIデザインの方向性、アラーム、プライバシー設定
        </p>
      </div>

      {/* UI Style Direction Candidates Card */}
      <div 
        className="rounded-2xl p-4 border shadow-xs space-y-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentStyle.colors.accent + '20',
                color: currentStyle.colors.accent,
              }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm">UIスタイルの方向性（4候補）</span>
              <span className="text-[10px] opacity-70 block">タップして即座にデザイン切り替え</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {(Object.keys(UI_STYLES) as UIStyleId[]).map((key) => {
            const style = UI_STYLES[key];
            const isSelected = currentStyle.id === style.id;

            return (
              <button
                key={style.id}
                onClick={() => setStyle(style.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected ? 'ring-2 shadow-sm font-bold' : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: style.colors.bg,
                  borderColor: isSelected ? style.colors.accent : style.colors.border,
                  color: style.colors.textPrimary,
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">{style.name.split('. ')[1]}</span>
                  {isSelected ? (
                    <span 
                      className="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
                      style={{
                        backgroundColor: style.colors.accent,
                        color: style.colors.recordBtnText || '#fff',
                      }}
                    >
                      選択中
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] opacity-75 line-clamp-2 leading-tight">
                  {style.subtitle}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: style.colors.bg }} />
                  <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: style.colors.cardBg }} />
                  <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: style.colors.accent }} />
                  <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: style.colors.accentSecondary }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscription Plan & Ad Revenue Settings */}
      <div 
        className="rounded-2xl p-4 border shadow-xs space-y-3.5 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentStyle.colors.accentSecondary + '15',
                color: currentStyle.colors.accentSecondary,
              }}
            >
              <HeartHandshake className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
            </div>
            <div>
              <span className="font-bold text-sm">ご利用プラン & 広告表示設定</span>
              <span className="text-[10px] opacity-70 block">AI解析費用の相殺と収益モデルの設計</span>
            </div>
          </div>
        </div>

        {/* Plan Switcher */}
        <div className="grid grid-cols-2 gap-2">
          {/* Free Plan */}
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onUpdateSettings({ ...settings, isPremiumUser: false, showSponsorCards: true });
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              !settings.isPremiumUser ? 'ring-2 shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: !settings.isPremiumUser ? currentStyle.colors.bg : 'transparent',
              borderColor: !settings.isPremiumUser ? currentStyle.colors.accent : currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">無料プラン</span>
              {!settings.isPremiumUser && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-green-500/15 text-green-700">
                  現在選択中
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-75 leading-tight">
              和紙・標本調の非侵襲スポンサー枠あり（AI費用を広告で相殺）
            </p>
            <div className="mt-2 text-[10px] font-mono font-bold opacity-60">
              ¥0 / 月
            </div>
          </button>

          {/* Premium Supporter */}
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onUpdateSettings({ ...settings, isPremiumUser: true, showSponsorCards: false });
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
              settings.isPremiumUser ? 'ring-2 shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: settings.isPremiumUser ? currentStyle.colors.bg : 'transparent',
              borderColor: settings.isPremiumUser ? currentStyle.colors.accent : currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                サポーター
              </span>
              {settings.isPremiumUser && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/15 text-amber-700">
                  現在選択中
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-75 leading-tight">
              完全広告非表示 + 高画質シネマ生成 + 無制限アーカイブ
            </p>
            <div className="mt-2 text-[10px] font-mono font-bold" style={{ color: currentStyle.colors.accent }}>
              ¥380 / 月
            </div>
          </button>
        </div>

        {/* Sponsor Card Display Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-bold block">
              朝の協賛・標本カードの表示（ネイティブ広告）
            </span>
            <span className="text-[10px] opacity-70">
              世界観を崩さない睡眠・珈琲関連の上品な標本枠
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, showSponsorCards: !settings.showSponsorCards })}
            className="w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: settings.showSponsorCards ? currentStyle.colors.accentSecondary : '#CBD5E1',
            }}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.showSponsorCards ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Revenue Offset Balance breakdown note */}
        <div 
          className="p-3 rounded-xl border text-[11px] space-y-1.5 leading-relaxed"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center justify-between font-bold" style={{ color: currentStyle.colors.textPrimary }}>
            <span className="flex items-center">
              <Zap className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
              1人あたりの収支シミュレーション
            </span>
            <span className="text-green-600 font-mono">+約 0.07〜0.15円 / 回 (黒字化)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] opacity-75 font-mono">
            <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
              <span>AI費用 (Gemini Flash):</span>
              <span className="block font-bold text-red-500">-約 0.05 円 / 回</span>
            </div>
            <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5">
              <span>協賛広告 (CPM 200円換算):</span>
              <span className="block font-bold text-green-600">+約 0.12〜0.20 円 / 表示</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alarm Settings Group */}
      <div 
        className="rounded-2xl p-4 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentStyle.colors.accentSecondary + '15',
                color: currentStyle.colors.accentSecondary,
              }}
            >
              <Bell className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
            </div>
            <span className="font-bold text-sm">
              起床アラーム設定
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, alarmEnabled: !settings.alarmEnabled })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              settings.alarmEnabled ? 'bg-[#252D4B]' : 'bg-gray-400'
            }`}
            style={{
              backgroundColor: settings.alarmEnabled ? currentStyle.colors.accentSecondary : undefined,
            }}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.alarmEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Time Picker */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium opacity-80 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" style={{ color: currentStyle.colors.accent }} />
            アラーム時刻
          </label>
          <input
            type="time"
            value={settings.alarmTime}
            onChange={(e) => onUpdateSettings({ ...settings, alarmTime: e.target.value })}
            className="px-3 py-1.5 rounded-xl border text-base font-mono font-bold focus:outline-none"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          />
        </div>

        {/* Day Selectors */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium opacity-80 block">
            繰り返し曜日
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day, idx) => {
              const isSelected = settings.alarmDays.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected ? 'shadow-2xs' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? currentStyle.colors.accentSecondary : currentStyle.colors.bg,
                    color: isSelected ? '#FFFFFF' : currentStyle.colors.textPrimary,
                    border: `1px solid ${currentStyle.colors.border}`,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto open recorder toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-bold block">
              アラーム停止後、即座に夢記録を開く
            </span>
            <span className="text-[10px] opacity-70">
              寝起き30秒の記憶を逃さないおすすめ設定
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, autoOpenOnAlarm: !settings.autoOpenOnAlarm })}
            className="w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: settings.autoOpenOnAlarm ? currentStyle.colors.accentSecondary : '#CBD5E1',
            }}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.autoOpenOnAlarm ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Test Alarm Simulation Button */}
        <button
          onClick={onSimulateAlarm}
          className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer hover:opacity-90 active:scale-98"
          style={{
            backgroundColor: currentStyle.colors.accent + '15',
            borderColor: currentStyle.colors.accent + '40',
            color: currentStyle.colors.textPrimary,
          }}
        >
          <Bell className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
          <span>朝の目覚まし＆夢記録フローを体験テスト</span>
        </button>
      </div>

      {/* Privacy and Data Management */}
      <div 
        className="rounded-2xl p-4 border shadow-xs space-y-4 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center space-x-2 pb-2 border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: currentStyle.colors.accent + '20',
              color: currentStyle.colors.accent,
            }}
          >
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">
            データ・プライバシー
          </span>
        </div>

        {/* Default Private Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block">
              保存時の初期状態を非公開にする
            </span>
            <span className="text-[10px] opacity-70">
              あなたの許可なく図鑑やSNSへ公開されることはありません
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, defaultPublic: !settings.defaultPublic })}
            className="w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: !settings.defaultPublic ? currentStyle.colors.accentSecondary : '#CBD5E1',
            }}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                !settings.defaultPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Audio Original Save Policy */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold block">
              音声原本の端末内保存
            </span>
            <span className="text-[10px] opacity-70">
              OFFにすると文字起こし完了後に音声データを自動破棄します
            </span>
          </div>
          <button
            onClick={() => onUpdateSettings({ ...settings, saveAudioOriginal: !settings.saveAudioOriginal })}
            className="w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: settings.saveAudioOriginal ? currentStyle.colors.accentSecondary : '#CBD5E1',
            }}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.saveAudioOriginal ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* AI Disclaimer Notice */}
        <div 
          className="p-3 rounded-xl border text-[11px] leading-relaxed space-y-1"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
            color: currentStyle.colors.textSecondary,
          }}
        >
          <p className="font-bold flex items-center" style={{ color: currentStyle.colors.textPrimary }}>
            <HelpCircle className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
            AIによる夢解釈について
          </p>
          <p>
            本アプリのAI分析およびパラメータ（シュール度等）はエンターテインメント目的の作品化機能です。医療・心理的診断を行うものではありません。
          </p>
        </div>
      </div>

      {/* App Info & Reset */}
      <div 
        className="rounded-2xl p-4 border shadow-xs space-y-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between text-xs opacity-80">
          <span className="font-medium">アプリバージョン</span>
          <span className="font-mono">1.0.0 (4スタイル対応プロトタイプ)</span>
        </div>

        <div className="pt-2 border-t flex justify-end" style={{ borderColor: currentStyle.colors.border }}>
          <button
            onClick={onResetAllData}
            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>すべての記録を初期化する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
