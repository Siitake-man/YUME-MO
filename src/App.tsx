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
import { MorningJournalDesk } from './components/MorningJournalDesk';
import { audioEngine } from './utils/audioEngine';
import { RetroAnimeBoombox } from './components/RetroAnimeBoombox';
import { 
  StorybookDecorations, CelestialDecorations, 
  GlassSpecimenDecorations, RetroCassetteDecorations 
} from './components/Decorations';
import { 
  Mic, BookOpen, Clock, Calendar, ChevronRight, Activity, 
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

  // Desk pen and sample note handlers
  const handleDeskPenNote = (text: string) => {
    handleTranscriptionComplete(text, 0);
  };

  const handleSelectSamplePreset = (text: string, durationSec: number) => {
    handleTranscriptionComplete(text, durationSec);
  };

  // Render style-specific Dream Card with Zero-Pill stationery craftsmanship
  const renderDreamCard = (dream: DreamRecord) => {
    return (
      <div
        key={dream.id}
        onClick={() => {
          audioEngine.playMechanicalClick('low');
          setSelectedDream(dream);
        }}
        className="p-4 border shadow-xs hover:border-current/40 transition-all cursor-pointer space-y-2.5 group relative overflow-hidden select-none"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          borderRadius: currentStyle.typography.cardRadius === 'rounded-3xl' ? '1.25rem' : currentStyle.typography.cardRadius === 'rounded-2xl' ? '1rem' : '0.5rem',
        }}
      >
        {/* Style specific card accent */}
        {currentStyle.id === 'washi' && (
          <div className="absolute top-0 right-4 pointer-events-none -mt-1 scale-75 z-10">
            <StorybookDecorations.WashiTape />
          </div>
        )}
        {currentStyle.id === 'midnight' && (
          <div className="absolute top-1 right-1 pointer-events-none scale-75">
            <CelestialDecorations.TarotCorner position="top-right" />
          </div>
        )}

        {/* Zero-Pill Header Metadata with authentic Japanese editorial formatting */}
        <div className="flex items-center justify-between text-xs opacity-65">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-medium">{dream.category}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.dateLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{dream.timeLabel} 起床</span>
          </div>
          {currentStyle.id === 'vintage' && (
            <span className="font-mono text-[11px] font-bold text-red-500">[REC]</span>
          )}
        </div>

        {/* Clean Editorial Title in Display Font */}
        <h4 
          className={`${currentStyle.typography.headingFont} text-base font-bold tracking-wide transition-colors group-hover:opacity-80`}
          style={{ color: currentStyle.colors.textPrimary }}
        >
          {dream.title}
        </h4>

        {/* Summary prose */}
        <p className="text-xs opacity-75 line-clamp-2 leading-relaxed font-serif">
          {dream.summary}
        </p>

        {/* Clean Metadata Footer */}
        <div className="flex items-center justify-between pt-2 text-xs border-t border-black/5 dark:border-white/5">
          <div className="flex items-center space-x-2.5 opacity-70 flex-wrap">
            {dream.motifs.slice(0, 3).map((m, i) => (
              <span key={i} className="text-[11px] font-serif">#{m}</span>
            ))}
            {dream.comicStrip && (
              <span className="inline-flex items-center space-x-1 text-amber-700 dark:text-amber-300 font-serif font-medium text-[11px]">
                <BookOpen className="w-3 h-3" />
                <span>四段絵巻</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono tabular-nums opacity-60">
              深度 {dream.parameters.surrealism}%
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
            {/* World-Class Handcrafted Morning Inscription Desk */}
            <MorningJournalDesk
              settings={settings}
              onOpenVoiceRecord={() => {
                setIsAlarmTriggered(false);
                setIsVoiceModalOpen(true);
              }}
              onSubmitPenNote={handleDeskPenNote}
              onSelectSamplePreset={handleSelectSamplePreset}
              onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
            />

            {/* Quiet Curatorial Shelf Header */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
                  <h3 
                    className={`${currentStyle.typography.headingFont} text-base font-bold`}
                    style={{ color: currentStyle.colors.textPrimary }}
                  >
                    最近の筆録帖
                  </h3>
                  <span className="text-[11px] opacity-50 font-serif">（{dreams.length}編）</span>
                </div>
                <button
                  onClick={() => {
                    audioEngine.playMechanicalClick('high');
                    setActiveTab('my-dreams');
                  }}
                  className="text-xs opacity-70 hover:opacity-100 flex items-center transition-opacity cursor-pointer font-serif"
                >
                  <span>手記一覧</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>

              {dreams.slice(0, 4).map((dream) => renderDreamCard(dream))}
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
