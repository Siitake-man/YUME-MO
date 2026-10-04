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
import { VoiceprintModal } from './components/VoiceprintModal';
import { AlarmSimulationModal } from './components/AlarmSimulationModal';
import { UIStyleSelectorModal } from './components/UIStyleSelectorModal';
import { AppHelpModal } from './components/AppHelpModal';
import { AppGuideTourModal } from './components/AppGuideTourModal';
import { audioEngine } from './utils/audioEngine';
import { MascotWalkLane, BakuMascot, HitsujiMascot } from './components/DreamMascots';
import { HandwrittenPostIt, HandwrittenArrow, CuteStamp } from './components/PlayfulAccents';
import { VoiceRecordingWidget } from './components/VoiceRecordingWidget';
import { RetroAnimeBoombox } from './components/RetroAnimeBoombox';
import { SparkleAsset, LightbulbIdeaAsset, MangaFrameEmblem, PaletteBrushAsset, BookJournalAsset, MoonCrestAsset } from './components/IllustratedAssets';
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
  const [isVoiceprintModalOpen, setIsVoiceprintModalOpen] = useState<boolean>(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);
  const [isComicModalOpen, setIsComicModalOpen] = useState<boolean>(false);
  const [comicTargetDream, setComicTargetDream] = useState<DreamRecord | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);

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

  // First-time visitor tour guide trigger
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('yumenoto_has_seen_tour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

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
            className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden text-center space-y-4 border transition-all"
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
            <div className="absolute bottom-3 right-3 pointer-events-none opacity-80 z-20">
              <StorybookDecorations.StampHanko text="夢採集" />
            </div>

            <div className="relative z-10 space-y-1.5 pt-1">
              <div className="inline-flex items-center space-x-1.5 text-xs font-serif" style={{ color: currentStyle.colors.accent }}>
                <StorybookDecorations.FeatherPenIcon />
                <span className="font-semibold tracking-wider">活版夢草紙 · 音声採集</span>
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-wide text-white`}>
                夢を、声でつかまえる
              </h2>
              <p className="text-xs max-w-sm mx-auto leading-relaxed opacity-80">
                起きた瞬間の言葉をそのまま。AIが消えてしまう前の余白から物語と4コマを紡ぎます。
              </p>
            </div>

            {/* Washi Record Button */}
            <div className="relative z-10 py-1 flex justify-center">
              <button
                id="home-main-record-btn"
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-24 h-24 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-white/20 transition-all cursor-pointer group active:scale-95 hover:scale-105"
                style={{
                  backgroundColor: currentStyle.colors.recordBtnBg,
                  color: currentStyle.colors.recordBtnText,
                }}
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 font-serif tracking-wider">夢を語る</span>
              </button>
            </div>

            {/* Integrated Next Alarm Strip */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-xs opacity-80">
              <div className="flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
                <span>次回アラーム {settings.alarmTime}（起床時自動起動）</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmModalOpen(true);
                }}
                className="text-[11px] font-medium hover:underline cursor-pointer"
              >
                テスト
              </button>
            </div>
          </div>
        );

      case 'midnight':
        return (
          <div 
            className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden text-center space-y-4 border transition-all"
            style={{
              background: currentStyle.colors.heroGradient,
              borderColor: '#C8A962',
              boxShadow: '0 0 20px rgba(200, 169, 98, 0.12)',
            }}
          >
            {/* Gold Tarot Corners */}
            <div className="absolute top-2 left-2"><CelestialDecorations.TarotCorner position="top-left" /></div>
            <div className="absolute top-2 right-2"><CelestialDecorations.TarotCorner position="top-right" /></div>

            <div className="relative z-10 space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 text-[#C8A962] text-xs font-serif tracking-widest uppercase">
                <CelestialDecorations.MoonPhaseIcon />
                <span className="font-semibold">ASTROLABE DREAM RECORDER</span>
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-widest text-[#F1F4FA]`}>
                星辰と夢の観測儀
              </h2>
              <p className="text-xs max-w-sm mx-auto leading-relaxed text-[#8B9BB4]">
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

            {/* Integrated Next Alarm Strip */}
            <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#8B9BB4]">
              <div className="flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-[#C8A962]" />
                <span>次回観測アラーム {settings.alarmTime}</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmModalOpen(true);
                }}
                className="text-[11px] text-[#C8A962] font-medium hover:underline cursor-pointer"
              >
                テスト
              </button>
            </div>
          </div>
        );

      case 'vintage':
        return (
          <div className="space-y-3">
            <RetroAnimeBoombox
              isRecording={false}
              onRecordToggle={() => {
                setIsAlarmTriggered(false);
                setIsVoiceModalOpen(true);
              }}
            />
            {/* Integrated Next Alarm Strip for Vintage */}
            <div 
              className="p-3 rounded-xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-red-500 font-bold">[ALARM]</span>
                <span>TIMER {settings.alarmTime}</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmModalOpen(true);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded border border-white/20 hover:bg-white/10 cursor-pointer"
              >
                TEST
              </button>
            </div>
          </div>
        );

      case 'pastel':
        return (
          <div 
            className="rounded-3xl p-6 text-[#242938] shadow-lg relative overflow-hidden text-center space-y-4 border transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,245,250,0.9) 100%)',
              borderColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Specimen Floating Bubble Decor */}
            <div className="absolute -top-4 -right-4 pointer-events-none">
              <GlassSpecimenDecorations.FloatingOrb />
            </div>

            <div className="relative z-10 space-y-1.5">
              <div className="flex justify-center">
                <GlassSpecimenDecorations.SpecimenLabel id="SPEC-COLLECTOR" name="夢の結晶保管庫" />
              </div>
              <h2 className={`${currentStyle.typography.headingFont} text-2xl font-bold tracking-tight text-[#242938] pt-1`}>
                夢の標本をつくる
              </h2>
              <p className="text-xs max-w-sm mx-auto leading-relaxed text-[#5C6479]">
                目覚めた瞬間の言葉を、ぷっくりとしたガラス標本と4コマへ閉じ込めます。
              </p>
            </div>

            {/* Clay 3D style button */}
            <div className="relative z-10 py-1 flex justify-center">
              <button
                id="home-main-record-btn"
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmTriggered(false);
                  setIsVoiceModalOpen(true);
                }}
                className="w-24 h-24 rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-white transition-all cursor-pointer group active:scale-95 hover:scale-105"
                style={{
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                }}
              >
                <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 tracking-wide">声で採集</span>
              </button>
            </div>

            {/* Integrated Next Alarm Strip */}
            <div className="relative z-10 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>次回アラーム {settings.alarmTime}</span>
              </div>
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setIsAlarmModalOpen(true);
                }}
                className="text-[11px] text-[#0D9488] font-medium hover:underline cursor-pointer"
              >
                テスト
              </button>
            </div>
          </div>
        );
    }
  };

  // Render style-specific Dream Card with Zero-Pill typography
  const renderDreamCard = (dream: DreamRecord) => {
    return (
      <div
        key={dream.id}
        onClick={() => {
          audioEngine.playMechanicalClick('low');
          setSelectedDream(dream);
        }}
        className="p-4 border shadow-xs hover:border-slate-400/40 transition-all cursor-pointer space-y-2 group relative overflow-hidden"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          borderRadius: currentStyle.typography.cardRadius === 'rounded-3xl' ? '1.25rem' : currentStyle.typography.cardRadius === 'rounded-2xl' ? '1rem' : '0.5rem',
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

        {/* Zero-Pill Header Metadata */}
        <div className="flex items-center justify-between text-xs opacity-65">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{dream.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.dateLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.timeLabel}</span>
          </div>
          {currentStyle.id === 'vintage' && (
            <span className="font-mono text-xs font-bold text-red-500">[REC]</span>
          )}
        </div>

        {/* Clean Editorial Title */}
        <h4 
          className={`${currentStyle.typography.headingFont} text-base font-semibold tracking-wide transition-colors group-hover:opacity-80`}
          style={{ color: currentStyle.colors.textPrimary }}
        >
          {dream.title}
        </h4>

        {/* Summary */}
        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
          {dream.summary}
        </p>

        {/* Clean Metadata Footer */}
        <div className="flex items-center justify-between pt-1.5 text-xs border-t border-black/5 dark:border-white/5">
          <div className="flex items-center space-x-2 opacity-70 flex-wrap">
            {dream.motifs.slice(0, 3).map((m, i) => (
              <span key={i} className="text-[11px]">#{m}</span>
            ))}
            {dream.comicStrip && (
              <span className="inline-flex items-center space-x-1 text-amber-700 dark:text-amber-300 font-medium text-[11px]">
                <BookOpen className="w-3 h-3" />
                <span>4コマ</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono tabular-nums opacity-60">
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
          <div className="pb-28 p-5 space-y-5 animate-in fade-in duration-200">
            {/* Style-Specific Hero Recording Area (Integrated with Next Alarm) */}
            {renderHeroRecorder()}

            {/* Quiet Baku Mascot Companion Card */}
            <div 
              className="p-3.5 rounded-2xl border flex items-center space-x-3 transition-colors shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="shrink-0">
                <BakuMascot size="sm" isWalking={false} showSpeech={false} />
              </div>
              <div className="flex-1 space-y-0.5">
                <span className="font-semibold text-xs block" style={{ color: currentStyle.colors.textPrimary }}>
                  バクくんの夢あつめの手帖
                </span>
                <p className="text-xs opacity-75 leading-relaxed">
                  起きたばかりの断片的なつぶやきでOK。AIが4コマや標本に仕立てます。
                </p>
              </div>
            </div>

            {/* Recent Dreams List with Zero-Pill Architecture */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 
                  className={`${currentStyle.typography.headingFont} text-base font-semibold flex items-center`}
                  style={{ color: currentStyle.colors.textPrimary }}
                >
                  <BookOpen className="w-4 h-4 mr-2" style={{ color: currentStyle.colors.accent }} />
                  最近の夢日記
                </h3>
                <button
                  onClick={() => {
                    audioEngine.playMechanicalClick('high');
                    setActiveTab('my-dreams');
                  }}
                  className="text-xs opacity-70 hover:opacity-100 flex items-center transition-opacity cursor-pointer"
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
            onOpenVoiceprintModal={() => setIsVoiceprintModalOpen(true)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenTour={() => setIsTourModalOpen(true)}
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
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenTour={() => setIsTourModalOpen(true)}
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
          settings={settings}
          onOpenVoiceprintTuning={() => setIsVoiceprintModalOpen(true)}
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

        {/* Modal 5: Voiceprint Calibration & Transcription Tuning */}
        <VoiceprintModal
          isOpen={isVoiceprintModalOpen}
          onClose={() => setIsVoiceprintModalOpen(false)}
          settings={settings}
          onSaveProfile={(newProfile) => {
            setSettings((prev) => ({
              ...prev,
              voiceprintProfile: newProfile,
            }));
          }}
        />

        {/* Modal 6: UI Style Direction Candidates Selector */}
        <UIStyleSelectorModal
          isOpen={isStyleSelectorOpen}
          onClose={closeStyleSelector}
        />

        {/* Modal 7: Help & FAQ Modal */}
        <AppHelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          onStartTour={() => {
            setIsHelpModalOpen(false);
            setIsTourModalOpen(true);
          }}
        />

        {/* Modal 8: Interactive Guide Tour Modal */}
        <AppGuideTourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
          onCompleteTour={() => {
            localStorage.setItem('yumenoto_has_seen_tour', 'true');
            setIsTourModalOpen(false);
          }}
          onOpenRecordModal={() => {
            setIsAlarmTriggered(false);
            setIsVoiceModalOpen(true);
          }}
          onSimulateAlarm={() => {
            setIsAlarmModalOpen(true);
          }}
        />

        {/* Floating Quick Voice Recording Widget */}
        <VoiceRecordingWidget
          onSaveDream={(newDream) => {
            setDreams((prev) => [newDream as DreamRecord, ...prev]);
          }}
          onOpenFullModal={() => {
            setIsAlarmTriggered(false);
            setIsVoiceModalOpen(true);
          }}
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
