/**
 * @file timer.js
 * @description 高精度倒數計時器與 Web Audio 音效引擎
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 播放短嗶聲 (倒數警告音)
   */
  playBeep(freq = 600, duration = 0.08, type = 'sine') {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * 播放開始測驗音效 (上升和弦)
   */
  playStartChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  /**
   * 播放交卷/時間到音效 (鐘聲)
   */
  playFinishChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch (e) {}
  }

  /**
   * 播放答對提示音 (清脆雙音和弦)
   */
  playCorrectSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  /**
   * 播放答錯提示音 (輕柔柔和低音)
   */
  playWrongSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.setValueAtTime(174.61, now + 0.09); // F3
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();

export class ExamTimer {
  constructor(options = {}) {
    this.totalSeconds = options.totalSeconds || 180;
    this.remainingSeconds = this.totalSeconds;
    this.timerId = null;
    this.startTime = null;
    this.expectedEndTime = null;
    this.onTick = options.onTick || (() => {});
    this.onTimeUp = options.onTimeUp || (() => {});
    this.onWarning = options.onWarning || (() => {});
    this.isWarningTriggered = false;
    this.soundEnabled = options.soundEnabled !== false;
  }

  start() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;
    this.startTime = performance.now();
    this.expectedEndTime = this.startTime + this.totalSeconds * 1000;
    this.isWarningTriggered = false;

    if (this.soundEnabled) {
      soundEngine.playStartChime();
    }

    this.onTick(this.remainingSeconds, 0);

    this.timerId = setInterval(() => {
      const now = performance.now();
      const diffMs = this.expectedEndTime - now;
      const rem = Math.max(0, Math.ceil(diffMs / 1000));
      const spent = this.totalSeconds - rem;

      this.remainingSeconds = rem;
      this.onTick(this.remainingSeconds, spent);

      // 最後 30 秒警告
      if (rem <= 30 && !this.isWarningTriggered) {
        this.isWarningTriggered = true;
        this.onWarning(rem);
      }

      // 最後 5 秒每秒嗶聲提示
      if (rem <= 5 && rem > 0 && this.soundEnabled) {
        soundEngine.playBeep(700, 0.08);
      }

      if (rem <= 0) {
        this.stop();
        if (this.soundEnabled) {
          soundEngine.playFinishChime();
        }
        this.onTimeUp();
      }
    }, 250);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      const now = performance.now();
      const diffMs = Math.max(0, this.expectedEndTime - now);
      this.remainingSeconds = Math.max(0, Math.ceil(diffMs / 1000));
    }
  }

  resume() {
    if (this.timerId || this.remainingSeconds <= 0) return;
    this.startTime = performance.now();
    this.expectedEndTime = this.startTime + this.remainingSeconds * 1000;
    this.timerId = setInterval(() => {
      const now = performance.now();
      const diffMs = this.expectedEndTime - now;
      const rem = Math.max(0, Math.ceil(diffMs / 1000));
      const spent = this.totalSeconds - rem;

      this.remainingSeconds = rem;
      this.onTick(this.remainingSeconds, spent);

      // 最後 30 秒警告
      if (rem <= 30 && !this.isWarningTriggered) {
        this.isWarningTriggered = true;
        this.onWarning(rem);
      }

      // 最後 5 秒每秒嗶聲提示
      if (rem <= 5 && rem > 0 && this.soundEnabled) {
        soundEngine.playBeep(700, 0.08);
      }

      if (rem <= 0) {
        this.stop();
        if (this.soundEnabled) {
          soundEngine.playFinishChime();
        }
        this.onTimeUp();
      }
    }, 250);
  }

  getRemaining() {
    return this.remainingSeconds;
  }

  getSpent() {
    return this.totalSeconds - this.remainingSeconds;
  }

  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
