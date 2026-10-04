import React, { useState } from 'react';
import { AppSettings } from '../types';
import { 
  Bell, Clock, Shield, Volume2, Mic, Lock, Eye, Trash2, Smartphone, 
  HelpCircle, Sparkles, Check, ChevronRight, Palette, DollarSign, Award, HeartHandshake, Zap, Music, Play,
  Fingerprint, Sliders, Compass, BookOpen
} from 'lucide-react';
import { useUIStyle, UI_STYLES, UIStyleId } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { AlarmSoundSelector } from './AlarmSoundSelector';
import { CapybaraMascot } from './DreamMascots';
import { SparkleAsset, MoonCrestAsset } from './IllustratedAssets';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onSimulateAlarm: () => void;
  onResetAllData: () => void;
  onOpenVoiceprintModal?: () => void;
  onOpenHelp?: () => void;
  onOpenTour?: () => void;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onSimulateAlarm,
  onResetAllData,
  onOpenVoiceprintModal,
  onOpenHelp,
  onOpenTour,
}) => {
  const { currentStyle, setStyle, openStyleSelector } = useUIStyle();

  const toggleDay = (dayIndex: number) => {
    const nextDays = settings.alarmDays.includes(dayIndex)
      ? settings.alarmDays.filter((d) => d !== dayIndex)
      : [...settings.alarmDays, dayIndex].sort();
    onUpdateSettings({ ...settings, alarmDays: nextDays });
  };

  return (
    <div className="pb-28 w-full max-w-xl md:max-w-2xl mx-auto p-5 space-y-5 animate-in fade-in duration-200">
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
                onClick={() => {
                  audioEngine.playThemeSound(style.id, 'open');
                  setStyle(style.id);
                }}
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

        {/* Theme Sound Effects Settings & Previews */}
        <div 
          className="p-3 rounded-xl border space-y-2 mt-2"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
              <div>
                <span className="text-xs font-bold block">テーマ固有の音響効果（環境音）</span>
                <span className="text-[10px] opacity-70 block">
                  {currentStyle.id === 'washi' && '和紙手帖：和紙をめくる紙擦音・筆のソフトタッチ'}
                  {currentStyle.id === 'midnight' && '星辰天球：水晶オルゴール・星の瞬き音'}
                  {currentStyle.id === 'vintage' && '昭和カセット：カセットヘッド押し込み・磁気テープ音'}
                  {currentStyle.id === 'pastel' && '記憶標本：標本ガラス瓶の共鳴・水滴の響き'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.playThemeSound(currentStyle.id, 'open');
              }}
              className="py-1 px-2.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1 cursor-pointer hover:opacity-90 active:scale-95 shadow-2xs"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
              title="このテーマの音を試聴"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>試聴</span>
            </button>
          </div>
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

      {/* Capybara Relaxation Hot-Spring Card */}
      <div 
        className="rounded-2xl p-3.5 border shadow-xs relative overflow-hidden flex items-center space-x-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="shrink-0">
          <CapybaraMascot size="sm" isWalking={false} showSpeech={false} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-xs" style={{ color: currentStyle.colors.textPrimary }}>
              雲の露天風呂カピバラさん
            </span>
            <span className="text-[10px] opacity-60 font-serif">極楽音響</span>
          </div>
          <p className="font-serif text-[11px] opacity-75 leading-snug">
            「ゆずを頭に乗せてぽかぽか〜。優しい目覚まし音と心地よい音量で、気持ちいい朝を迎えようね」
          </p>
        </div>
      </div>

      {/* Voiceprint Profile & Transcription Accuracy Tuning Card */}
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
              <Fingerprint className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-bold text-sm">声紋プロファイル & 文字起こし高精度化</span>
              <span className="text-[10px] opacity-70 block">声質の学習・重複反復バグ防止・人物名固有名詞辞書</span>
            </div>
          </div>

          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
            settings.voiceprintProfile?.isCalibrated
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-600'
          }`}>
            {settings.voiceprintProfile?.isCalibrated ? '声紋学習済み' : '未学習'}
          </span>
        </div>

        {/* Profile Status Summary */}
        <div 
          className="p-3 rounded-xl border text-xs space-y-2 leading-relaxed"
          style={{
            backgroundColor: currentStyle.colors.bg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="opacity-70 block">推定トーン / ピッチ:</span>
              <span className="font-bold font-mono">
                {settings.voiceprintProfile?.estimatedF0Hz ? `${settings.voiceprintProfile.estimatedF0Hz} Hz` : '未測定'}
                {' '}
                <span className="opacity-75 font-sans font-normal text-[10px]">
                  ({settings.voiceprintProfile?.pitchCategory === 'low' ? '低音' : settings.voiceprintProfile?.pitchCategory === 'high' ? '高音' : '中音域'})
                </span>
              </span>
            </div>
            <div>
              <span className="opacity-70 block">寝起きかすれ声ブースト:</span>
              <span className="font-bold text-emerald-600">
                {settings.voiceprintProfile?.morningVoiceBoost ? '有効' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Keywords preview */}
          <div className="pt-1 border-t border-black/5">
            <span className="text-[10px] opacity-70 block mb-1">登録済みの人物名・キーワード辞書（誤認防止）:</span>
            <div className="flex flex-wrap gap-1">
              {(settings.voiceprintProfile?.frequentKeywords || ['しおちゃん', '水族館', '猫']).map((kw, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Calibration Trigger Button */}
        {onOpenVoiceprintModal && (
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onOpenVoiceprintModal();
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 active:scale-98"
            style={{
              backgroundColor: currentStyle.colors.accent + '15',
              borderColor: currentStyle.colors.accent + '40',
              color: currentStyle.colors.accent,
            }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>声紋測定・固有名詞辞書のチューニング</span>
          </button>
        )}
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

        {/* Detailed Alarm Sound & Custom Voice Selector */}
        <div className="pt-2 border-t" style={{ borderColor: currentStyle.colors.border }}>
          <AlarmSoundSelector
            settings={settings}
            onUpdateSettings={onUpdateSettings}
          />
        </div>

        {/* Test Alarm Simulation Button */}
        <button
          onClick={onSimulateAlarm}
          className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer hover:opacity-90 active:scale-98 shadow-xs"
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

      {/* Guide Tour & Help Section */}
      <div
        className="rounded-2xl p-4 border shadow-xs space-y-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
          <h3 className="text-xs font-bold" style={{ color: currentStyle.colors.textPrimary }}>
            ヘルプ & ガイド
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Compass className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
                <ChevronRight className="w-3 h-3 opacity-50" />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: currentStyle.colors.textPrimary }}>
                  利用ツアー
                </div>
                <div className="text-[10px] opacity-70">
                  5ステップで体験
                </div>
              </div>
            </button>
          )}

          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer shadow-2xs hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <HelpCircle className="w-4 h-4" style={{ color: currentStyle.colors.accentSecondary }} />
                <ChevronRight className="w-3 h-3 opacity-50" />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: currentStyle.colors.textPrimary }}>
                  ヘルプ & FAQ
                </div>
                <div className="text-[10px] opacity-70">
                  使い方・質問集
                </div>
              </div>
            </button>
          )}
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
