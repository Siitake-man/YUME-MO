/**
 * 声紋・音響特性リアルタイム解析エンジン (Voiceprint & Acoustic Spectrum Analyzer)
 * Web Audio API を活用して、基本周波数(F0)、周波数スペクトル、声質特性（低音・中音・高音）、
 * および寝起きのかすれ声・ぼそぼそ声のエネルギー比率を測定します。
 */

export interface AcousticAnalysisResult {
  f0Hz: number; // 推定基本周波数 (ピッチ)
  pitchCategory: 'low' | 'mid' | 'high'; // 声のトーン
  pitchCategoryLabel: string; // "落ち着いた低音" | "自然な中音域" | "澄んだ高音域"
  clarityScore: number; // 0-100 (子音・明瞭度)
  morningHuskyRatio: number; // 0-100 (寝起き特有のかすれ・ハスキー成分比率)
  rmsVolume: number; // 0-100 (音量)
  spectrumData: number[]; // 周波数ビン (0-255)
  timeDomainData: number[]; // 波形データ
}

export class VoiceprintAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private filterHighpass: BiquadFilterNode | null = null;
  private filterPeaking: BiquadFilterNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isAnalyzing: boolean = false;

  /**
   * マイクストリームに接続してオーディオグラフを構築
   */
  public async start(stream: MediaStream): Promise<void> {
    this.mediaStream = stream;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.source = this.audioCtx.createMediaStreamSource(stream);

    // 寝起き低周波ノイズ（布団擦れ、エアコン振動）をカットするハイパスフィルター
    this.filterHighpass = this.audioCtx.createBiquadFilter();
    this.filterHighpass.type = 'highpass';
    this.filterHighpass.frequency.value = 85;

    // 日本語の子音（サ行・タ行）の明瞭度を補うピーキングフィルター
    this.filterPeaking = this.audioCtx.createBiquadFilter();
    this.filterPeaking.type = 'peaking';
    this.filterPeaking.frequency.value = 2500;
    this.filterPeaking.gain.value = 4.0;
    this.filterPeaking.Q.value = 1.0;

    // 接続: Source -> Highpass -> Peaking -> Analyser
    this.source.connect(this.filterHighpass);
    this.filterHighpass.connect(this.filterPeaking);
    this.filterPeaking.connect(this.analyser);

    this.isAnalyzing = true;
  }

  /**
   * 現在のフレームから声紋パラメータをリアルタイム計算
   */
  public analyzeCurrentFrame(): AcousticAnalysisResult {
    const defaultResult: AcousticAnalysisResult = {
      f0Hz: 0,
      pitchCategory: 'mid',
      pitchCategoryLabel: '待機中',
      clarityScore: 50,
      morningHuskyRatio: 30,
      rmsVolume: 0,
      spectrumData: new Array(32).fill(10),
      timeDomainData: new Array(64).fill(128),
    };

    if (!this.analyser || !this.audioCtx || !this.isAnalyzing) {
      return defaultResult;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.analyser.getByteFrequencyData(freqData);
    this.analyser.getByteTimeDomainData(timeData);

    // 1. RMS音量の計算
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    const rmsVolume = Math.min(100, Math.round(rms * 250));

    // 音が小さすぎる場合は待機状態
    if (rmsVolume < 4) {
      return {
        ...defaultResult,
        spectrumData: Array.from(freqData.slice(0, 32)).map(v => Math.max(8, v)),
        timeDomainData: Array.from(timeData.slice(0, 64)),
      };
    }

    // 2. 自己相関法 (Autocorrelation) による基本周波数 (F0) の推定
    const sampleRate = this.audioCtx.sampleRate;
    const f0Hz = this.calculatePitchAutocorrelation(timeData, sampleRate);

    // 3. ピッチカテゴリの分類
    let pitchCategory: 'low' | 'mid' | 'high' = 'mid';
    let pitchCategoryLabel = '自然な中音域';

    if (f0Hz > 0) {
      if (f0Hz < 140) {
        pitchCategory = 'low';
        pitchCategoryLabel = '落ち着いた低音（男性・寝起きトーン）';
      } else if (f0Hz > 215) {
        pitchCategory = 'high';
        pitchCategoryLabel = '澄んだ高音域（女性・明瞭トーン）';
      } else {
        pitchCategory = 'mid';
        pitchCategoryLabel = '自然な中音域（バランス型）';
      }
    }

    // 4. 周波数帯域ごとのエネルギー分布計算
    // 低域 (80-250Hz), 中域 (250-2000Hz), 高域 (2000-6000Hz)
    const binSize = sampleRate / (bufferLength * 2);
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;

    for (let i = 0; i < bufferLength; i++) {
      const freq = i * binSize;
      const val = freqData[i];
      if (freq >= 80 && freq < 300) lowEnergy += val;
      else if (freq >= 300 && freq < 2000) midEnergy += val;
      else if (freq >= 2000 && freq < 6000) highEnergy += val;
    }

    // ハスキー度・かすれ声度（中高域の子音フォルマントに比べ、基底・息成分が多いか）
    const totalEnergy = lowEnergy + midEnergy + highEnergy + 1;
    const morningHuskyRatio = Math.min(100, Math.round((lowEnergy / totalEnergy) * 120));
    const clarityScore = Math.min(100, Math.round((highEnergy / totalEnergy) * 200) + 30);

    // 簡略化したスペクトログラム用データ (32バンド)
    const sampledSpectrum: number[] = [];
    const step = Math.floor(bufferLength / 32);
    for (let i = 0; i < 32; i++) {
      let bandSum = 0;
      for (let j = 0; j < step; j++) {
        bandSum += freqData[i * step + j];
      }
      sampledSpectrum.push(Math.round(bandSum / step));
    }

    return {
      f0Hz,
      pitchCategory,
      pitchCategoryLabel,
      clarityScore,
      morningHuskyRatio,
      rmsVolume,
      spectrumData: sampledSpectrum,
      timeDomainData: Array.from(timeData.slice(0, 64)),
    };
  }

  /**
   * 自己相関によるピッチ検出アルゴリズム
   */
  private calculatePitchAutocorrelation(timeData: Uint8Array, sampleRate: number): number {
    const SIZE = timeData.length;
    const norm = new Float32Array(SIZE);
    for (let i = 0; i < SIZE; i++) {
      norm[i] = (timeData[i] - 128) / 128;
    }

    // 探索する周波数範囲 (60Hz 〜 400Hz)
    const minPeriod = Math.floor(sampleRate / 400);
    const maxPeriod = Math.floor(sampleRate / 60);

    let bestR = -1;
    let bestPeriod = -1;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let r = 0;
      for (let i = 0; i < SIZE - period; i++) {
        r += norm[i] * norm[i + period];
      }
      r = r / (SIZE - period);

      if (r > bestR && r > 0.35) {
        bestR = r;
        bestPeriod = period;
      }
    }

    if (bestPeriod > 0) {
      return Math.round(sampleRate / bestPeriod);
    }
    return 0;
  }

  /**
   * 停止とリソース解放
   */
  public stop(): void {
    this.isAnalyzing = false;
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.filterHighpass) {
      this.filterHighpass.disconnect();
      this.filterHighpass = null;
    }
    if (this.filterPeaking) {
      this.filterPeaking.disconnect();
      this.filterPeaking = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
