/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 オーディオマネージャー
 * (Web Audio API ルックアヘッド・サンプル精度スケジューラ搭載版)
 * ==========================================================================
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.seGain = null;
    this.currentBgm = null;
    this.isInitialized = false;

    // ルックアヘッドスケジューラ用変数
    this.schedulerTimer = null;
    this.nextNoteTime = 0.0;
    this.scheduleAheadTime = 0.15; // 150ms先まで先読み予約
    this.lookaheadInterval = 25;   // 25ms周期でポーリング
    this.bgmStep = 0;
    this.currentTrack = null;

    this.notes = {
      'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
      'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, '0': 0
    };
  }

  unlockAudio() {
    if (this.isInitialized && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start(0);

      if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.35;
        this.bgmGain.connect(this.masterGain);

        this.seGain = this.ctx.createGain();
        this.seGain.gain.value = 0.5;
        this.seGain.connect(this.masterGain);
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  init() {
    this.unlockAudio();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
    }
    return this.isMuted;
  }

  // 指定された絶対時刻 (ctx.currentTime) に発音
  playToneAtTime(freq, duration, type = 'square', exactTime = 0, gainNode = this.seGain, attack = 0.01, release = 0.05) {
    if (!this.isInitialized || this.isMuted || !freq || !this.ctx) return;
    this.resume();

    const t = Math.max(this.ctx.currentTime, exactTime);
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.3, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(g);
    g.connect(gainNode || this.seGain);

    osc.start(t);
    osc.stop(t + duration + release);
  }

  playTone(freq, duration, type = 'square', timeOffset = 0, gainNode = this.seGain, attack = 0.01, release = 0.05) {
    if (!this.isInitialized || !this.ctx) return;
    this.playToneAtTime(freq, duration, type, this.ctx.currentTime + timeOffset, gainNode, attack, release);
  }

  // ==========================================
  // 効果音 (SE)
  // ==========================================
  playCursor() {
    this.playTone(660, 0.05, 'square', 0, this.seGain, 0.005, 0.02);
  }

  playDecide() {
    this.playTone(523, 0.06, 'triangle', 0);
    this.playTone(784, 0.12, 'triangle', 0.05);
  }

  playCancel() {
    this.playTone(330, 0.08, 'sawtooth', 0);
    this.playTone(220, 0.1, 'sawtooth', 0.06);
  }

  playSave() {
    const bells = [1046, 1318, 1568, 2093];
    bells.forEach((freq, idx) => {
      this.playTone(freq, 0.35, 'sine', idx * 0.08, this.seGain, 0.01, 0.25);
    });
  }

  playSlash() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.seGain);

    noise.start(t);
    this.playTone(1800, 0.15, 'sine', 0, this.seGain, 0.001, 0.1);
  }

  playMagic() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    this.resume();
    const scale = [523, 659, 784, 1046, 1318];
    scale.forEach((freq, idx) => {
      this.playTone(freq, 0.18, 'triangle', idx * 0.04, this.seGain, 0.01, 0.1);
    });
  }

  playHit() {
    this.playTone(140, 0.12, 'sawtooth', 0, this.seGain, 0.005, 0.08);
    this.playTone(80, 0.15, 'triangle', 0.02, this.seGain, 0.005, 0.1);
  }

  playHeal() {
    const scale = [392, 523, 659, 784, 1046];
    scale.forEach((freq, idx) => {
      this.playTone(freq, 0.25, 'sine', idx * 0.06, this.seGain, 0.02, 0.15);
    });
  }

  playEnemyDead() {
    if (!this.isInitialized || this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(g);
    g.connect(this.seGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playEncounter() {
    for (let i = 0; i < 4; i++) {
      this.playTone(440 + i * 110, 0.08, 'sawtooth', i * 0.06);
    }
  }

  playVictory() {
    this.stopBgm();
    const notes = [
      { f: 'D4', d: 0.15, o: 0 },
      { f: 'G4', d: 0.15, o: 0.15 },
      { f: 'A4', d: 0.15, o: 0.3 },
      { f: 'D5', d: 0.35, o: 0.45 },
      { f: 'C5', d: 0.15, o: 0.8 },
      { f: 'D5', d: 0.6,  o: 0.95 }
    ];
    notes.forEach(n => {
      if (this.notes[n.f]) {
        this.playTone(this.notes[n.f], n.d, 'triangle', n.o, this.seGain, 0.01, 0.2);
        this.playTone(this.notes[n.f] * 0.5, n.d, 'sine', n.o, this.seGain, 0.01, 0.2);
      }
    });
  }

  // ==========================================
  // ルックアヘッド・BGMスケジューラ (H-3 対応)
  // ==========================================
  startLookaheadScheduler(track) {
    this.stopBgm();
    this.currentTrack = track;
    this.bgmStep = 0;
    this.nextNoteTime = (this.ctx ? this.ctx.currentTime : 0) + 0.05;

    const schedule = () => {
      if (!this.ctx || this.isMuted || !this.currentTrack) return;
      this.resume();

      // 先読み時間枠（currentTime + scheduleAheadTime）までノートを事前予約
      while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
        const step = this.bgmStep;
        const stepDur = this.currentTrack.stepDuration;

        // メロディ発音
        if (this.currentTrack.melody) {
          const mNote = this.currentTrack.melody[step % this.currentTrack.melody.length];
          if (mNote !== '0' && this.notes[mNote]) {
            const freq = this.notes[mNote];
            this.playToneAtTime(freq, this.currentTrack.melodyDuration || stepDur * 0.9, this.currentTrack.melodyWave || 'triangle', this.nextNoteTime, this.bgmGain, 0.02, 0.08);
            if (this.currentTrack.hasSubHarmonic) {
              this.playToneAtTime(freq * 0.5, stepDur * 0.9, 'sine', this.nextNoteTime, this.bgmGain, 0.02, 0.1);
            }
          }
        }

        // ベース発音
        if (this.currentTrack.bass) {
          const bNote = this.currentTrack.bass[step % this.currentTrack.bass.length];
          if (bNote !== '0' && this.notes[bNote]) {
            const freq = this.notes[bNote];
            this.playToneAtTime(freq, this.currentTrack.bassDuration || stepDur * 0.8, this.currentTrack.bassWave || 'sine', this.nextNoteTime, this.bgmGain, 0.01, 0.06);
          }
        }

        this.nextNoteTime += stepDur;
        this.bgmStep++;
      }
    };

    // 初回即時スケジュール＆高頻度ポーリング
    schedule();
    this.schedulerTimer = setInterval(schedule, this.lookaheadInterval);
  }

  playBgm(bgmName) {
    if (this.currentBgm === bgmName) return;
    this.stopBgm();
    this.currentBgm = bgmName;

    if (!this.isInitialized) return;

    if (bgmName === 'opening') {
      this.startOpeningBgm();
    } else if (bgmName === 'village') {
      this.startVillageBgm();
    } else if (bgmName === 'battle') {
      this.startBattleBgm();
    } else if (bgmName === 'title') {
      this.startTitleBgm();
    }
  }

  stopBgm() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.currentTrack = null;
    this.currentBgm = null;
  }

  startOpeningBgm() {
    this.startLookaheadScheduler({
      stepDuration: 0.30,
      melodyDuration: 0.45,
      melodyWave: 'triangle',
      hasSubHarmonic: true,
      melody: [
        'D3', '0', 'A3', '0', 'D4', '0', 'Eb4', '0',
        'D4', 'C4', 'A3', '0', 'G3', '0', 'A3', '0',
        'D4', '0', 'G4', '0', 'A4', '0', 'C5', '0',
        'D5', 'Eb5', 'D5', 'C5', 'A4', '0', 'D4', '0'
      ]
    });
  }

  startVillageBgm() {
    this.startLookaheadScheduler({
      stepDuration: 0.22,
      melodyDuration: 0.28,
      melodyWave: 'triangle',
      bassDuration: 0.35,
      bassWave: 'sine',
      melody: [
        'D4', '0', 'Eb4', '0', 'G4', '0', 'A4', 'G4',
        'Eb4', '0', 'D4', '0', 'C4', '0', 'D4', '0',
        'G4', '0', 'A4', '0', 'C5', '0', 'D5', 'C5',
        'A4', '0', 'G4', '0', 'Eb4', '0', 'D4', '0'
      ],
      bass: [
        'D3', '0', 'D3', '0', 'G3', '0', 'G3', '0',
        'Eb3', '0', 'Eb3', '0', 'D3', '0', 'D3', '0',
        'G3', '0', 'G3', '0', 'C4', '0', 'C4', '0',
        'A3', '0', 'G3', '0', 'D3', '0', 'D3', '0'
      ]
    });
  }

  startBattleBgm() {
    this.startLookaheadScheduler({
      stepDuration: 0.14,
      melodyDuration: 0.18,
      melodyWave: 'sawtooth',
      bassDuration: 0.12,
      bassWave: 'square',
      melody: [
        'D5', 'D5', 'Eb5', 'D5', 'C5', 'D5', 'G5', 'F5',
        'D5', 'D5', 'Eb5', 'D5', 'C5', 'Bb4', 'A4', 'G4',
        'A4', 'C5', 'D5', 'Eb5', 'D5', 'C5', 'A4', 'C5',
        'D5', 'G5', 'F5', 'Eb5', 'D5', 'C5', 'D5', '0'
      ],
      bass: [
        'D3', 'D4', 'D3', 'D4', 'D3', 'D4', 'G3', 'G4',
        'D3', 'D4', 'D3', 'D4', 'C3', 'C4', 'A2', 'A3',
        'F3', 'F4', 'G3', 'G4', 'A3', 'A4', 'F3', 'F4',
        'G3', 'G4', 'A3', 'A4', 'D3', 'D4', 'D3', 'D4'
      ]
    });
  }

  startTitleBgm() {
    this.startLookaheadScheduler({
      stepDuration: 0.28,
      melodyDuration: 0.35,
      melodyWave: 'triangle',
      hasSubHarmonic: true,
      melody: [
        'D4', '0', 'A4', '0', 'G4', 'Eb4', 'D4', '0',
        'C4', '0', 'D4', '0', 'G4', '0', 'A4', '0',
        'D5', '0', 'C5', '0', 'A4', 'G4', 'Eb4', '0',
        'D4', '0', 'Eb4', 'D4', 'C4', '0', 'D4', '0'
      ]
    });
  }
}
