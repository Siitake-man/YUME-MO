import React, { useState } from 'react';
import { Mic, Feather, Sparkles, Bell, ArrowRight, CornerDownLeft, Disc, Heart } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { AppSettings } from '../types';
import { StorybookDecorations, CelestialDecorations } from './Decorations';
import { audioEngine } from '../utils/audioEngine';
import { RetroAnimeBoombox } from './RetroAnimeBoombox';
import { BakuMascot, HitsujiMascot, NekoMascot, MascotType } from './DreamMascots';

interface MorningJournalDeskProps {
  settings: AppSettings;
  onOpenVoiceRecord: () => void;
  onSubmitPenNote: (text: string) => void;
  onSelectSamplePreset: (text: string, durationSec: number) => void;
  onOpenAlarmModal: () => void;
}

const PRESET_SPECIMENS = [
  {
    num: '壱',
    title: '巨大水槽とイルカ',
    text: 'しおちゃんと水族館に行って、新しい巨大水槽を見ました。青い光の中でイルカがゆっくり泳いでいて、とても綺麗でいい夢を見ました。',
    tag: '水族館 · イルカ · 静寂',
  },
  {
    num: '弐',
    title: '猫部長とラーメン会議',
    text: '会社のオフィスがなぜか豪華客船になってて、部長が茶トラ猫になってた。会議室でラーメンのトッピング一覧のスライドでプレゼンしてて、「メンマ増量こそが今期のコア戦略ニャ」って言ってて、みんな真面目にメモ取ってそのまま太平洋に出航した。',
    tag: '茶トラ猫 · 客船 · 航海',
  },
  {
    num: '参',
    title: '雲の上の珈琲店',
    text: '巨大なマグカップに乗って朝の空を飛んでた。雲をスプーンですくって食べたら綿あめの味で、空の上にある木造の喫茶店で誰かがピアノを弾いてた。',
    tag: '空中喫茶 · 雲スプーン · ピアノ',
  },
  {
    num: '肆',
    title: '深夜コンビニと大根店員',
    text: '深夜のコンビニに入ったら店員がおでんの大根で、レジで「自分を温めてください」って言われた。店から出たらコンビニ全体がゆっくり夜空に浮上して、星の間を飛んで宇宙に行った。',
    tag: '深夜コンビニ · おでん · 浮遊',
  },
];

const QUICK_FRAGMENTS = [
  '海辺の駅舎', '空を飛ぶ路面電車', '昔の学校の廊下', 
  '言葉を話す猫', '金色の雨', '旧知の友人', '階段の迷路'
];

export const MorningJournalDesk: React.FC<MorningJournalDeskProps> = ({
  settings,
  onOpenVoiceRecord,
  onSubmitPenNote,
  onSelectSamplePreset,
  onOpenAlarmModal,
}) => {
  const { currentStyle } = useUIStyle();
  const [activeMode, setActiveMode] = useState<'voice' | 'pen' | 'specimens'>('voice');
  const [penText, setPenText] = useState<string>('');
  const [selectedCompanion, setSelectedCompanion] = useState<'baku' | 'hitsuji' | 'neko'>('baku');

  const now = new Date();
  const dateFormatted = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  const handleAppendFragment = (frag: string) => {
    audioEngine.playMechanicalClick('low');
    setPenText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}、${frag}` : frag;
    });
  };

  const handlePenSubmit = () => {
    if (!penText.trim()) return;
    audioEngine.playMechanicalClick('high');
    onSubmitPenNote(penText.trim());
    setPenText('');
  };

  return (
    <div 
      className="rounded-3xl border shadow-sm transition-all overflow-hidden relative"
      style={{
        backgroundColor: currentStyle.colors.cardBg,
        borderColor: currentStyle.colors.border,
      }}
    >
      {/* Visual Accent per style */}
      {currentStyle.id === 'washi' && (
        <div className="absolute top-0 right-6 pointer-events-none -mt-1 scale-90 z-20">
          <StorybookDecorations.WashiTape />
        </div>
      )}
      {currentStyle.id === 'midnight' && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <CelestialDecorations.TarotCorner position="top-right" />
        </div>
      )}

      {/* Top Bar of the Desk: Date, Atmosphere, Next Alarm */}
      <div 
        className="px-5 py-3.5 border-b flex items-center justify-between text-xs"
        style={{ borderColor: currentStyle.colors.border }}
      >
        <div className="flex items-center space-x-2">
          <StorybookDecorations.StampHanko text="夢記" subtext="朝" />
          <div className="leading-tight">
            <span className={`${currentStyle.typography.headingFont} font-semibold block`} style={{ color: currentStyle.colors.textPrimary }}>
              朝の筆録机
            </span>
            <span className="text-[11px] opacity-60 font-mono">
              {dateFormatted} · 晨明の刻
            </span>
          </div>
        </div>

        {/* Alarm Indication */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('high');
              onOpenAlarmModal();
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
            title="起床時の夢キャッチアラームを試す"
          >
            <Bell className="w-3 h-3 text-current" style={{ color: currentStyle.colors.accent }} />
            <span className="font-mono tabular-nums">{settings.alarmTime} 待機中</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div 
        className="px-5 pt-3 pb-1 flex items-center justify-between border-b border-black/5 dark:border-white/5"
      >
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-black/5 dark:bg-white/5">
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              setActiveMode('voice');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
              activeMode === 'voice' ? 'bg-white dark:bg-slate-800 shadow-xs font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: activeMode === 'voice' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
            }}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>声で吹き込む</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              setActiveMode('pen');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
              activeMode === 'pen' ? 'bg-white dark:bg-slate-800 shadow-xs font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: activeMode === 'pen' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
            }}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>万年筆で手記</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              setActiveMode('specimens');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer ${
              activeMode === 'specimens' ? 'bg-white dark:bg-slate-800 shadow-xs font-bold' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              color: activeMode === 'specimens' ? currentStyle.colors.accent : currentStyle.colors.textPrimary,
            }}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>採集見本</span>
          </button>
        </div>

        <span className="text-[11px] opacity-50 font-serif hidden xs:inline">
          {activeMode === 'voice' ? '肉声から文字起こし' : activeMode === 'pen' ? '手書き罫線メモ' : '試聴用スライド'}
        </span>
      </div>

      {/* Mode Body Content */}
      <div className="p-5">
        {activeMode === 'voice' && (
          <div className="py-2 flex flex-col items-center justify-center space-y-4 text-center">
            {/* Beloved Baku-kun / Companion Presence */}
            <div className="flex flex-col items-center justify-center">
              {selectedCompanion === 'baku' && (
                <BakuMascot 
                  size="md" 
                  isWalking={true} 
                  showSpeech={true} 
                  onTap={() => audioEngine.playThemeSound(currentStyle.id, 'action')} 
                />
              )}
              {selectedCompanion === 'hitsuji' && (
                <HitsujiMascot 
                  size="md" 
                  isWalking={true} 
                  showSpeech={true} 
                  onTap={() => audioEngine.playThemeSound(currentStyle.id, 'action')} 
                />
              )}
              {selectedCompanion === 'neko' && (
                <NekoMascot 
                  size="md" 
                  isWalking={true} 
                  showSpeech={true} 
                  onTap={() => audioEngine.playThemeSound(currentStyle.id, 'action')} 
                />
              )}

              {/* Sweet companion switcher */}
              <div className="mt-1 flex items-center space-x-1.5 text-[11px] opacity-70">
                <span className="font-serif text-[10px]">相棒:</span>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playMechanicalClick('low');
                    setSelectedCompanion('baku');
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-serif transition-all cursor-pointer ${
                    selectedCompanion === 'baku' ? 'font-bold border-current bg-black/5 dark:bg-white/10' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  バクくん
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playMechanicalClick('low');
                    setSelectedCompanion('hitsuji');
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-serif transition-all cursor-pointer ${
                    selectedCompanion === 'hitsuji' ? 'font-bold border-current bg-black/5 dark:bg-white/10' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  メェちゃん
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.playMechanicalClick('low');
                    setSelectedCompanion('neko');
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10px] font-serif transition-all cursor-pointer ${
                    selectedCompanion === 'neko' ? 'font-bold border-current bg-black/5 dark:bg-white/10' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  夢ねこ
                </button>
              </div>
            </div>

            {currentStyle.id === 'vintage' ? (
              <div className="w-full">
                <RetroAnimeBoombox
                  isRecording={false}
                  onRecordToggle={onOpenVoiceRecord}
                />
              </div>
            ) : (
              <>
                <div className="space-y-1 max-w-sm">
                  <h3 className={`${currentStyle.typography.headingFont} text-lg font-bold`} style={{ color: currentStyle.colors.textPrimary }}>
                    目覚めの余韻を、そのまま声に
                  </h3>
                  <p className="text-xs opacity-75 leading-relaxed font-serif">
                    起きた瞬間の断片を呟くだけ。声紋認識がノイズを除き、消えてしまう無意識を文字に定着させます。
                  </p>
                </div>

                {/* Tactile Audio Dial Trigger */}
                <div className="py-1 relative flex items-center justify-center">
                  <div 
                    className="absolute w-28 h-28 rounded-full border border-current/15 animate-ripple pointer-events-none"
                    style={{ borderColor: currentStyle.colors.accent }}
                  />
                  <button
                    id="home-main-record-btn"
                    onClick={() => {
                      audioEngine.playMechanicalClick('high');
                      onOpenVoiceRecord();
                    }}
                    className="w-24 h-24 rounded-full shadow-lg flex flex-col items-center justify-center border-2 transition-all cursor-pointer group active:scale-95 hover:scale-105 animate-breath"
                    style={{
                      backgroundColor: currentStyle.colors.recordBtnBg,
                      borderColor: currentStyle.colors.bg,
                      color: currentStyle.colors.recordBtnText,
                    }}
                    title="夢の音声を吹き込む"
                  >
                    <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold mt-1 font-serif tracking-widest">
                      語り始める
                    </span>
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-[11px] opacity-60 font-serif">
                  <span>または下の「採集見本」から体験できます</span>
                </div>
              </>
            )}
          </div>
        )}

        {activeMode === 'pen' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs opacity-80 font-serif">
                <div className="flex items-center space-x-2">
                  <BakuMascot size="sm" isWalking={false} showSpeech={false} interactive={true} />
                  <span>朝の罫線紙に書き留める（バクくんが見守り中）</span>
                </div>
                <span className="text-[11px] font-mono opacity-60">{penText.length}字</span>
              </div>
              
              {/* Ruled Notebook Paper Area */}
              <div 
                className="rounded-2xl p-4 border relative overflow-hidden shadow-inner ruled-paper"
                style={{
                  backgroundColor: currentStyle.id === 'midnight' ? '#0E131C' : '#FAF7F0',
                  borderColor: currentStyle.colors.border,
                }}
              >
                <textarea
                  value={penText}
                  onChange={(e) => setPenText(e.target.value)}
                  placeholder="覚えている場面、現れた人物、不思議な違和感を数行..."
                  rows={4}
                  className="w-full bg-transparent resize-none focus:outline-none text-xs leading-8 font-serif select-text"
                  style={{
                    color: currentStyle.colors.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Quick Word Fragment Chips */}
            <div className="space-y-1">
              <span className="text-[11px] opacity-60 font-serif block">
                断片タグを補う：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FRAGMENTS.map((frag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendFragment(frag)}
                    className="text-[11px] px-2.5 py-1 rounded-md border font-serif transition-colors hover:border-current cursor-pointer active:scale-95"
                    style={{
                      backgroundColor: currentStyle.colors.bg,
                      borderColor: currentStyle.colors.border,
                      color: currentStyle.colors.textPrimary,
                    }}
                  >
                    +{frag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex justify-end">
              <button
                disabled={!penText.trim()}
                onClick={handlePenSubmit}
                className="px-4 py-2.5 rounded-xl text-xs font-serif font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{
                  backgroundColor: currentStyle.colors.recordBtnBg,
                  color: currentStyle.colors.recordBtnText,
                }}
              >
                <Feather className="w-3.5 h-3.5" />
                <span>この筆録を調律して綴じる</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        )}

        {activeMode === 'specimens' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs opacity-75 font-serif">
              <span>標本スライド（タップして直ちに体験）</span>
              <span className="text-[11px] opacity-60">全4編</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SPECIMENS.map((specimen, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    audioEngine.playMechanicalClick('high');
                    onSelectSamplePreset(specimen.text, 22);
                  }}
                  className="p-3 rounded-xl border transition-all cursor-pointer hover:border-current/40 space-y-1.5 group relative"
                  style={{
                    backgroundColor: currentStyle.colors.bg,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-60">
                    <span className="font-serif">第{specimen.num}標本</span>
                    <span className="font-mono">未明の残響</span>
                  </div>
                  <h4 className={`${currentStyle.typography.headingFont} text-xs font-bold leading-snug group-hover:opacity-80 transition-opacity`}>
                    {specimen.title}
                  </h4>
                  <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                    {specimen.text}
                  </p>
                  <div className="text-[10px] opacity-50 font-serif pt-1 border-t border-black/5 dark:border-white/5">
                    {specimen.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
