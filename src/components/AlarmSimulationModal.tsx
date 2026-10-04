import React, { useState, useEffect } from 'react';
import { Bell, Mic, X, Moon, Sun, Sparkles, Volume2 } from 'lucide-react';
import { AppSettings } from '../types';
import { audioEngine, ALARM_SOUND_PRESETS } from '../utils/audioEngine';
import { SparkleAsset } from './IllustratedAssets';

interface AlarmSimulationModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onDismissAndRecord: () => void;
  onDismissOnly: () => void;
}

export const AlarmSimulationModal: React.FC<AlarmSimulationModalProps> = ({
  isOpen,
  settings,
  onDismissAndRecord,
  onDismissOnly,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Start playing the chosen alarm sound loop!
    const soundId = settings.alarmSound || 'musicbox_lullaby';
    const volume = settings.alarmVolume ?? 0.7;
    audioEngine.startAlarmLoop(soundId, volume, settings.customAlarmAudio);

    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 700);

    return () => {
      clearInterval(interval);
      audioEngine.stopAlarm();
    };
  }, [isOpen, settings.alarmSound, settings.alarmVolume, settings.customAlarmAudio]);

  const handleStopAndRecord = () => {
    audioEngine.stopAlarm();
    audioEngine.playMechanicalClick('high');
    onDismissAndRecord();
  };

  const handleStopOnly = () => {
    audioEngine.stopAlarm();
    audioEngine.playMechanicalClick('low');
    onDismissOnly();
  };

  if (!isOpen) return null;

  // Sound preset display name
  const currentPreset = ALARM_SOUND_PRESETS.find(p => p.id === settings.alarmSound);
  const soundLabel = settings.alarmSound === 'custom'
    ? (settings.customAlarmLabel || 'お気に入り録音音声')
    : (currentPreset ? currentPreset.name : 'オルゴール夢うつつ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-linear-to-b from-[#1c2237] to-[#252D4B] text-[#F5F0E8] rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Morning Icon Glow */}
        <div className="relative mt-2">
          <div className={`w-24 h-24 rounded-full bg-[#D2725E]/20 flex items-center justify-center transition-transform duration-700 ${pulse ? 'scale-110' : 'scale-95'}`}>
            <div className="w-16 h-16 rounded-full bg-[#D2725E] flex items-center justify-center shadow-lg text-white">
              <Bell className={`w-8 h-8 ${pulse ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1">
            <Sun className="w-6 h-6 text-[#D2725E] animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        {/* Current Alarm Time & Sound Indicator */}
        <div className="space-y-1.5">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
            {settings.alarmTime}
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-200">
            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-medium">鳴動中：{soundLabel}</span>
          </div>
          <p className="text-xs text-[#BDB1D5] font-medium pt-0.5">
            おはようございます。朝の時間がやってきました。
          </p>
        </div>

        {/* Core Prompt */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 text-xs text-[#F5F0E8]/90 leading-relaxed space-y-1">
          <p className="font-bold text-white text-sm">
            「起きたら、夢をひとこと。」
          </p>
          <p className="text-[#BDB1D5]">
            消えてしまう前に、声で記録してみませんか？
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {/* Main Action: Stop Alarm & Record Dream */}
          <button
            id="alarm-stop-and-record-btn"
            onClick={handleStopAndRecord}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#D2725E] hover:bg-[#bd6350] active:scale-98 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span>アラームを止めて、夢を話す</span>
          </button>

          {/* Secondary Action: Just Stop */}
          <button
            onClick={handleStopOnly}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 text-white/70 text-xs font-medium transition-all cursor-pointer"
          >
            アラームだけ止める（夢は覚えていない）
          </button>
        </div>
      </div>
    </div>
  );
};
