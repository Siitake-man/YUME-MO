import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, Volume2, ArrowRight, X, Edit3, Disc, Play, Radio, Bookmark } from 'lucide-react';
import { useUIStyle } from '../context/UIStyleContext';
import { StorybookDecorations, CelestialDecorations, GlassSpecimenDecorations, RetroCassetteDecorations } from './Decorations';
import { audioEngine } from '../utils/audioEngine';

interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (text: string, durationSec: number) => void;
  isAlarmTriggered?: boolean;
}

// Preset quick voice simulations for users who cannot speak right now
const PRESET_DREAM_VOICES = [
  {
    category: '職場・航海',
    label: '猫部長とラーメン会議の夢',
    text: '会社のオフィスがなぜか豪華客船になってて、部長が茶トラ猫になってた。会議室でラーメンのトッピング一覧のスライドでプレゼンしてて、「メンマ増量こそが今期のコア戦略ニャ」って言ってて、みんな真面目にメモ取ってそのまま太平洋に出航した。',
    duration: 28,
  },
  {
    category: '日常・天体',
    label: '深夜コンビニと大根店員の夢',
    text: '深夜のコンビニに入ったら店員がおでんの大根で、レジで「自分を温めてください」って言われた。店から出たらコンビニ全体がゆっくり夜空に浮上して、星の間を飛んで宇宙に行った。',
    duration: 22,
  },
  {
    category: '過去・逆行',
    label: '逆再生の運動会と紙飛行機',
    text: '小学校の運動会で徒競走を走ってたら、全員が後ろ向きに逆再生で走ってて、ゴールからスタートラインに向かってた。応援団がみんな紙飛行機を口から吸い込んでて不思議だった。',
    duration: 25,
  },
  {
    category: '浮遊・情景',
    label: '空飛ぶ珈琲カップと雲のカフェ',
    text: '巨大なマグカップに乗って朝の空を飛んでた。雲をスプーンですくって食べたら綿あめの味で、空の上にある木造の喫茶店で誰かがピアノを弾いてた。',
    duration: 19,
  }
];

export const VoiceRecordModal: React.FC<VoiceRecordModalProps> = ({
  isOpen,
  onClose,
  onTranscriptionComplete,
  isAlarmTriggered = false,
}) => {
  const { currentStyle } = useUIStyle();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [isManualTextMode, setIsManualTextMode] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(10));
  const [activeTapeKey, setActiveTapeKey] = useState<string>('stop');

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  // Initialize SpeechRecognition if available in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscribedText(currentText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setMicPermissionDenied(true);
          }
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      stopRecording();
    };
  }, []);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setTranscribedText('');
      setRecordSeconds(0);
      setIsRecording(false);
      setIsManualTextMode(false);
      setActiveTapeKey('stop');
    } else {
      stopRecording();
      audioEngine.stopTapeHiss();
    }
  }, [isOpen]);

  // Audio animation visualizer simulator
  useEffect(() => {
    if (isRecording) {
      audioIntervalRef.current = setInterval(() => {
        setAudioLevel(
          new Array(16).fill(0).map(() => Math.floor(Math.random() * 45) + 10)
        );
      }, 100);
    } else {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      setAudioLevel(new Array(16).fill(8));
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    audioEngine.playMechanicalClick('high');
    if (currentStyle.id === 'vintage') {
      audioEngine.startTapeHiss();
    }
    setMicPermissionDenied(false);
    setIsRecording(true);
    setActiveTapeKey('rec');
    setRecordSeconds(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start caught error:', e);
      }
    }

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    audioEngine.playMechanicalClick('low');
    audioEngine.stopTapeHiss();
    setIsRecording(false);
    setActiveTapeKey('stop');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_DREAM_VOICES[0]) => {
    audioEngine.playMechanicalClick('high');
    setTranscribedText(preset.text);
    setRecordSeconds(preset.duration);
    setIsManualTextMode(true);
  };

  const handleProceed = () => {
    if (!transcribedText.trim()) return;
    audioEngine.playMechanicalClick('high');
    const duration = recordSeconds > 0 ? recordSeconds : Math.max(15, Math.floor(transcribedText.length / 5));
    onTranscriptionComplete(transcribedText.trim(), duration);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border overflow-hidden max-h-[92vh] flex flex-col transform transition-all animate-in slide-in-from-bottom duration-300 relative"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Style specific corner decors */}
        {currentStyle.id === 'washi' && (
          <div className="absolute top-0 left-6 pointer-events-none -mt-1 z-30">
            <StorybookDecorations.WashiTape />
          </div>
        )}
        {currentStyle.id === 'midnight' && (
          <>
            <div className="absolute top-2 left-2 z-30"><CelestialDecorations.TarotCorner position="top-left" /></div>
            <div className="absolute top-2 right-2 z-30"><CelestialDecorations.TarotCorner position="top-right" /></div>
          </>
        )}

        {/* Top Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2">
            <span 
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-sm border flex items-center space-x-1"
              style={{
                backgroundColor: currentStyle.colors.accent + '15',
                borderColor: currentStyle.colors.accent + '40',
                color: currentStyle.colors.accent,
              }}
            >
              <Disc className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{isAlarmTriggered ? '起床直後・朝の音声採集' : '音声記録セッション'}</span>
            </span>
            <span className="text-xs font-mono opacity-80 font-bold">
              {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:
              {String(recordSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Reassurance Message */}
          <div 
            className="rounded-xl p-3.5 flex items-start space-x-3 border"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div 
              className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
              style={{
                backgroundColor: currentStyle.colors.accent + '20',
                color: currentStyle.colors.accent,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs leading-relaxed opacity-90">
              <p className="font-bold" style={{ color: currentStyle.colors.textPrimary }}>「まとまっていなくて大丈夫」</p>
              <p className="mt-0.5 opacity-75">
                寝起きの一言、断片的な単語、不思議な人物だけでもOK。AIが物語として綺麗に整理します。
              </p>
            </div>
          </div>

          {/* Style specific visual widget during recording */}
          {currentStyle.id === 'vintage' && (
            <div className="space-y-2">
              <RetroCassetteDecorations.CassetteTape 
                isPlaying={isRecording} 
                counter={`${String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:${String(recordSeconds % 60).padStart(2, '0')}`}
              />
              <RetroCassetteDecorations.PianoKeyRow 
                activeKey={activeTapeKey}
                onKeyClick={(key) => {
                  if (key === 'rec') startRecording();
                  if (key === 'stop') stopRecording();
                }}
              />
            </div>
          )}

          {/* Center Microphone / Recording State */}
          {!isManualTextMode ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-4">
              {/* Ripple Animation Mic Button */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <>
                    <div 
                      className="absolute w-36 h-36 rounded-full animate-ping opacity-40"
                      style={{ backgroundColor: currentStyle.colors.accent }}
                    />
                    <div 
                      className="absolute w-30 h-30 rounded-full animate-pulse opacity-30"
                      style={{ backgroundColor: currentStyle.colors.accent }}
                    />
                  </>
                )}

                <button
                  id="modal-toggle-record-btn"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl border-4 transition-all transform active:scale-95 cursor-pointer ${
                    isRecording
                      ? 'border-white text-white'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: isRecording ? '#DC2626' : currentStyle.colors.recordBtnBg,
                    color: isRecording ? '#FFFFFF' : currentStyle.colors.recordBtnText,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-8 h-8 fill-current" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider font-mono">停止</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-9 h-9" />
                      <span className="text-[10px] font-bold mt-1 tracking-wider font-sans">話す</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="text-center">
                <p className={`${currentStyle.typography.headingFont} text-sm font-bold`} style={{ color: currentStyle.colors.textPrimary }}>
                  {isRecording ? '音声を聞き取り中... 夢の記憶を話してください' : 'タップして夢を話す'}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  {isRecording ? '話し終えたら、もう一度タップして停止します' : '30秒ほど、思いつくままにどうぞ'}
                </p>
              </div>

              {/* Audio visualizer wave */}
              <div className="flex items-center justify-center space-x-1 h-8 w-full max-w-xs">
                {audioLevel.map((height, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 rounded-full transition-all duration-75"
                    style={{
                      height: `${height}px`,
                      backgroundColor: isRecording ? currentStyle.colors.accent : currentStyle.colors.border,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Manual / Edited text input mode */
            <div className="space-y-2">
              <label className="text-xs font-bold block" style={{ color: currentStyle.colors.textPrimary }}>
                夢のテキスト（直接入力・編集可）
              </label>
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                placeholder="例：会社のオフィスがなぜか豪華客船になってて..."
                rows={4}
                className="w-full p-3.5 rounded-xl border text-xs focus:outline-none leading-relaxed transition-colors font-sans"
                style={{
                  backgroundColor: currentStyle.colors.bg,
                  borderColor: currentStyle.colors.border,
                  color: currentStyle.colors.textPrimary,
                }}
              />
            </div>
          )}

          {/* Real-time transcribed text preview if speech worked */}
          {!isManualTextMode && transcribedText && (
            <div 
              className="rounded-xl p-3.5 border text-xs space-y-1.5 animate-in fade-in"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
              }}
            >
              <div className="flex items-center justify-between text-[11px] opacity-80">
                <span className="font-bold flex items-center">
                  <Volume2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  文字起こし内容:
                </span>
                <button
                  onClick={() => setIsManualTextMode(true)}
                  className="hover:underline flex items-center cursor-pointer"
                  style={{ color: currentStyle.colors.accent }}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  テキストを手修正
                </button>
              </div>
              <p className="leading-relaxed font-sans opacity-95">
                {transcribedText}
              </p>
            </div>
          )}

          {/* Quick preset simulations */}
          <div className="pt-2 border-t space-y-2" style={{ borderColor: currentStyle.colors.border }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold opacity-75 flex items-center space-x-1">
                <Bookmark className="w-3 h-3 mr-1" />
                <span>声が出せない時の「夢プリセット」を試す</span>
              </span>
              {!isManualTextMode && (
                <button
                  onClick={() => setIsManualTextMode(true)}
                  className="text-[11px] underline font-medium cursor-pointer"
                  style={{ color: currentStyle.colors.accent }}
                >
                  キーボードで打つ
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_DREAM_VOICES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer hover:border-current/40 active:scale-98"
                  style={{
                    backgroundColor: currentStyle.colors.bg,
                    borderColor: currentStyle.colors.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs truncate" style={{ color: currentStyle.colors.textPrimary }}>
                      {preset.label}
                    </div>
                    <span 
                      className="text-[9px] px-1.5 py-0.2 rounded border font-mono shrink-0 ml-1"
                      style={{
                        backgroundColor: currentStyle.colors.accent + '15',
                        borderColor: currentStyle.colors.accent + '30',
                        color: currentStyle.colors.accent,
                      }}
                    >
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-65 truncate mt-0.5">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t flex items-center justify-between gap-3" style={{ borderColor: currentStyle.colors.border, backgroundColor: currentStyle.colors.cardBg }}>
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border opacity-70 hover:opacity-100 transition-all cursor-pointer"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            キャンセル
          </button>

          <button
            id="modal-transcribe-proceed-btn"
            onClick={handleProceed}
            disabled={!transcribedText.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentStyle.colors.recordBtnBg,
              color: currentStyle.colors.recordBtnText,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AIで夢カルテ・4コマへ変換</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

