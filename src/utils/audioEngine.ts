// Web Audio API Sound Generator for Theme-specific acoustics, Mechanical clicks, Ambient layers, and Customizable Alarm Tones

export interface AlarmPresetInfo {
  id: string;
  name: string;
  desc: string;
  iconName: string;
  mood: string;
}

export const ALARM_SOUND_PRESETS: AlarmPresetInfo[] = [
  {
    id: 'musicbox_lullaby',
    name: 'オルゴール夢うつつ',
    desc: 'まどろみから優しく目覚める、ゆったりとした星のオルゴールメロディ',
    iconName: 'Sparkles',
    mood: '癒やし・穏やか',
  },
  {
    id: 'morning_birds',
    name: '森の朝露と小鳥',
    desc: '森の清々しい朝露と小鳥のさえずり、爽やかな目覚めのベル',
    iconName: 'Sun',
    mood: '爽快・自然',
  },
  {
    id: 'retro_digital',
    name: '昭和レトロ電子アラーム',
    desc: '80年代の目覚まし時計を想起させる、温かみのあるピピッ音',
    iconName: 'Radio',
    mood: 'ノスタルジー・確実',
  },
  {
    id: 'celestial_dawn',
    name: '星辰の夜明けアンビエント',
    desc: '満天の星が朝の光に溶けていくような、幻想的な空間シンセベル',
    iconName: 'Moon',
    mood: '幻想・静謐',
  },
  {
    id: 'capybara_shishiodoshi',
    name: 'カピバラ温泉・竹のししおどし',
    desc: 'カコーン…と澄んだ竹の響きと、温泉の湯けむりのような心地よい鐘の音',
    iconName: 'Coffee',
    mood: '和み・温泉',
  },
  {
    id: 'baku_fanfare',
    name: 'バクの快眠ファンファーレ',
    desc: '夢を美味しく食べたバクくんがお見送りしてくれる、軽やかな朝の調べ',
    iconName: 'Smile',
    mood: '元気・ユーモア',
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private tapeHissNode: AudioNode | null = null;
  private tapeHissGain: GainNode | null = null;

  // Alarm loop state
  private alarmInterval: number | null = null;
  private isAlarmActive: boolean = false;
  private currentAlarmAudioEl: HTMLAudioElement | null = null;

  // Preview state
  private previewInterval: number | null = null;
  private isPreviewActive: boolean = false;
  private currentPreviewAudioEl: HTMLAudioElement | null = null;

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ==========================================================================
  // 1. THEME-SPECIFIC SOUND EFFECTS (各画面テーマ特有のサウンド)
  // ==========================================================================

  /** 和紙手帖テーマ：和紙をめくるサワッとした空気感と繊維の音 */
  public playWashiPageTurn() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pink-like soft paper rustle noise
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch (e) {
      console.debug('Washi sound error:', e);
    }
  }

  /** 星辰天球・タロットテーマ：きらめく星のクリスタル・チェレスタ音 */
  public playCelestialCrystal() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

        const startTime = ctx.currentTime + idx * 0.04;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.09, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch (e) {
      console.debug('Celestial sound error:', e);
    }
  }

  /** 昭和カセットテーマ：アナログ機器の確かなスイッチクリックと磁気タッチ音 */
  public playVintageCassetteClick() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.debug('Vintage click error:', e);
    }
  }

  /** 記憶標本テーマ：標本ガラス瓶の微かなチリンという共鳴と水滴の響き */
  public playSpecimenGlassChime() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      // 1. Crystal glass rim resonance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2489.02, ctx.currentTime); // Eb7
      osc.frequency.exponentialRampToValueAtTime(2480, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);

      // 2. Soft water drop resonance
      const oscDrop = ctx.createOscillator();
      const gainDrop = ctx.createGain();
      oscDrop.type = 'sine';
      oscDrop.frequency.setValueAtTime(600, ctx.currentTime + 0.03);
      oscDrop.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gainDrop.gain.setValueAtTime(0.08, ctx.currentTime + 0.03);
      gainDrop.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

      oscDrop.connect(gainDrop);
      gainDrop.connect(ctx.destination);
      oscDrop.start(ctx.currentTime + 0.03);
      oscDrop.stop(ctx.currentTime + 0.22);
    } catch (e) {
      console.debug('Specimen chime error:', e);
    }
  }

  /** テーマのIDに応じた最適なサウンドを鳴らす */
  public playThemeSound(themeId: string, kind: 'tap' | 'open' | 'action' | 'nav' = 'tap') {
    switch (themeId) {
      case 'washi':
        if (kind === 'open' || kind === 'action') {
          this.playWashiPageTurn();
        } else {
          this.playMechanicalClick('high');
        }
        break;
      case 'midnight':
        this.playCelestialCrystal();
        break;
      case 'vintage':
        this.playVintageCassetteClick();
        break;
      case 'pastel':
        this.playSpecimenGlassChime();
        break;
      default:
        this.playMechanicalClick('high');
        break;
    }
  }

  // ==========================================================================
  // 2. TACTILE UI SOUNDS (既存互換)
  // ==========================================================================

  public playMechanicalClick(pitch: 'high' | 'low' = 'low') {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch === 'high' ? 1200 : 450, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch === 'high' ? 180 : 90, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.debug('Audio not supported or blocked:', e);
    }
  }

  public playMorningChime() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  public play8BitJingle() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.1);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  public playChime() {
    try {
      const ctx = this.initCtx();
      if (!ctx) return;

      const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.85);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  public startTapeHiss() {
    try {
      const ctx = this.initCtx();
      if (!ctx || this.tapeHissNode) return;

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.tapeHissNode = noise;
      this.tapeHissGain = gain;
    } catch (e) {
      console.debug('Tape hiss error:', e);
    }
  }

  public stopTapeHiss() {
    try {
      if (this.tapeHissNode) {
        (this.tapeHissNode as AudioBufferSourceNode).stop();
        this.tapeHissNode.disconnect();
        this.tapeHissNode = null;
      }
    } catch (e) {
      // ignore
    }
  }

  // ==========================================================================
  // 3. ALARM TONES ENGINE (目覚まし音合成＆カスタム録音再生)
  // ==========================================================================

  /** 1回分のアラームフレーズを鳴らす内部ヘルパー */
  private playOnePhrase(soundId: string, volume: number = 0.7) {
    const ctx = this.initCtx();
    if (!ctx) return;

    const baseVol = Math.max(0.05, Math.min(1.0, volume));

    switch (soundId) {
      case 'musicbox_lullaby': {
        // オルゴール夢うつつ: C - E - G - B - C - G - E - C
        const melody = [523.25, 659.25, 783.99, 987.77, 1046.5, 783.99, 659.25, 523.25];
        melody.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.22);

          const st = ctx.currentTime + idx * 0.22;
          gain.gain.setValueAtTime(0, st);
          gain.gain.linearRampToValueAtTime(0.22 * baseVol, st + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(st);
          osc.stop(st + 0.75);
        });
        break;
      }

      case 'morning_birds': {
        // 森の朝露と小鳥: 鳥のさえずり（周波数変調）+ 朝のベル
        for (let i = 0; i < 3; i++) {
          const chirpTime = ctx.currentTime + i * 0.35;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(2600 + i * 150, chirpTime);
          osc.frequency.exponentialRampToValueAtTime(3400 + i * 100, chirpTime + 0.06);
          osc.frequency.exponentialRampToValueAtTime(2400, chirpTime + 0.12);

          gain.gain.setValueAtTime(0, chirpTime);
          gain.gain.linearRampToValueAtTime(0.18 * baseVol, chirpTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.14);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(chirpTime);
          osc.stop(chirpTime + 0.15);
        }
        // 朝のベル
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(880, ctx.currentTime + 1.1);
        bellGain.gain.setValueAtTime(0.2 * baseVol, ctx.currentTime + 1.1);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
        bell.connect(bellGain);
        bellGain.connect(ctx.destination);
        bell.start(ctx.currentTime + 1.1);
        bell.stop(ctx.currentTime + 2.1);
        break;
      }

      case 'retro_digital': {
        // 昭和レトロ電子アラーム: ピッピッピッ… ピッピッピッ…
        [0, 0.14, 0.28, 0.6, 0.74, 0.88].forEach((t) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'square';
          osc.frequency.setValueAtTime(2048, ctx.currentTime + t);

          gain.gain.setValueAtTime(0.14 * baseVol, ctx.currentTime + t);
          gain.gain.setValueAtTime(0.0001, ctx.currentTime + t + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.09);
        });
        break;
      }

      case 'celestial_dawn': {
        // 星辰の夜明けアンビエント: 豊かなコード（F# - A# - C# - F）
        const freqs = [369.99, 466.16, 554.37, 698.46, 1108.73];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);

          const st = ctx.currentTime + idx * 0.08;
          gain.gain.setValueAtTime(0, st);
          gain.gain.linearRampToValueAtTime(0.16 * baseVol, st + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, st + 2.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(st);
          osc.stop(st + 2.3);
        });
        break;
      }

      case 'capybara_shishiodoshi': {
        // カピバラ温泉・竹のししおどし: コーン…（木打音＋リバーブ感）＋水滴
        const oscBamboo = ctx.createOscillator();
        const gainBamboo = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(820, ctx.currentTime);
        filter.Q.setValueAtTime(5, ctx.currentTime);

        oscBamboo.type = 'triangle';
        oscBamboo.frequency.setValueAtTime(420, ctx.currentTime);
        oscBamboo.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

        gainBamboo.gain.setValueAtTime(0.45 * baseVol, ctx.currentTime);
        gainBamboo.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

        oscBamboo.connect(filter);
        filter.connect(gainBamboo);
        gainBamboo.connect(ctx.destination);

        oscBamboo.start();
        oscBamboo.stop(ctx.currentTime + 0.5);

        // 澄んだ風鈴
        [1.0, 1.3].forEach((offset, idx) => {
          const oscChime = ctx.createOscillator();
          const gainChime = ctx.createGain();
          oscChime.type = 'sine';
          oscChime.frequency.setValueAtTime(idx === 0 ? 1760 : 2093, ctx.currentTime + offset);
          gainChime.gain.setValueAtTime(0.15 * baseVol, ctx.currentTime + offset);
          gainChime.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.8);
          oscChime.connect(gainChime);
          gainChime.connect(ctx.destination);
          oscChime.start(ctx.currentTime + offset);
          oscChime.stop(ctx.currentTime + offset + 0.85);
        });
        break;
      }

      case 'baku_fanfare': {
        // バクの快眠ファンファーレ: 明るいメジャー3和音の上昇
        const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.12);

          const st = ctx.currentTime + idx * 0.12;
          gain.gain.setValueAtTime(0, st);
          gain.gain.linearRampToValueAtTime(0.24 * baseVol, st + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, st + (idx === 4 ? 1.4 : 0.4));

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(st);
          osc.stop(st + (idx === 4 ? 1.5 : 0.45));
        });
        break;
      }

      default:
        this.playMorningChime();
        break;
    }
  }

  /**
   * アラームの鳴動開始（ループ再生）
   */
  public startAlarmLoop(soundId: string, volume: number = 0.7, customAudioUrl?: string) {
    this.stopAlarmLoop();
    this.isAlarmActive = true;

    // カスタム録音音声がある場合
    if (soundId === 'custom' && customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.loop = true;
        audio.volume = Math.max(0.1, Math.min(1.0, volume));
        audio.play().catch((err) => {
          console.debug('Custom alarm audio playback error, fallback to chime:', err);
          this.playOnePhrase('morning_birds', volume);
        });
        this.currentAlarmAudioEl = audio;
        return;
      } catch (e) {
        console.debug('Failed to play custom audio:', e);
      }
    }

    // シンセサイザー音源の場合：一定間隔でループ
    this.playOnePhrase(soundId, volume);
    const intervalMs = soundId === 'retro_digital' ? 1400 : 2600;
    this.alarmInterval = window.setInterval(() => {
      if (!this.isAlarmActive) return;
      this.playOnePhrase(soundId, volume);
    }, intervalMs);
  }

  /** アラームの停止 */
  public stopAlarmLoop() {
    this.isAlarmActive = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.currentAlarmAudioEl) {
      this.currentAlarmAudioEl.pause();
      this.currentAlarmAudioEl.currentTime = 0;
      this.currentAlarmAudioEl = null;
    }
  }

  /** アラームの停止 (stopAlarmLoopの別名) */
  public stopAlarm() {
    this.stopAlarmLoop();
  }

  /** 試聴用プレビュー（1回鳴らす、または一定時間プレビュー） */
  public previewAlarmSound(soundId: string, volume: number = 0.7, customAudioUrl?: string, onEnd?: () => void) {
    this.stopPreview();
    this.isPreviewActive = true;

    if (soundId === 'custom' && customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audio.volume = Math.max(0.1, Math.min(1.0, volume));
        audio.onended = () => {
          this.isPreviewActive = false;
          if (onEnd) onEnd();
        };
        audio.play().catch(() => {
          this.isPreviewActive = false;
          if (onEnd) onEnd();
        });
        this.currentPreviewAudioEl = audio;
        return;
      } catch (e) {
        this.isPreviewActive = false;
        if (onEnd) onEnd();
        return;
      }
    }

    // 1フレーズ再生
    this.playOnePhrase(soundId, volume);
    const duration = soundId === 'retro_digital' ? 1200 : 2500;
    setTimeout(() => {
      this.isPreviewActive = false;
      if (onEnd) onEnd();
    }, duration);
  }

  public stopPreview() {
    this.isPreviewActive = false;
    if (this.previewInterval !== null) {
      clearInterval(this.previewInterval);
      this.previewInterval = null;
    }
    if (this.currentPreviewAudioEl) {
      this.currentPreviewAudioEl.pause();
      this.currentPreviewAudioEl.currentTime = 0;
      this.currentPreviewAudioEl = null;
    }
  }
}

export const audioEngine = new AudioEngine();
