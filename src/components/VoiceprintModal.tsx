import React, { useState, useEffect, useRef } from 'react';
import { VoiceprintProfile, AppSettings } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine } from '../utils/audioEngine';
import { VoiceprintAnalyzer, AcousticAnalysisResult } from '../utils/audioAnalyzer';
import { cleanAndDeduplicateTranscript } from '../utils/textCleaner';
import { 
  Fingerprint, Mic, Volume2, Sparkles, Check, X, Plus, Trash2, 
  RefreshCw, Shield, Sliders, AlertCircle, Play, Square, Activity
} from 'lucide-react';
import { CloseCrossAsset } from './IllustratedAssets';

interface VoiceprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveProfile: (newProfile: VoiceprintProfile) => void;
}

export const VoiceprintModal: React.FC<VoiceprintModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveProfile,
}) => {
  const { currentStyle } = useUIStyle();

  // Local state initialized from existing settings or sensible defaults
  const existing = settings.voiceprintProfile || {
    isCalibrated: false,
    pitchCategory: 'mid',
    estimatedF0Hz: 160,
    morningVoiceBoost: true,
    noiseSuppression: true,
    speakingPace: 'normal',
    frequentKeywords: ['しおちゃん', '水族館', '猫', '会社'],
    autoAiRefinement: true,
  };

  const [profile, setProfile] = useState<VoiceprintProfile>(existing);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationSeconds, setCalibrationSeconds] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<AcousticAnalysisResult | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [testTranscribed, setTestTranscribed] = useState<string>('');
  const [isTestListening, setIsTestListening] = useState<boolean>(false);

  const analyzerRef = useRef<VoiceprintAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const testRecognitionRef = useRef<any>(null);

  // Sync profile when opened
  useEffect(() => {
    if (isOpen) {
      if (settings.voiceprintProfile) {
        setProfile(settings.voiceprintProfile);
      }
      setMicError(null);
      setTestTranscribed('');
      setIsTestListening(false);
    } else {
      stopCalibration();
      stopTestListening();
    }
  }, [isOpen]);

  // Start real-time audio analysis during calibration
  const startCalibration = async () => {
    audioEngine.playMechanicalClick('high');
    setMicError(null);
    setCalibrationSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: false, // We want raw acoustic features
          autoGainControl: true 
        } 
      });
      streamRef.current = stream;

      const analyzer = new VoiceprintAnalyzer();
      await analyzer.start(stream);
      analyzerRef.current = analyzer;
      setIsCalibrating(true);

      const startTime = Date.now();
      const collectedPitches: number[] = [];

      const loop = () => {
        if (!analyzerRef.current) return;
        const result = analyzerRef.current.analyzeCurrentFrame();
        setAnalysisResult(result);

        if (result.f0Hz > 60 && result.f0Hz < 380) {
          collectedPitches.push(result.f0Hz);
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCalibrationSeconds(elapsed);

        // Auto stop after 5 seconds of sample collection
        if (elapsed >= 5) {
          finishCalibration(collectedPitches, result);
          return;
        }

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setMicError('マイクへのアクセスが許可されていません。ブラウザ設定をご確認ください。');
      setIsCalibrating(false);
    }
  };

  const finishCalibration = (pitches: number[], finalFrame: AcousticAnalysisResult) => {
    stopCalibration();
    audioEngine.playMechanicalClick('high');

    // Calculate median pitch
    let medianPitch = profile.estimatedF0Hz || 160;
    if (pitches.length > 5) {
      pitches.sort((a, b) => a - b);
      medianPitch = pitches[Math.floor(pitches.length / 2)];
    }

    let category: 'low' | 'mid' | 'high' = 'mid';
    if (medianPitch < 140) category = 'low';
    else if (medianPitch > 215) category = 'high';

    setProfile(prev => ({
      ...prev,
      isCalibrated: true,
      calibratedAt: new Date().toISOString().split('T')[0],
      estimatedF0Hz: medianPitch,
      pitchCategory: category,
    }));
  };

  const stopCalibration = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (analyzerRef.current) {
      analyzerRef.current.stop();
      analyzerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCalibrating(false);
  };

  // Test speaking with voiceprint correction & deduplication
  const toggleTestListening = () => {
    if (isTestListening) {
      stopTestListening();
      return;
    }

    audioEngine.playMechanicalClick('high');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTestTranscribed('このブラウザは音声認識APIに対応していません。');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP';

    let finalRef = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalRef += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }
      const rawCombined = finalRef + (interim ? ` ${interim}` : '');
      const cleaned = cleanAndDeduplicateTranscript(rawCombined, profile.frequentKeywords);
      setTestTranscribed(cleaned);
    };

    recognition.onerror = () => {
      setIsTestListening(false);
    };

    recognition.onend = () => {
      setIsTestListening(false);
    };

    try {
      recognition.start();
      testRecognitionRef.current = recognition;
      setIsTestListening(true);
      setTestTranscribed('');
    } catch (e) {
      console.warn(e);
    }
  };

  const stopTestListening = () => {
    if (testRecognitionRef.current) {
      try {
        testRecognitionRef.current.stop();
      } catch {}
      testRecognitionRef.current = null;
    }
    setIsTestListening(false);
  };

  // Keyword management
  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (profile.frequentKeywords.includes(trimmed)) {
      setNewKeyword('');
      return;
    }
    audioEngine.playMechanicalClick('high');
    setProfile(prev => ({
      ...prev,
      frequentKeywords: [...prev.frequentKeywords, trimmed],
    }));
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    audioEngine.playMechanicalClick('low');
    setProfile(prev => ({
      ...prev,
      frequentKeywords: prev.frequentKeywords.filter(k => k !== keywordToRemove),
    }));
  };

  const handleSave = () => {
    audioEngine.playMechanicalClick('high');
    onSaveProfile(profile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: currentStyle.colors.border,
          color: currentStyle.colors.textPrimary,
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: currentStyle.colors.border }}>
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: currentStyle.colors.accent + '25',
                color: currentStyle.colors.accent,
              }}
            >
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`${currentStyle.typography.headingFont} text-base font-bold flex items-center space-x-1.5`}>
                <span>声紋プロファイル & 文字起こし高精度化</span>
              </h3>
              <p className="text-[11px] opacity-70">
                声質を学習し、寝起きのかすれ声や固有名詞を正確に認識します
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.playMechanicalClick('low');
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <CloseCrossAsset size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {micError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
          )}

          {/* Section 1: Voiceprint Calibration / Acoustic Measurement */}
          <div 
            className="p-4 rounded-2xl border space-y-3"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">1. 声紋・音響特性のキャリブレーション</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                profile.isCalibrated 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600' 
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-600'
              }`}>
                {profile.isCalibrated ? '声紋登録済み' : '未登録（初期値）'}
              </span>
            </div>

            <p className="text-[11px] opacity-75 leading-relaxed">
              「おはようございます、今朝の夢は…」とマイクに向かって5秒ほど自然な声で話してください。声の基本周波数（ピッチ）と寝起き特有のトーンを測定します。
            </p>

            {/* Visualizer & Pitch Display */}
            <div 
              className="p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 relative overflow-hidden"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
              }}
            >
              {/* Animated Spectrogram Bars */}
              <div className="flex items-end justify-center space-x-1 h-12 w-full max-w-xs">
                {(analysisResult?.spectrumData || new Array(24).fill(12)).slice(0, 24).map((val, idx) => (
                  <div
                    key={idx}
                    className="w-2 rounded-t-sm transition-all duration-75"
                    style={{
                      height: `${Math.max(6, Math.min(48, val / 4))}px`,
                      backgroundColor: isCalibrating 
                        ? currentStyle.colors.accent 
                        : (profile.isCalibrated ? '#10B981' : currentStyle.colors.border),
                      opacity: isCalibrating ? 0.9 : 0.6,
                    }}
                  />
                ))}
              </div>

              {/* Status & Results */}
              <div className="text-center">
                {isCalibrating ? (
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-red-500 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>声紋を測定中... ({5 - calibrationSeconds}秒) お話しください</span>
                  </div>
                ) : (
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold opacity-90">
                      推定ピッチ: {profile.estimatedF0Hz ? `${profile.estimatedF0Hz} Hz` : '未測定'}
                    </span>
                    <span className="opacity-70 text-[11px] block">
                      トーン分類: {
                        profile.pitchCategory === 'low' ? '落ち着いた低音（寝起き・ハスキー）' :
                        profile.pitchCategory === 'high' ? '澄んだ高音域（明瞭）' : '自然な中音域（標準）'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Calibrate Trigger Button */}
              <button
                onClick={isCalibrating ? stopCalibration : startCalibration}
                className="mt-1 py-1.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                style={{
                  backgroundColor: isCalibrating ? '#DC2626' : currentStyle.colors.accent + '20',
                  borderColor: isCalibrating ? '#B91C1C' : currentStyle.colors.accent + '50',
                  color: isCalibrating ? '#FFFFFF' : currentStyle.colors.accent,
                }}
              >
                {isCalibrating ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>測定を終了</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>{profile.isCalibrated ? '声紋を再キャリブレーション' : 'マイクで声紋を測定する'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle options for morning voice & noise filtering */}
            <div className="pt-2 space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors">
                <div className="pr-2">
                  <span className="font-bold block">寝起きの低音・かすれ声ブースト</span>
                  <span className="text-[10px] opacity-70 block">朝一番の小さくぼそぼそした声を増幅し、子音を明瞭化します</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.morningVoiceBoost}
                  onChange={(e) => setProfile(prev => ({ ...prev, morningVoiceBoost: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors">
                <div className="pr-2">
                  <span className="font-bold block">布団擦れ・環境低周波ノイズカット (High-pass)</span>
                  <span className="text-[10px] opacity-70 block">寝返りやエアコンのゴソゴソ低音ノイズをカットして誤認を防止</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.noiseSuppression}
                  onChange={(e) => setProfile(prev => ({ ...prev, noiseSuppression: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-black/5 transition-colors">
                <div className="pr-2">
                  <span className="font-bold block">録音完了時のAI声紋自動補正・重複除去</span>
                  <span className="text-[10px] opacity-70 block">話した内容がループ・反復するバグを全自動で防ぎ、語彙を最適化</span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.autoAiRefinement}
                  onChange={(e) => setProfile(prev => ({ ...prev, autoAiRefinement: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 2: Personal Keywords & Custom Dictionary (Fixes "しおちゃん" proper nouns!) */}
          <div 
            className="p-4 rounded-2xl border space-y-3"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">2. よく登場する人物・固有名詞辞書</span>
              </div>
              <span className="text-[10px] opacity-60 font-mono">
                {profile.frequentKeywords.length}語登録中
              </span>
            </div>

            <p className="text-[11px] opacity-75 leading-relaxed">
              「しおちゃん」のような友人・家族のお名前や、よく夢に出てくる固有の言葉を登録しておくと、AIが音の近さから誤変換（例: 塩ちゃん・潮）を防ぎ、優先的に正確な表記にします。
            </p>

            {/* Keyword tag badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {profile.frequentKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: currentStyle.colors.cardBg,
                    borderColor: currentStyle.colors.accent + '40',
                    color: currentStyle.colors.textPrimary,
                  }}
                >
                  <span>{kw}</span>
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer ml-1 opacity-70 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add new keyword input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="例: しおちゃん, イルカ, 同僚の佐藤"
                className="flex-1 p-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                  color: currentStyle.colors.textPrimary,
                }}
              />
              <button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                className="py-2.5 px-3.5 rounded-xl text-xs font-bold border flex items-center space-x-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                style={{
                  backgroundColor: currentStyle.colors.accent + '20',
                  borderColor: currentStyle.colors.accent + '50',
                  color: currentStyle.colors.accent,
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>追加</span>
              </button>
            </div>
          </div>

          {/* Section 3: Live Speech Test & Deduplication Check */}
          <div 
            className="p-4 rounded-2xl border space-y-2.5"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold">3. 発話テスト & 重複防止チェック</span>
              </div>
              <button
                onClick={toggleTestListening}
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold border flex items-center space-x-1 cursor-pointer transition-all ${
                  isTestListening 
                    ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                    : 'border-current/30 hover:opacity-100 opacity-80'
                }`}
              >
                {isTestListening ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>停止</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-2.5 h-2.5" />
                    <span>テスト発話する</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] opacity-70">
              例：「しおちゃんと水族館に行って新しい魚を見た」と話してみてください。重複ループが解消され、登録ワードが正確に認識されることを確認できます。
            </p>

            <div 
              className="p-3 rounded-xl border text-xs min-h-[48px] flex items-center justify-between font-sans leading-relaxed"
              style={{
                backgroundColor: currentStyle.colors.cardBg,
                borderColor: currentStyle.colors.border,
              }}
            >
              {testTranscribed ? (
                <span className="opacity-95">{testTranscribed}</span>
              ) : (
                <span className="opacity-40 italic">
                  {isTestListening ? '聞き取り中... 話してください' : '「テスト発話する」を押して話すと、ここに表示されます'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex items-center justify-between gap-3"
          style={{ 
            borderColor: currentStyle.colors.border, 
            backgroundColor: currentStyle.colors.cardBg 
          }}
        >
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
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: currentStyle.colors.recordBtnBg,
              color: currentStyle.colors.recordBtnText,
            }}
          >
            <Check className="w-4 h-4" />
            <span>声紋プロファイルを保存</span>
          </button>
        </div>
      </div>
    </div>
  );
};
