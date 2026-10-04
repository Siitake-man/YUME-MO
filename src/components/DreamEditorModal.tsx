import React, { useState, useEffect } from 'react';
import { DreamRecord, DreamParameters } from '../types';
import { Feather, Save, Tag, Eye, EyeOff, X } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { StorybookDecorations } from './Decorations';

interface DreamEditorModalProps {
  isOpen: boolean;
  rawTranscription: string;
  durationSec: number;
  onClose: () => void;
  onSave: (dream: DreamRecord) => void;
}

export const DreamEditorModal: React.FC<DreamEditorModalProps> = ({
  isOpen,
  rawTranscription,
  durationSec,
  onClose,
  onSave,
}) => {
  const { currentStyle } = useUIStyle();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [category, setCategory] = useState<string>('日常の歪み');
  const [characters, setCharacters] = useState<string[]>([]);
  const [places, setPlaces] = useState<string[]>([]);
  const [motifs, setMotifs] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [parameters, setParameters] = useState<DreamParameters>({
    surrealism: 80,
    workFactor: 30,
    catFactor: 0,
    floatiness: 50,
    logicBreak: 85,
    vividness: 75,
  });
  const [shareCopy, setShareCopy] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [newMotifInput, setNewMotifInput] = useState<string>('');
  const [isBinding, setIsBinding] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !rawTranscription) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze-dream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawTranscription }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze dream');
        }

        const data = await response.json();
        if (isMounted) {
          setTitle(data.title || '名前のない朝の記憶');
          setSummary(data.summary || rawTranscription.slice(0, 70));
          setCategory(data.category || '日常の歪み');
          setCharacters(data.characters || []);
          setPlaces(data.places || []);
          setMotifs(data.motifs || ['朝', '残響']);
          setMood(data.mood || ['静寂']);
          setParameters(data.parameters || {
            surrealism: 85,
            workFactor: 40,
            catFactor: 10,
            floatiness: 60,
            logicBreak: 80,
            vividness: 75,
          });
          setShareCopy(data.shareCopy || `今朝の手記：${data.title} #夢のあと`);
          setIsLoading(false);
          audioEngine.playChime();
        }
      } catch (err) {
        console.error('Analysis fallback:', err);
        if (isMounted) {
          setTitle('消えゆく朝の不思議な輪郭');
          setSummary(rawTranscription.slice(0, 70));
          setCategory('日常の歪み');
          setMotifs(['朝', '記憶']);
          setMood(['静寂']);
          setIsLoading(false);
          audioEngine.playChime();
        }
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [isOpen, rawTranscription]);

  const handleAddMotif = () => {
    if (newMotifInput.trim() && !motifs.includes(newMotifInput.trim())) {
      audioEngine.playMechanicalClick('high');
      setMotifs([...motifs, newMotifInput.trim()]);
      setNewMotifInput('');
    }
  };

  const handleRemoveMotif = (motifToRemove: string) => {
    audioEngine.playMechanicalClick('low');
    setMotifs(motifs.filter((m) => m !== motifToRemove));
  };

  const handleSaveDream = () => {
    setIsBinding(true);
    audioEngine.playThemeSound(currentStyle.id, 'action');

    setTimeout(() => {
      const now = new Date();
      const newDream: DreamRecord = {
        id: `dream-${Date.now()}`,
        createdAt: now.toISOString(),
        dateLabel: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
        timeLabel: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        rawTranscription,
        title: title.trim() || '無題の手記',
        summary: summary.trim() || rawTranscription.slice(0, 60),
        category,
        characters,
        places,
        motifs,
        mood,
        parameters,
        shareCopy,
        isPublic,
        audioDurationSec: durationSec,
        likesCount: 0,
        reactions: { moon: 0, surreal: 0, relatable: 0 },
        authorName: 'あなた',
      };

      onSave(newDream);
      setIsBinding(false);
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs transition-opacity p-0 sm:p-4">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 relative"
        style={{
          backgroundColor: currentStyle.colors.bg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Subtle washi tape decorative seal on top desktop */}
        <div className="hidden sm:block absolute -top-1 left-12 pointer-events-none z-20">
          <StorybookDecorations.WashiTape />
        </div>

        {/* Modal Header */}
        <div 
          className="px-5 py-4 flex items-center justify-between border-b"
          style={{ borderColor: currentStyle.colors.border }}
        >
          <div className="flex items-center space-x-2.5">
            <StorybookDecorations.StampHanko text="手記" subtext="調律" />
            <div>
              <h2 className={`${currentStyle.typography.headingFont} text-base font-bold tracking-wide`}>
                手記の装丁と調律
              </h2>
              <p className="text-[11px] opacity-60">
                {isLoading ? '記憶の輪郭をすくい上げています...' : '目覚めの言葉を清書しました'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-current/20 animate-spin"
                  style={{ borderTopColor: currentStyle.colors.accent }}
                />
                <Feather className="w-6 h-6 absolute inset-0 m-auto opacity-70 animate-pulse" style={{ color: currentStyle.colors.accent }} />
              </div>
              <div className="text-center space-y-1">
                <p className={`${currentStyle.typography.headingFont} text-base font-bold`}>
                  言葉の余韻をすくい上げています
                </p>
                <p className="text-xs opacity-60 max-w-xs leading-relaxed">
                  起床直後の記憶の断片から、題目・情景・心象の気配を整えています。
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Original spoken / written words block */}
              <div 
                className="p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                }}
              >
                <div className="flex items-center justify-between text-[11px] opacity-60">
                  <span className="font-serif">起床直後の肉声記録</span>
                  <span className="font-mono tabular-nums">{durationSec > 0 ? `${durationSec}秒の語り` : '筆記記録'}</span>
                </div>
                <p className="italic font-serif opacity-90 leading-relaxed">
                  “{rawTranscription}”
                </p>
              </div>

              {/* Title input with letterpress feel */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif opacity-75 block">
                  手記の題目（タイトル）
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-base font-bold focus:outline-none transition-all ${currentStyle.typography.headingFont}`}
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                    color: currentStyle.colors.textPrimary,
                  }}
                  placeholder="夢の題目..."
                />
              </div>

              {/* Summary / Inscription text area */}
              <div className="space-y-1.5">
                <label className="text-xs font-serif opacity-75 block">
                  情景の要約（清書本文）
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-xl border text-xs leading-relaxed focus:outline-none resize-none font-serif"
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                    color: currentStyle.colors.textPrimary,
                  }}
                />
              </div>

              {/* Category & Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-serif opacity-75 block">
                    分類
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none font-serif cursor-pointer"
                    style={{
                      backgroundColor: currentStyle.colors.cardBg,
                      borderColor: currentStyle.colors.border,
                      color: currentStyle.colors.textPrimary,
                    }}
                  >
                    <option value="日常の歪み">日常の歪み · 不条理</option>
                    <option value="空想・SF">空想 · 天体 · 宇宙</option>
                    <option value="仕事の夢">仕事 · 学業の手記</option>
                    <option value="動物と出会う夢">生き物 · 動物との邂逅</option>
                    <option value="冒険・逃走">漂流 · 迷路 · 逃走</option>
                    <option value="懐古・再会">懐古 · 追憶 · 旧友</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-serif opacity-75 block">
                    公開範囲
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playMechanicalClick('high');
                      setIsPublic(!isPublic);
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    style={{
                      backgroundColor: isPublic ? currentStyle.colors.accent + '15' : currentStyle.colors.cardBg,
                      borderColor: isPublic ? currentStyle.colors.accent : currentStyle.colors.border,
                      color: currentStyle.colors.textPrimary,
                    }}
                  >
                    {isPublic ? (
                      <>
                        <Eye className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
                        <span className="font-serif">標本帖に公開</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 opacity-60" />
                        <span className="font-serif opacity-75">秘匿手記（自分のみ）</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Subconscious Indices / Horizon Bars */}
              <div 
                className="p-3.5 rounded-xl border space-y-2.5"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                }}
              >
                <div className="flex items-center justify-between text-xs opacity-75 font-serif">
                  <span>心象の深度観測</span>
                  <span className="font-mono text-[11px] tabular-nums">シュール度 {parameters.surrealism}%</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 opacity-70">
                      <span>非日常の歪み</span>
                      <span className="font-mono tabular-nums">{parameters.surrealism}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.surrealism}%`, backgroundColor: currentStyle.colors.accent }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 opacity-70">
                      <span>浮遊・無重力</span>
                      <span className="font-mono tabular-nums">{parameters.floatiness}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.floatiness}%`, backgroundColor: currentStyle.colors.accentSecondary }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 opacity-70">
                      <span>現実の執着</span>
                      <span className="font-mono tabular-nums">{parameters.workFactor}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.workFactor}%`, backgroundColor: currentStyle.colors.accent }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 opacity-70">
                      <span>論理の乖離</span>
                      <span className="font-mono tabular-nums">{parameters.logicBreak}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.logicBreak}%`, backgroundColor: currentStyle.colors.accentSecondary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Motifs Tag Management - Zero Pill */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs opacity-75 font-serif">
                  <span>記憶のキーワード（モチーフ）</span>
                  <span className="text-[10px] opacity-60">Enterで追加</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs py-0.5 px-2 rounded-md border font-serif"
                      style={{
                        backgroundColor: currentStyle.colors.cardBg,
                        borderColor: currentStyle.colors.border,
                      }}
                    >
                      <span>{motif}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMotif(motif)}
                        className="ml-1.5 opacity-40 hover:opacity-100 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <div className="inline-flex items-center">
                    <input
                      type="text"
                      value={newMotifInput}
                      onChange={(e) => setNewMotifInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMotif();
                        }
                      }}
                      placeholder="+ キーワード"
                      className="text-xs px-2.5 py-1 rounded-md border w-24 focus:outline-none focus:w-32 transition-all font-serif"
                      style={{
                        backgroundColor: currentStyle.colors.cardBg,
                        borderColor: currentStyle.colors.border,
                        color: currentStyle.colors.textPrimary,
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Binding Action */}
        <div 
          className="p-4 border-t flex items-center space-x-3"
          style={{
            backgroundColor: currentStyle.colors.navBg,
            borderColor: currentStyle.colors.border,
          }}
        >
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="flex-1 py-3 px-4 rounded-xl border text-xs font-serif transition-all cursor-pointer text-center"
            style={{
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            手記破棄
          </button>
          <button
            id="save-dream-final-btn"
            disabled={isLoading || isBinding}
            onClick={handleSaveDream}
            className={`flex-2 py-3 px-5 rounded-xl text-xs font-serif font-bold flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
              isBinding ? 'animate-hanko' : ''
            } ${
              !isLoading
                ? 'active:scale-98 hover:opacity-90'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: currentStyle.colors.recordBtnBg,
              color: currentStyle.colors.recordBtnText,
            }}
          >
            <StorybookDecorations.FeatherPenIcon className="w-4 h-4 text-current" />
            <span>手記に清書して綴じる</span>
          </button>
        </div>
      </div>
    </div>
  );
};
