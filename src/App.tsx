import React, { useState, useEffect } from 'react';
import { DreamRecord, AppSettings, ComicStrip } from './types';
import { SAMPLE_DREAMS, INITIAL_SETTINGS } from './data/sampleDreams';
import { UIStyleProvider, useUIStyle } from './context/UIStyleContext';
import { PhoneFrame } from './components/PhoneFrame';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { VoiceRecordModal } from './components/VoiceRecordModal';
import { DreamEditorModal } from './components/DreamEditorModal';
import { DreamDetailView } from './components/DreamDetailView';
import { ComicGeneratorModal } from './components/ComicGeneratorModal';
import { DreamGalleryView } from './components/DreamGalleryView';
import { DreamAnalyticsView } from './components/DreamAnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AlarmSimulationModal } from './components/AlarmSimulationModal';
import { UIStyleSelectorModal } from './components/UIStyleSelectorModal';
import { audioEngine } from './utils/audioEngine';
import { 
  StorybookDecorations, CelestialDecorations, 
  GlassSpecimenDecorations, RetroCassetteDecorations 
} from './components/Decorations';
import { 
  Mic, BookOpen, Sparkles, Clock, Calendar, ChevronRight, Activity, 
  Eye, EyeOff, Tag, ArrowRight, Bell, Plus, Compass, Palette, Radio
} from 'lucide-react';

function MainAppContent() {
  const { currentStyle, isStyleSelectorOpen, closeStyleSelector, openStyleSelector } = useUIStyle();

  // Local storage state initialization
  const [dreams, setDreams] = useState<DreamRecord[]>(() => {
    const saved = localStorage.getItem('yumenoto_dreams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SAMPLE_DREAMS;
      }
    }
    return SAMPLE_DREAMS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('yumenoto_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedDream, setSelectedDream] = useState<DreamRecord | null>(null);

  // Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [isComicModalOpen, setIsComicModalOpen] = useState<boolean>(false);
  const [comicTargetDream, setComicTargetDream] = useState<DreamRecord | null>(null);

  // Intermediate recording state
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [isAlarmTriggered, setIsAlarmTriggered] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('yumenoto_dreams', JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    localStorage.setItem('yumenoto_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle voice transcription completion
  const handleTranscriptionComplete = (text: string, durationSec: number) => {
    setTranscribedText(text);
    setRecordedDuration(durationSec);
    setIsVoiceModalOpen(false);
    setIsEditorModalOpen(true);
  };

  // Handle saving dream from editor
  const handleSaveDream = (newDream: DreamRecord) => {
    setDreams((prev) => [newDream, ...prev]);
    setIsEditorModalOpen(false);
    setSelectedDream(newDream);
  };

  // Handle comic strip save / update
  const handleSaveComic = (comic: ComicStrip) => {
    if (!comicTargetDream) return;
    const updated = { ...comicTargetDream, comicStrip: comic };
    setDreams((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setComicTargetDream(updated);
    if (selectedDream?.id === updated.id) {
      setSelectedDream(updated);
    }
  };

  // Handle reaction on gallery dream
  const handleReactDream = (
    dreamId: string,
    reactionType: 'moon' | 'surreal' | 'relatable'
  ) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id !== dreamId) return d;
        const currentReactions = d.reactions || { moon: 0, surreal: 0, relatable: 0 };
        const isCurrentActive = d.userReaction === reactionType;

        return {
          ...d,
          userReaction: isCurrentActive ? null : reactionType,
          reactions: {
            ...currentReactions,
            [reactionType]: isCurrentActive
              ? Math.max(0, currentReactions[reactionType] - 1)
              : currentReactions[reactionType] + 1,
          },
        };
      })
    );
  };

  // Toggle public / private
  const handleTogglePublic = (dreamId: string) => {
    setDreams((prev) =>
      prev.map((d) => {
        if (d.id !== dreamId) return d;
        const next = !d.isPublic;
        const updated = { ...d, isPublic: next };
        if (selectedDream?.id === dreamId) {
          setSelectedDream(updated);
        }
        return updated;
      })
    );
  };

  // Delete dream
  const handleDeleteDream = (dreamId: string) => {
    setDreams((prev) => prev.filter((d) => d.id !== dreamId));
    setSelectedDream(null);
  };

  // Reset all data
  const handleResetAllData = () => {
    if (confirm('保存された夢の記録をすべて初期化しますか？')) {
      setDreams(SAMPLE_DREAMS);
      setSettings(INITIAL_SETTINGS);
      setSelectedDream(null);
    }
  };

  // Open Comic Studio
  const handleOpenComicStudio = (dream: DreamRecord) => {
    setComicTargetDream(dream);
    setIsComicModalOpen(true);
  };

  // Render style-specific Hero Recorder Area
  const renderHeroRecorder = () => {
    switch (currentStyle.id) {
      case 'washi':
        return (
          <div 
            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden text-center space-y-4 border transition-all"
            style={{
              background: currentStyle.colors.heroGradient,
              borderColor: currentStyle.colors.border,
            }}
          >
            {/* Washi Masking Tape on Top */}
            <div className="absolute -top-1.5 left-8 pointer-events-none z-20">
              <StorybookDecorations.WashiTape />
            </div>

            {/* Stamp Hanko in corner */}
            <div className="absolute bottom-2 right-2 pointer-events-none opacity-80 z-20">
              <StorybookDecorations.StampHanko text="夢採集" />
            </div>

            <div className="relative z-10 space-y-1 pt-2">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-serif" style={{ color: currentStyle.colors.accent }}>
                <StorybookDecorations.FeatherPenIcon />
                <span className="font-bold ml-1">活版夢草紙・音声録音</span>
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-wide pt-1`}>
                夢を、声でつかまえる
              </h2>
              <p className="text-xs max-w-xs mx-auto leading-relaxed opacity-85">
                起きたらひとこと話すだけ。AIが消える前の世界を綺麗な4コマやカルテに仕立てます。
              </p>
            </div>

            {/* Washi Record Button */}
            <div className="relative z-10 py-2 flex justify-center">
              <button
                id="home-main-record-btn"
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-24 h-24 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white/30 transition-all cursor-pointer group active:scale-95 hover:scale-105"
                style={{
                  backgroundColor: currentStyle.colors.recordBtnBg,
                  color: currentStyle.colors.recordBtnText,
                }}
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 font-serif">夢を語る</span>
              </button>
            </div>

            {/* Subtle bottom note */}
            <div className="relative z-10 inline-flex items-center text-[11px] bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 mr-1.5" style={{ color: currentStyle.colors.accent }} />
              <span>「まとまっていなくてOK」断片的な一言を歓迎</span>
            </div>
          </div>
        );

      case 'midnight':
        return (
          <div 
            className="rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden text-center space-y-4 border transition-all"
            style={{
              background: currentStyle.colors.heroGradient,
              borderColor: '#C8A962',
              boxShadow: '0 0 25px rgba(200, 169, 98, 0.15)',
            }}
          >
            {/* Gold Tarot Corners */}
            <div className="absolute top-2 left-2"><CelestialDecorations.TarotCorner position="top-left" /></div>
            <div className="absolute top-2 right-2"><CelestialDecorations.TarotCorner position="top-right" /></div>
            <div className="absolute bottom-2 left-2"><CelestialDecorations.TarotCorner position="bottom-left" /></div>
            <div className="absolute bottom-2 right-2"><CelestialDecorations.TarotCorner position="bottom-right" /></div>

            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center space-x-1 text-[#C8A962] text-[11px] font-serif tracking-widest uppercase">
                <CelestialDecorations.MoonPhaseIcon />
                <span className="font-bold">ASTROLABE DREAM RECORDER</span>
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-widest text-[#F1F4FA]`}>
                星辰と夢の観測儀
              </h2>
              <p className="text-xs max-w-xs mx-auto leading-relaxed text-[#8B9BB4]">
                寝起きの無意識を天球儀へ吹き込み、神秘のタロットと4コマ星図へ昇華。
              </p>
            </div>

            {/* Rotating Astrolabe Record Button */}
            <div className="relative z-10 py-1 flex justify-center items-center">
              <div className="relative">
                <CelestialDecorations.AstrolabeRing className="scale-90" />
                <button
                  id="home-main-record-btn"
                  onClick={() => {
                    audioEngine.playMechanicalClick('high');
                    setIsAlarmTriggered(false);
                    setIsVoiceModalOpen(true);
                  }}
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full shadow-2xl flex flex-col items-center justify-center border-2 border-[#C8A962] transition-all cursor-pointer group active:scale-95 hover:scale-105"
                  style={{
                    backgroundColor: '#C8A962',
                    color: '#0F141D',
                  }}
                >
                  <Mic className="w-7 h-7 group-hover:scale-110 transition-transform stroke-2" />
                  <span className="text-[10px] font-bold mt-0.5 tracking-wider font-serif">詠唱開始</span>
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="relative z-10 inline-flex items-center text-[11px] bg-[#C8A962]/10 text-[#C8A962] px-3 py-1 rounded-full border border-[#C8A962]/30 font-serif">
              <span>✦ 夢の破片を夜空の記録に残す ✦</span>
            </div>
          </div>
        );

      case 'vintage':
        return (
          <div 
            className="rounded-xl p-5 text-white shadow-2xl relative overflow-hidden space-y-3.5 border-2 transition-all font-mono"
            style={{
              backgroundColor: '#121824',
              borderColor: '#2D3C52',
            }}
          >
            {/* Cassette Tape Simulation Decor */}
            <RetroCassetteDecorations.CassetteTape />

            <div className="space-y-1 text-center">
              <div className="flex items-center justify-between text-[11px] text-[#4EF2BB]">
                <span className="flex items-center">
                  <Radio className="w-3.5 h-3.5 mr-1" />
                  MAGNETIC TAPE RECORDER
                </span>
                <span>CH: 98.4 MHz</span>
              </div>
              <h2 className="text-lg font-bold tracking-wider text-[#A84432]">
                夢電波アナログレコーダー
              </h2>
            </div>

            {/* Hardware-Style REC Button */}
            <div className="flex items-center justify-center space-x-3 py-1">
              <button
                id="home-main-record-btn"
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="flex-1 py-3 rounded-lg border-2 border-[#A84432] flex items-center justify-center space-x-2 transition-all cursor-pointer group active:scale-98 shadow-md"
                style={{
                  backgroundColor: '#A84432',
                  color: '#FFFFFF',
                }}
              >
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold tracking-widest">[● PUSH TO REC]</span>
              </button>
            </div>

            {/* Status footer */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-[#2D3C52] pt-2">
              <span>SAMPLING: 44.1kHz</span>
              <span className="text-[#4EF2BB] animate-pulse">● READY FOR VOICE</span>
            </div>
          </div>
        );

      case 'pastel':
        return (
          <div 
            className="rounded-3xl p-6 text-[#242938] shadow-xl relative overflow-hidden text-center space-y-4 border transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(238,242,255,0.85) 100%)',
              borderColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Specimen Floating Bubble Decor */}
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <GlassSpecimenDecorations.FloatingOrb />
            </div>

            <div className="relative z-10 space-y-1">
              <div className="flex justify-center">
                <GlassSpecimenDecorations.SpecimenLabel id="SPEC-COLLECTOR" name="夢の結晶保管庫" />
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-tight text-[#242938] pt-2`}>
                夢の標本をつくる
              </h2>
              <p className="text-xs max-w-xs mx-auto leading-relaxed text-[#5C6479]">
                目覚めた瞬間の言葉を、ぷっくりとしたガラス標本と4コマへ閉じ込めます。
              </p>
            </div>

            {/* Clay 3D style button */}
            <div className="relative z-10 py-2 flex justify-center">
              <button
                id="home-main-record-btn"
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-24 h-24 rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-white transition-all cursor-pointer group active:scale-95 hover:scale-105"
                style={{
                  backgroundColor: '#6366F1',
                  color: '#FFFFFF',
                }}
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 tracking-wide">声で採集</span>
              </button>
            </div>

            {/* Hint badge */}
            <div className="relative z-10 inline-flex items-center text-[11px] bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full border border-indigo-100 font-medium">
              <Sparkles className="w-3 h-3 mr-1.5 text-indigo-500" />
              <span>声の欠片から4コマを自動標本化</span>
            </div>
          </div>
        );
    }
  };

  // Render style-specific Dream Card
  const renderDreamCard = (dream: DreamRecord) => {
    return (
      <div
        key={dream.id}
        onClick={() => {
          audioEngine.playMechanicalClick('low');
          setSelectedDream(dream);
        }}
        className="p-4 border shadow-2xs hover:scale-[1.005] transition-all cursor-pointer space-y-2 group relative overflow-hidden"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          borderRadius: currentStyle.typography.cardRadius === 'rounded-3xl' ? '1.5rem' : currentStyle.typography.cardRadius === 'rounded-2xl' ? '1rem' : '0.5rem',
        }}
      >
        {/* Style specific card accent */}
        {currentStyle.id === 'washi' && (
          <div className="absolute top-0 right-4 pointer-events-none -mt-1 scale-75">
            <StorybookDecorations.WashiTape />
          </div>
        )}
        {currentStyle.id === 'midnight' && (
          <div className="absolute top-1 right-1 pointer-events-none scale-75">
            <CelestialDecorations.TarotCorner position="top-right" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs opacity-70">
          <div className="flex items-center space-x-1.5 font-mono">
            {currentStyle.id === 'vintage' && <span className="text-[#4EF2BB] font-bold">[TAPE]</span>}
            <span>{dream.dateLabel}</span>
            <span>•</span>
            <span>{dream.timeLabel}</span>
          </div>
          <span 
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: currentStyle.colors.bg,
              color: currentStyle.colors.textPrimary,
              border: `1px solid ${currentStyle.colors.border}`,
            }}
          >
            {dream.category}
          </span>
        </div>

        <h4 
          className={`${currentStyle.typography.headingFont} text-base font-bold transition-colors group-hover:opacity-80`}
          style={{ color: currentStyle.colors.textPrimary }}
        >
          {dream.title}
        </h4>

        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
          {dream.summary}
        </p>

        <div className="flex items-center justify-between pt-1 text-[11px] opacity-70">
          <div className="flex items-center space-x-1">
            {dream.motifs.slice(0, 3).map((m, i) => (
              <span 
                key={i} 
                className="px-1.5 py-0.5 rounded border text-[10px]"
                style={{
                  backgroundColor: currentStyle.colors.bg,
                  borderColor: currentStyle.colors.border,
                }}
              >
                #{m}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold" style={{ color: currentStyle.colors.accent }}>
              シュール度 {dream.parameters.surrealism}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on active view
  const renderMainContent = () => {
    if (selectedDream) {
      return (
        <DreamDetailView
          dream={selectedDream}
          onBack={() => setSelectedDream(null)}
          onOpenComicStudio={handleOpenComicStudio}
          onTogglePublic={handleTogglePublic}
          onDeleteDream={handleDeleteDream}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="pb-28 p-4 space-y-4 animate-in fade-in duration-200">
            {/* Style Direction Banner */}
            <div 
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                openStyleSelector();
              }}
              className="p-3.5 rounded-2xl border flex items-center justify-between shadow-2xs transition-all cursor-pointer hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center space-x-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{
                    backgroundColor: currentStyle.colors.accent + '20',
                    color: currentStyle.colors.accent,
                  }}
                >
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-1.5">
                    <span>デザイン造形: {currentStyle.name}</span>
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded-full font-bold"
                      style={{
                        backgroundColor: currentStyle.colors.accent,
                        color: currentStyle.colors.recordBtnText || '#fff',
                      }}
                    >
                      変更
                    </span>
                  </div>
                  <div className="text-[10px] opacity-70">
                    装飾アセット・造形・世界観の4パターンをリアルタイム切替
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>

            {/* Style-Specific Hero Recording Area */}
            {renderHeroRecorder()}

            {/* Next Alarm Info Banner */}
            <div 
              className="rounded-2xl p-3.5 border flex items-center justify-between shadow-2xs transition-colors"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: currentStyle.colors.bg,
                    color: currentStyle.colors.textPrimary,
                  }}
                >
                  <Bell className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    次回アラーム {settings.alarmTime}
                  </div>
                  <div className="text-[10px] opacity-70">
                    アラーム後に自動で記録画面を起動
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmModalOpen(true);
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border"
                style={{
                  backgroundColor: currentStyle.colors.bg,
                  borderColor: currentStyle.colors.border,
                  color: currentStyle.colors.textPrimary,
                }}
              >
                試す
              </button>
            </div>

            {/* Recent Dreams List */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 
                  className={`${currentStyle.typography.headingFont} text-base font-bold flex items-center`}
                  style={{ color: currentStyle.colors.accentSecondary }}
                >
                  <BookOpen className="w-4 h-4 mr-1.5" style={{ color: currentStyle.colors.accent }} />
                  最近の夢日記
                </h3>
                <button
                  onClick={() => {
                    audioEngine.playMechanicalClick('high');
                    setActiveTab('my-dreams');
                  }}
                  className="text-xs font-medium flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ color: currentStyle.colors.accent }}
                >
                  <span>すべて見る</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              {dreams.slice(0, 3).map((dream) => renderDreamCard(dream))}
            </div>
          </div>
        );

      case 'my-dreams':
        return (
          <div className="pb-28 p-4 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 
                  className={`${currentStyle.typography.headingFont} text-xl font-bold`}
                  style={{ color: currentStyle.colors.accentSecondary }}
                >
                  自分の夢日記
                </h2>
                <p className="text-xs opacity-70">
                  記録した夢の数：{dreams.length}編
                </p>
              </div>

              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: currentStyle.colors.accentSecondary,
                  color: currentStyle.colors.bg,
                }}
              >
                <Plus className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
                <span>夢を追加</span>
              </button>
            </div>

            {/* Dreams list */}
            <div className="space-y-3">
              {dreams.map((dream) => renderDreamCard(dream))}
            </div>
          </div>
        );

      case 'gallery':
        return (
          <DreamGalleryView
            dreams={dreams}
            onSelectDream={(dream) => setSelectedDream(dream)}
            onReactDream={handleReactDream}
            showSponsor={settings.showSponsorCards && !settings.isPremiumUser}
          />
        );

      case 'analytics':
        return (
          <DreamAnalyticsView
            dreams={dreams}
            onSelectDream={(dream) => setSelectedDream(dream)}
          />
        );

      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            onSimulateAlarm={() => setIsAlarmModalOpen(true)}
            onResetAllData={handleResetAllData}
          />
        );
    }
  };

  return (
    <PhoneFrame>
      <div 
        className="flex flex-col flex-1 relative min-h-[800px] transition-colors duration-200"
        style={{
          backgroundColor: currentStyle.colors.bg,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Header (hidden in details view to give focus) */}
        {!selectedDream && (
          <Header
            settings={settings}
            onSimulateAlarm={() => setIsAlarmModalOpen(true)}
          />
        )}

        {/* Dynamic View Area */}
        <main className="flex-1">
          {renderMainContent()}
        </main>

        {/* Fixed Bottom Navigation (hidden in details) */}
        {!selectedDream && (
          <Navigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setSelectedDream(null);
              setActiveTab(tab);
            }}
            onOpenRecord={() => {
              setIsAlarmTriggered(false);
              setIsVoiceModalOpen(true);
            }}
          />
        )}

        {/* Modal 1: Voice Recording Screen */}
        <VoiceRecordModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onTranscriptionComplete={handleTranscriptionComplete}
          isAlarmTriggered={isAlarmTriggered}
        />

        {/* Modal 2: AI Dream Classification & Editor Screen */}
        <DreamEditorModal
          isOpen={isEditorModalOpen}
          rawTranscription={transcribedText}
          durationSec={recordedDuration}
          onClose={() => setIsEditorModalOpen(false)}
          onSave={handleSaveDream}
        />

        {/* Modal 3: 4-Panel Comic & Movie Poster Generator */}
        {comicTargetDream && (
          <ComicGeneratorModal
            isOpen={isComicModalOpen}
            dream={comicTargetDream}
            onClose={() => setIsComicModalOpen(false)}
            onSaveComic={handleSaveComic}
          />
        )}

        {/* Modal 4: Morning Alarm Trigger Simulator */}
        <AlarmSimulationModal
          isOpen={isAlarmModalOpen}
          settings={settings}
          onDismissAndRecord={() => {
            setIsAlarmModalOpen(false);
            setIsAlarmTriggered(true);
            setIsVoiceModalOpen(true);
          }}
          onDismissOnly={() => {
            setIsAlarmModalOpen(false);
          }}
        />

        {/* Modal 5: UI Style Direction Candidates Selector */}
        <UIStyleSelectorModal
          isOpen={isStyleSelectorOpen}
          onClose={closeStyleSelector}
        />
      </div>
    </PhoneFrame>
  );
}

export default function App() {
  return (
    <UIStyleProvider>
      <MainAppContent />
    </UIStyleProvider>
  );
}
