import React, { useState, useRef, useEffect } from 'react';
import { AppSettings, AlarmSoundId } from '../types';
import { useUIStyle } from '../context/UIStyleContext';
import { audioEngine, ALARM_SOUND_PRESETS, AlarmPresetInfo } from '../utils/audioEngine';
import { 
  Volume2, VolumeX, Play, Square, Mic, MicOff, Check, Sparkles, 
  Sun, Radio, Moon, Coffee, Smile, Music, RotateCcw, AlertCircle
} from 'lucide-react';
import { CuteStamp } from './PlayfulAccents';
import { SparkleAsset } from './IllustratedAssets';

interface AlarmSoundSelectorProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const AlarmSoundSelector: React.FC<AlarmSoundSelectorProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const { currentStyle } = useUIStyle();
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Custom recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [customAudioBase64, setCustomAudioBase64] = useState<string | null>(
    settings.customAlarmAudio || null
  );
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      audioEngine.stopPreview();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Icon mapping
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Radio': return <Radio className="w-4 h-4 text-red-500" />;
      case 'Moon': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'Coffee': return <Coffee className="w-4 h-4 text-emerald-500" />;
      case 'Smile': return <Smile className="w-4 h-4 text-violet-500" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  /** 試聴プレビューの切り替え */
  const togglePlayPreset = (presetId: string) => {
    if (playingId === presetId) {
      audioEngine.stopPreview();
      setPlayingId(null);
      return;
    }

    audioEngine.stopPreview();
    setPlayingId(presetId);
    audioEngine.previewAlarmSound(
      presetId,
      settings.alarmVolume ?? 0.7,
      undefined,
      () => setPlayingId(null)
    );
  };

  /** カスタム録音の試聴 */
  const togglePlayCustom = () => {
    if (!customAudioBase64) return;
    if (playingId === 'custom') {
      audioEngine.stopPreview();
      setPlayingId(null);
      return;
    }

    audioEngine.stopPreview();
    setPlayingId('custom');
    audioEngine.previewAlarmSound(
      'custom',
      settings.alarmVolume ?? 0.7,
      customAudioBase64,
      () => setPlayingId(null)
    );
  };

  /** 音声選択 */
  const handleSelectSound = (soundId: AlarmSoundId) => {
    audioEngine.playMechanicalClick('high');
    onUpdateSettings({
      ...settings,
      alarmSound: soundId,
    });
  };

  /** 音量変更 */
  const handleVolumeChange = (vol: number) => {
    onUpdateSettings({
      ...settings,
      alarmVolume: vol,
    });
  };

  // =========================================================================
  // Custom Voice Recording (お気に入りの音声・言葉を目覚ましに録音)
  // =========================================================================

  const startRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('マイク録音がサポートされていないブラウザです');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(blobUrl);

        // Convert to Base64 for persistent storage in settings
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setCustomAudioBase64(base64data);
          // Auto select custom sound
          onUpdateSettings({
            ...settings,
            alarmSound: 'custom',
            customAlarmAudio: base64data,
            customAlarmLabel: '私のお気に入り録音音声',
          });
          audioEngine.playCelestialCrystal();
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            // Cap recording at 15 seconds
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setRecordingError('マイクのアクセスが許可されていません');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDeleteCustomVoice = () => {
    audioEngine.playMechanicalClick('low');
    setCustomAudioBase64(null);
    setRecordedBlobUrl(null);
    onUpdateSettings({
      ...settings,
      alarmSound: settings.alarmSound === 'custom' ? 'musicbox_lullaby' : settings.alarmSound,
      customAlarmAudio: undefined,
      customAlarmLabel: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Sound Volume Slider */}
      <div 
        className="p-3.5 rounded-2xl border space-y-2"
        style={{
          backgroundColor: currentStyle.colors.bg,
          borderColor: currentStyle.colors.border,
        }}
      >
        <div className="flex items-center justify-between text-xs font-bold" style={{ color: currentStyle.colors.textPrimary }}>
          <span className="flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4" style={{ color: currentStyle.colors.accent }} />
            <span>アラーム音量設定</span>
          </span>
          <span className="font-mono">{Math.round((settings.alarmVolume ?? 0.7) * 100)} %</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.alarmVolume ?? 0.7}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-[#A84432] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] opacity-60">
          <span>ささやき（控えめ）</span>
          <span>標準</span>
          <span>しっかり起床</span>
        </div>
      </div>

      {/* Preset Alarm Sounds List */}
      <div className="space-y-2">
        <label className="text-xs font-bold block" style={{ color: currentStyle.colors.textPrimary }}>
          目覚まし音の選択（プリセット音源）
        </label>

        <div className="grid grid-cols-1 gap-2">
          {ALARM_SOUND_PRESETS.map((preset) => {
            const isSelected = settings.alarmSound === preset.id;
            const isPlaying = playingId === preset.id;

            return (
              <div
                key={preset.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected ? 'ring-2 shadow-xs' : 'hover:opacity-90'
                }`}
                style={{
                  backgroundColor: isSelected ? currentStyle.colors.cardBg : currentStyle.colors.bg,
                  borderColor: isSelected ? currentStyle.colors.accent : currentStyle.colors.border,
                }}
              >
                {/* Select Radio click area */}
                <button
                  onClick={() => handleSelectSound(preset.id as AlarmSoundId)}
                  className="flex items-start space-x-3 text-left flex-1 cursor-pointer"
                >
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      backgroundColor: isSelected ? currentStyle.colors.accent + '20' : currentStyle.colors.border,
                    }}
                  >
                    {renderIcon(preset.iconName)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold" style={{ color: currentStyle.colors.textPrimary }}>
                        {preset.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/5 opacity-70">
                        {preset.mood}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-70 leading-snug line-clamp-1">
                      {preset.desc}
                    </p>
                  </div>
                </button>

                {/* Preview Play/Stop Button */}
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => togglePlayPreset(preset.id)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-2xs"
                    style={{
                      backgroundColor: isPlaying ? currentStyle.colors.accent : currentStyle.colors.cardBg,
                      borderColor: currentStyle.colors.border,
                      color: isPlaying ? '#FFFFFF' : currentStyle.colors.textPrimary,
                    }}
                    title={isPlaying ? '停止' : '試聴する'}
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  {/* Radio indicator */}
                  <button
                    onClick={() => handleSelectSound(preset.id as AlarmSoundId)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      isSelected ? 'border-2' : 'opacity-40'
                    }`}
                    style={{
                      borderColor: isSelected ? currentStyle.colors.accent : currentStyle.colors.border,
                    }}
                  >
                    {isSelected && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: currentStyle.colors.accent }}
                      />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Voice Recording Section (自分の気に入った音声を目覚ましにする機能) */}
      <div 
        className="p-4 rounded-2xl border shadow-xs space-y-3 transition-colors"
        style={{
          backgroundColor: currentStyle.colors.cardBg,
          borderColor: settings.alarmSound === 'custom' ? currentStyle.colors.accent : currentStyle.colors.border,
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
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs">マイ録音音声を目覚ましに設定</span>
              <span className="text-[10px] opacity-70 block">自分の声や大切な人のメッセージをアラームに</span>
            </div>
          </div>

          <CuteStamp text="特製" color="#D97706" />
        </div>

        {/* Existing Custom Recording Card */}
        {customAudioBase64 ? (
          <div 
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: currentStyle.colors.bg,
              borderColor: currentStyle.colors.border,
            }}
          >
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => handleSelectSound('custom')}
                className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                  settings.alarmSound === 'custom' ? 'border-2' : 'opacity-40'
                }`}
                style={{
                  borderColor: settings.alarmSound === 'custom' ? currentStyle.colors.accent : currentStyle.colors.border,
                }}
              >
                {settings.alarmSound === 'custom' && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentStyle.colors.accent }} />
                )}
              </button>
              <div>
                <span className="text-xs font-bold block" style={{ color: currentStyle.colors.textPrimary }}>
                  {settings.customAlarmLabel || '録音された音声アラーム'}
                </span>
                <span className="text-[10px] text-green-600 font-medium">
                  {settings.alarmSound === 'custom' ? '目覚まし音に選択中' : 'タップして目覚ましに設定'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlayCustom}
                className="w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer shadow-2xs"
                style={{
                  backgroundColor: playingId === 'custom' ? currentStyle.colors.accent : currentStyle.colors.cardBg,
                  borderColor: currentStyle.colors.border,
                  color: playingId === 'custom' ? '#FFFFFF' : currentStyle.colors.textPrimary,
                }}
                title={playingId === 'custom' ? '停止' : '再生'}
              >
                {playingId === 'custom' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleDeleteCustomVoice}
                className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity cursor-pointer text-xs"
                title="音声を削除"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Record New Custom Alarm Voice Button */}
        <div className="pt-1">
          {isRecording ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-2 text-red-600 font-bold text-xs">
                <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                <span>録音中… ({recordingSeconds}s / 最大15秒)</span>
              </div>
              <button
                onClick={stopRecording}
                className="py-1.5 px-3 bg-red-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-red-700 active:scale-95"
              >
                録音完了
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer hover:opacity-90 active:scale-98"
              style={{
                backgroundColor: currentStyle.colors.bg,
                borderColor: currentStyle.colors.border,
                color: currentStyle.colors.textPrimary,
              }}
            >
              <Mic className="w-3.5 h-3.5" style={{ color: currentStyle.colors.accent }} />
              <span>{customAudioBase64 ? '別の声を新しく再録音する' : '声や好きな音を録音して目覚ましにする'}</span>
            </button>
          )}

          {recordingError && (
            <p className="text-[11px] text-red-500 flex items-center mt-1.5">
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              <span>{recordingError}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
