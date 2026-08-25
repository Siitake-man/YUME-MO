// Web Audio API Sound Generator for Vintage Tape clicks, Ambient Hiss, and Alarm Chimes

class AudioEngine {
  private ctx: AudioContext | null = null;
  private tapeHissNode: AudioNode | null = null;
  private tapeHissGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Mechanical tactile cassette button click sound
  public playMechanicalClick(pitch: 'high' | 'low' = 'low') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch === 'high' ? 1200 : 450, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch === 'high' ? 180 : 90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.debug('Audio not supported or blocked:', e);
    }
  }

  // Gentle morning chime / bell for alarm
  public playMorningChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  // 8-bit retro arcade chime for game comic style
  public play8BitJingle() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.1);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  // Soft crystalline chime for analysis complete
  public playChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [587.33, 880.0, 1174.66]; // D5, A5, D6
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.1 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.85);
      });
    } catch (e) {
      console.debug('Audio error:', e);
    }
  }

  // Soft Lo-Fi tape hiss simulation
  public startTapeHiss() {
    try {
      this.initCtx();
      if (!this.ctx || this.tapeHissNode) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

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
}

export const audioEngine = new AudioEngine();
