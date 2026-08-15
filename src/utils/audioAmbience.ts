// Web Audio API Ambient Melodic Chimes / Piano Background Music Player
// Generates warm, nostalgic, harmonic ambient chords suited for a birthday slideshow

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: number | null = null;
  private gainNode: GainNode | null = null;
  private masterVolume = 0.35;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Harmonic pentatonic frequencies (warm relaxing mother-daughter birthday theme in F Major / D minor)
    const notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      698.46, // F5
      783.99, // G5
      880.00, // A5
    ];

    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [220.00, 261.63, 329.63, 440.00], // A Minor
      [174.61, 261.63, 349.23, 440.00], // F Major
      [196.00, 246.94, 293.66, 392.00], // G Major
    ];

    let chordIdx = 0;

    const playTone = (freq: number, startTime: number, duration: number, gainValue = 0.08) => {
      if (!this.ctx || !this.gainNode) return;
      try {
        const osc = this.ctx.createOscillator();
        const toneGain = this.ctx.createGain();

        // Warm triangle/sine blend
        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        toneGain.gain.setValueAtTime(0.001, startTime);
        toneGain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.15);
        toneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(toneGain);
        toneGain.connect(this.gainNode);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      } catch {
        // ignore audio errors
      }
    };

    const step = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      // Play gentle pad chord
      chord.forEach((freq, idx) => {
        playTone(freq, now + idx * 0.1, 3.2, 0.05);
      });

      // Play soft bell melody
      const melody1 = notes[Math.floor(Math.random() * notes.length)];
      const melody2 = notes[Math.floor(Math.random() * notes.length)];
      playTone(melody1, now + 0.8, 2.0, 0.08);
      playTone(melody2, now + 1.8, 2.0, 0.07);

      this.timer = window.setTimeout(step, 3200);
    };

    step();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public toggle(muteState?: boolean): boolean {
    if (muteState !== undefined) {
      if (muteState) {
        this.pause();
        return false;
      } else {
        this.play();
        return true;
      }
    }
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }
}

export const birthdayAudio = new BirthdayAudioEngine();
