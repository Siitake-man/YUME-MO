import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Sparkles, ChevronUp, ChevronDown, Check, Wand2, X } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import { BakuMascot, HitsujiMascot } from './DreamMascots';
import { SparkleAsset, SoundWaveRibbon, MangaFrameEmblem, MiniCassetteAsset, CloseCrossAsset } from './IllustratedAssets';
import { RetroAnimeBoombox } from './RetroAnimeBoombox';
import { DreamRecord } from '../types';

interface VoiceRecordingWidgetProps {
  onSaveDream: (dream: DreamRecord) => void;
  onOpenFullModal: () => void;
  className?: string;
}

export const VoiceRecordingWidget: React.FC<VoiceRecordingWidgetProps> = ({
  onSaveDream,
  onOpenFullModal,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [selectedMascot, setSelectedMascot] = useState<'baku' | 'hitsuji'>('baku');
  const [showBoomboxMode, setShowBoomboxMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick dream sample prompts if microphone not spoken into
  const sampleDreamTranscripts = [
    '大きな空飛ぶクジラの背中に乗って、雲の上の喫茶店で星のサイダーを飲んだ。',
    '猫たちがみんな二足歩行でスーツを着て、朝礼で歌を歌っていた。',
    '子供の頃住んでいた家の庭から、なぜか見知らぬ宇宙ステーションにつながっていた。',
  ];

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    audioEngine.playMechanicalClick('high');
    audioEngine.startTapeHiss();
    setTranscript('');
    setRecordingTime(0);
    setIsRecording(true);
    setIsExpanded(true);

    // Provide mock transcription progress
    setTimeout(() => {
      setTranscript('「…目が覚めたら、');
    }, 1500);
    setTimeout(() => {
      setTranscript('「…目が覚めたら、青い光の列車に乗っていて、');
    }, 3500);
    setTimeout(() => {
      const pick = sampleDreamTranscripts[Math.floor(Math.random() * sampleDreamTranscripts.length)];
      setTranscript(pick);
    }, 6000);
  };

  const handleStopRecording = () => {
    audioEngine.playMechanicalClick('low');
    audioEngine.stopTapeHiss();
    setIsRecording(false);
    if (!transcript) {
      const pick = sampleDreamTranscripts[Math.floor(Math.random() * sampleDreamTranscripts.length)];
      setTranscript(pick);
    }
  };

  const handleQuickSave = () => {
    if (!transcript.trim()) return;
    setIsSaving(true);
    audioEngine.playChime();

    setTimeout(() => {
      const now = new Date();
      const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

      const newDream: DreamRecord = {
        id: `dream_${Date.now()}`,
        createdAt: new Date().toISOString(),
        timeLabel,
        dateLabel,
        rawTranscription: transcript,
        title: '目覚めたての記憶',
        summary: transcript,
        category: '空想・SF',
        characters: ['バクくん', '星耳うさぎ'],
        places: ['夜明けの雲の上'],
        motifs: ['空', 'クジラ', '朝の光'],
        mood: ['おだやか', '神秘的'],
        parameters: {
          surrealism: 78,
          workFactor: 10,
          catFactor: 25,
          floatiness: 85,
          logicBreak: 45,
          vividness: 80,
        },
        shareCopy: `【今朝の夢】${transcript.slice(0, 40)}… #夢のあと`,
        isPublic: false,
      };

      onSaveDream(newDream);
      setIsSaving(false);
      setTranscript('');
      setRecordingTime(0);
      setIsExpanded(false);
    }, 600);
  };

  return (
    <aside 
      aria-label="音声録音クイックウィジェット"
      className={`fixed bottom-16 sm:bottom-20 right-2 sm:right-6 z-50 transition-all duration-300 ${className}`}
    >
      {!isExpanded ? (
        /* Minimized Floating Pill Widget */
        <div 
          onClick={() => {
            audioEngine.playMechanicalClick('high');
            setIsExpanded(true);
          }}
          className="flex items-center space-x-2 bg-[#252D4B]/95 hover:bg-[#2F395E] dark:bg-[#1A2234]/95 text-white px-3.5 py-2.5 rounded-full border-2 border-[#D97706]/70 shadow-[0_8px_20px_rgba(0,0,0,0.4)] cursor-pointer backdrop-blur-md transform hover:scale-105 active:scale-95 transition-all group"
        >
          {/* Animated Mini Cassette Spool */}
          <div className="w-5 h-5 rounded-full border border-amber-400 bg-neutral-900 flex items-center justify-center relative">
            <div className={`w-2 h-2 rounded-full bg-amber-400 ${isRecording ? 'animate-ping' : ''}`} />
            <div className="absolute w-0.5 h-3.5 bg-amber-400/60 rounded" />
            <div className="absolute w-3.5 h-0.5 bg-amber-400/60 rounded" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-handwriting font-bold text-amber-200">
                夢ウィジェット
              </span>
              <SparkleAsset size={12} />
            </div>
            <span className="text-[9px] text-neutral-300 font-sans">
              {isRecording ? `録音中 ${recordingTime}s` : '起きたら即タップ'}
            </span>
          </div>

          {/* Quick Record Direct Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isRecording) handleStopRecording();
              else handleStartRecording();
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
              isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-400 text-neutral-900 hover:scale-110'
            }`}
          >
            {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        /* Expanded Floating Voice Station Card */
        <div className="w-[340px] sm:w-[380px] bg-white/95 dark:bg-[#141A26]/95 backdrop-blur-lg rounded-3xl border-2 border-[#D8C7B5] dark:border-[#2E3B52] shadow-[0_16px_36px_rgba(0,0,0,0.4)] p-4 text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-dashed border-neutral-300 dark:border-neutral-700">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-400 flex items-center justify-center">
                <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
              </div>
              <span className="font-handwriting font-bold text-sm text-neutral-800 dark:text-neutral-200">
                起きたて音声ウィジェット
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Toggle Retro Anime Boombox View */}
              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('high');
                  setShowBoomboxMode((prev) => !prev);
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border transition-all cursor-pointer flex items-center space-x-1 ${
                  showBoomboxMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                }`}
              >
                {showBoomboxMode ? (
                  <span>簡易表示</span>
                ) : (
                  <>
                    <MiniCassetteAsset size={13} />
                    <span>ラジカセ</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  audioEngine.playMechanicalClick('low');
                  setIsExpanded(false);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Boombox Mode vs Mascot Quick Mode */}
          {showBoomboxMode ? (
            <div className="py-2">
              <RetroAnimeBoombox
                isRecording={isRecording}
                isPlaying={false}
                onRecordToggle={() => {
                  if (isRecording) handleStopRecording();
                  else handleStartRecording();
                }}
                tapeTitle="QUICK VOICE TAPE"
              />
            </div>
          ) : (
            <div className="py-3 flex flex-col items-center">
              {/* Mascot Reaction Display */}
              <div className="flex items-center justify-center mb-2">
                {selectedMascot === 'baku' ? (
                  <BakuMascot
                    size="sm"
                    isWalking={isRecording}
                    showSpeech={true}
                    speechText={isRecording ? '耳をすまして採集中♪' : '起きたての言葉を聞かせてね'}
                  />
                ) : (
                  <HitsujiMascot
                    size="sm"
                    isWalking={isRecording}
                    showSpeech={true}
                    speechText={isRecording ? 'メェ〜♪ 記憶あつめ中' : '羊が一匹… 夢はどうだった？'}
                  />
                )}
              </div>

              {/* Real-time Sound Wave Ribbon & Timer */}
              <div className="w-full flex items-center justify-between px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <SoundWaveRibbon isRecording={isRecording} className="flex-1" />
                <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 ml-2">
                  {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                  {String(recordingTime % 60).padStart(2, '0')}
                </span>
              </div>

              {/* Big Record Push Button */}
              <div className="mt-3 flex items-center justify-center space-x-3">
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md border-2 transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-500 border-rose-300 text-white animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-300 border-neutral-800 text-neutral-900 hover:scale-105'
                  }`}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <div className="text-left">
                  <div className="font-handwriting font-bold text-xs text-neutral-800 dark:text-neutral-200">
                    {isRecording ? '録音中…（タップで完了）' : 'ワンタップで録音開始'}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-cute">
                    ベッドの中でつぶやくだけでOK
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript / Captured text preview */}
          {transcript && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-handwriting text-neutral-800 dark:text-neutral-200 leading-relaxed max-h-24 overflow-y-auto">
              <span className="font-bold text-amber-700 dark:text-amber-400 block text-[10px] mb-0.5">
                採集された夢の言葉：
              </span>
              {transcript}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between space-x-2">
            <button
              onClick={() => {
                audioEngine.playMechanicalClick('high');
                setIsExpanded(false);
                onOpenFullModal();
              }}
              className="text-[11px] font-handwriting text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:underline cursor-pointer"
            >
              詳細モーダルを開く →
            </button>

            <button
              disabled={!transcript || isSaving}
              onClick={handleQuickSave}
              className={`px-3 py-1.5 rounded-xl font-handwriting font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                transcript && !isSaving
                  ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-md hover:scale-105'
                  : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 cursor-not-allowed'
              }`}
            >
              <MangaFrameEmblem size={14} />
              <span>{isSaving ? '保存中…' : '夢を保存 & 4コマ化'}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
