// Native Procedural Web Audio API Sound Synthesizer
// Zero external MP3 downloads - 100% synthesized in the browser audio thread

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private activeSound: string = 'off';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play subtle tactile UI click haptic
  playHapticClick(frequency = 520, duration = 0.04) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Play Ambient Procedural Soundscapes
  startSoundscape(type: 'rain' | 'fireplace' | 'lofi' | 'brown-noise' | 'forest' | 'off', volume = 0.3) {
    this.stopSoundscape();
    this.activeSound = type;

    if (type === 'off') return;

    this.initContext();
    if (!this.ctx) return;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    switch (type) {
      case 'rain':
        this.generateRain(this.gainNode);
        break;
      case 'brown-noise':
        this.generateBrownNoise(this.gainNode);
        break;
      case 'fireplace':
        this.generateFireplace(this.gainNode);
        break;
      case 'lofi':
        this.generateLofiVinyl(this.gainNode);
        break;
      case 'forest':
        this.generateForestWind(this.gainNode);
        break;
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  stopSoundscape() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.currentSource) {
      try {
        (this.currentSource as AudioScheduledSourceNode).stop?.();
        this.currentSource.disconnect();
      } catch (e) {}
      this.currentSource = null;
    }
    this.activeSound = 'off';
  }

  getActiveSound() {
    return this.activeSound;
  }

  // 1. Procedural Rain generator
  private generateRain(targetNode: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise formula
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(targetNode);
    whiteNoise.start();
    this.currentSource = whiteNoise;
  }

  // 2. Procedural Brown Noise generator (Deep Calm)
  private generateBrownNoise(targetNode: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Compensate gain
    }

    const brownSource = this.ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(targetNode);
    brownSource.start();
    this.currentSource = brownSource;
  }

  // 3. Cozy Fireplace crackle
  private generateFireplace(targetNode: GainNode) {
    if (!this.ctx) return;
    this.generateBrownNoise(targetNode); // warm hum background

    // Crackle generator
    this.intervalId = window.setInterval(() => {
      if (!this.ctx || Math.random() > 0.4) return;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();

      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(120 + Math.random() * 600, this.ctx.currentTime);
      popGain.gain.setValueAtTime(0.04 + Math.random() * 0.06, this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

      popOsc.connect(popGain);
      popGain.connect(targetNode);
      popOsc.start();
      popOsc.stop(this.ctx.currentTime + 0.04);
    }, 150);
  }

  // 4. Lofi Vinyl Crackle
  private generateLofiVinyl(targetNode: GainNode) {
    if (!this.ctx) return;
    this.generateRain(targetNode);

    this.intervalId = window.setInterval(() => {
      if (!this.ctx || Math.random() > 0.6) return;
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();

      snap.type = 'sawtooth';
      snap.frequency.setValueAtTime(3200 + Math.random() * 1000, this.ctx.currentTime);
      snapGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      snapGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.01);

      snap.connect(snapGain);
      snapGain.connect(targetNode);
      snap.start();
      snap.stop(this.ctx.currentTime + 0.015);
    }, 200);
  }

  // 5. Forest Wind
  private generateForestWind(targetNode: GainNode) {
    this.generateBrownNoise(targetNode);
  }
}

export const zenAudio = new ZenAudioEngine();
