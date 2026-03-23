import type { TrackType } from "../state/types";

/**
 * A simple synthesizer voice using Web Audio API oscillators.
 * Generates demo sounds based on track type and clip position.
 */
export class SynthVoice {
  private context: AudioContext;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode;
  private outputNode: AudioNode;

  constructor(context: AudioContext, outputNode: AudioNode) {
    this.context = context;
    this.gainNode = context.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(outputNode);
    this.outputNode = outputNode;
  }

  /**
   * Plays a note for the given track type and clip position.
   *
   * - Audio tracks: sawtooth wave, lower register
   * - MIDI tracks: square wave, mid register
   * - Pitch varies based on clip start bar for melodic variation
   */
  play(
    trackType: TrackType,
    clipStartBar: number,
    clipLength: number,
    startTime: number,
    duration: number
  ): void {
    // Create new oscillator for this note
    this.oscillator = this.context.createOscillator();

    // Set wave type and base frequency based on track type
    if (trackType === "Audio") {
      this.oscillator.type = "sawtooth";
      // Lower register: 110-220 Hz based on clip position
      const baseFreq = 110;
      const semitoneOffset = (clipStartBar % 12);
      const frequency = baseFreq * Math.pow(2, semitoneOffset / 12);
      this.oscillator.frequency.value = frequency;
    } else {
      this.oscillator.type = "square";
      // Mid register: 220-440 Hz based on clip position
      const baseFreq = 220;
      const semitoneOffset = (clipStartBar % 12);
      const frequency = baseFreq * Math.pow(2, semitoneOffset / 12);
      this.oscillator.frequency.value = frequency;
    }

    this.oscillator.connect(this.gainNode);

    // Schedule envelope
    const attackTime = 0.01;
    const releaseTime = 0.05;
    const endTime = startTime + duration;

    this.gainNode.gain.setValueAtTime(0, startTime);
    this.gainNode.gain.linearRampToValueAtTime(0.3, startTime + attackTime);
    this.gainNode.gain.setValueAtTime(0.3, endTime - releaseTime);
    this.gainNode.gain.linearRampToValueAtTime(0, endTime);

    this.oscillator.start(startTime);
    this.oscillator.stop(endTime + 0.01);
  }

  /**
   * Stops the voice immediately.
   */
  stop(): void {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
      } catch {
        // Already stopped
      }
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
  }

  /**
   * Disconnects the voice from the audio graph.
   */
  dispose(): void {
    this.stop();
    this.gainNode.disconnect();
  }
}
