import React, { useState, useEffect } from 'react';
import { DreamRecord, DreamParameters } from '../types';
import { Sparkles, Save, Tag, MapPin, Users, Activity, Check, Edit3, X, Eye, EyeOff, Loader2 } from 'lucide-react';
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
          setSummary(data.summary || rawTranscription.slice(0, 60));
          setCategory(data.category || '日常の歪み');
          setCharacters(data.characters || []);
          setPlaces(data.places || []);
          setMotifs(data.motifs || ['夢', '朝']);
          setMood(data.mood || ['シュール', '静寂']);
          setParameters(data.parameters || {
            surrealism: 85,
            workFactor: 40,
            catFactor: 10,
            floatiness: 60,
            logicBreak: 80,
            vividness: 75,
          });
          setShareCopy(data.shareCopy || `今日の夢：${data.title} #夢のあと`);
          setIsLoading(false);
          audioEngine.playChime();
        }
      } catch (err) {
        console.error('Analysis error fallback:', err);
        if (isMounted) {
          setTitle('消えゆく朝の不思議な記憶');
          setSummary(rawTranscription.slice(0, 60));
          setCategory('日常の歪み');
          setMotifs(['朝', '記憶']);
          setMood(['シュール']);
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
    setMotifs(motifs.filter(m => m !== motifToRemove));
  };

  const handleSaveDream = () => {
    audioEngine.playMechanicalClick('high');
    const now = new Date();
    const newDream: DreamRecord = {
      id: `dream-${Date.now()}`,
      createdAt: now.toISOString(),
      dateLabel: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
      timeLabel: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      rawTranscription,
      title: title.trim() || '無題の夢',
      summary: summary.trim() || rawTranscription.slice(0, 50),
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs transition-opacity">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 relative"
        style={{
          backgroundColor: currentStyle.colors.bg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* iOS Handle bar */}
        <div className="w-12 h-1.5 bg-current/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div 
          className="px-5 py-3.5 flex items-center justify-between border-b"
          style={{ borderColor: currentStyle.colors.border }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-7 h-7 rounded-sm flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.accentSecondary,
                color: currentStyle.colors.accent,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className={`${currentStyle.typography.headingFont} font-bold text-sm`} style={{ color: currentStyle.colors.accentSecondary }}>
                夢の採集カルテ
              </span>
              <span className="text-[10px] opacity-60 ml-2 font-mono">
                {isLoading ? '解析中' : 'AI診断完了'}
              </span>
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
        <div className="p-5 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-14 space-y-3">
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-full border-3 border-current/20 animate-spin"
                  style={{ borderTopColor: currentStyle.colors.accent }}
                />
                <Sparkles className="w-5 h-5 absolute inset-0 m-auto" style={{ color: currentStyle.colors.accent }} />
              </div>
              <p className={`${currentStyle.typography.headingFont} text-base font-bold mt-2`} style={{ color: currentStyle.colors.accentSecondary }}>
                消えゆく夢の輪郭を編み込み中...
              </p>
              <p className="text-xs opacity-75 max-w-xs text-center leading-relaxed">
                音声からタイトル・要約・シュール度・モチーフを解析しています
              </p>
            </div>
          ) : (
            <>
              {/* Dream Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center justify-between opacity-85">
                  <span>夢のタイトル</span>
                  <span className="text-[10px] opacity-50 font-normal">編集可能</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-bold text-base focus:outline-none ${currentStyle.typography.headingFont}`}
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                    color: currentStyle.colors.textPrimary,
                  }}
                />
              </div>

              {/* Dream Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold flex items-center justify-between opacity-85">
                  <span>夢の要約</span>
                  <span className="text-[10px] opacity-50 font-normal">AI生成</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border text-xs focus:outline-none resize-none leading-relaxed"
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.border,
                    color: currentStyle.colors.textPrimary,
                  }}
                />
              </div>

              {/* Category & Visibility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1 opacity-85">
                    夢の分類
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none"
                    style={{
                      backgroundColor: currentStyle.colors.cardBg,
                      borderColor: currentStyle.colors.border,
                      color: currentStyle.colors.textPrimary,
                    }}
                  >
                    <option value="仕事の夢">仕事・学業の夢</option>
                    <option value="空想・SF">空想・SF・宇宙</option>
                    <option value="日常の歪み">日常の歪み・不条理</option>
                    <option value="動物と出会う夢">動物・生き物</option>
                    <option value="冒険・逃走">冒険・迷路・逃走</option>
                    <option value="懐古・再会">懐古・再会・記憶</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 opacity-85">
                    図鑑への公開設定
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playMechanicalClick('high');
                      setIsPublic(!isPublic);
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    style={{
                      backgroundColor: isPublic ? currentStyle.colors.accent + '20' : currentStyle.colors.cardBg,
                      borderColor: isPublic ? currentStyle.colors.accent : currentStyle.colors.border,
                      color: currentStyle.colors.textPrimary,
                    }}
                  >
                    {isPublic ? (
                      <>
                        <Eye className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
                        <span>図鑑に公開する</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 opacity-60" />
                        <span>非公開（自分のみ）</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Parameters Visualizer */}
              <div 
                className="rounded-2xl p-3.5 border space-y-2.5"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center" style={{ color: currentStyle.colors.textPrimary }}>
                    <Activity className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
                    夢の成分解析
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">指標</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="opacity-75">シュール度</span>
                      <span className="font-mono font-bold">{parameters.surrealism}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.surrealism}%`, backgroundColor: currentStyle.colors.accent }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="opacity-75">浮遊・飛翔感</span>
                      <span className="font-mono font-bold">{parameters.floatiness}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.floatiness}%`, backgroundColor: currentStyle.colors.accentSecondary }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="opacity-75">現実・職場成分</span>
                      <span className="font-mono font-bold">{parameters.workFactor}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.workFactor}%`, backgroundColor: currentStyle.colors.accent }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="opacity-75">ロジック破綻度</span>
                      <span className="font-mono font-bold">{parameters.logicBreak}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: currentStyle.colors.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${parameters.logicBreak}%`, backgroundColor: currentStyle.colors.accentSecondary }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Motifs Tag Management */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold flex items-center opacity-85">
                  <Tag className="w-3.5 h-3.5 mr-1" style={{ color: currentStyle.colors.accent }} />
                  モチーフ・キーワード
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {motifs.map((motif, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: currentStyle.colors.cardBg,
                        borderColor: currentStyle.colors.border,
                        color: currentStyle.colors.textPrimary,
                      }}
                    >
                      #{motif}
                      <button
                        type="button"
                        onClick={() => handleRemoveMotif(motif)}
                        className="ml-1 opacity-50 hover:opacity-100"
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
                      placeholder="+ タグ追加"
                      className="text-xs px-2.5 py-1 rounded-full border w-24 focus:outline-none focus:w-32 transition-all"
                      style={{
                        backgroundColor: currentStyle.colors.cardBg,
                        borderColor: currentStyle.colors.border,
                        color: currentStyle.colors.textPrimary,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Raw speech text display */}
              <div 
                className="rounded-xl p-3 text-[11px] border leading-relaxed"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                  opacity: 0.8,
                }}
              >
                <span className="font-bold block mb-0.5 font-serif">起床直後の録音文字起こし：</span>
                <p className="italic font-mono">"{rawTranscription}"</p>
              </div>
            </>
          )}
        </div>

        {/* Footer Save Button */}
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
            className="flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all cursor-pointer text-center"
            style={{
              borderColor: currentStyle.colors.border,
              color: currentStyle.colors.textPrimary,
            }}
          >
            戻る
          </button>
          <button
            id="save-dream-final-btn"
            disabled={isLoading}
            onClick={handleSaveDream}
            className={`flex-2 py-3 px-5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer ${
              !isLoading
                ? 'active:scale-98 hover:opacity-90'
                : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: currentStyle.colors.recordBtnBg,
              color: currentStyle.colors.recordBtnText,
            }}
          >
            <Save className="w-4 h-4" />
            <span>カルテを保存する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
