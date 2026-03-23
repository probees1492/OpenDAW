import type { TransportState } from "../../state/types";
import { Actor } from "./Actor";
import type { TransportMessage, TransportStateSnapshot } from "./types";
import { barToSeconds, secondsToBar } from "../utils/timeConverters";

/**
 * Actor that manages transport state (play/pause/stop) and playhead position.
 *
 * Uses an "anchor" system for accurate playhead tracking:
 * - When playback starts, we record the anchor (timestamp + bar position)
 * - Current bar is calculated from the anchor and elapsed time
 * - This ensures accurate playback even with variable main thread timing
 *
 * All state mutations go through message passing, ensuring thread safety.
 */
export class TransportActor extends Actor<TransportMessage> {
  private state: TransportState = "stopped";
  private tempo: number = 120;
  private playheadBar: number = 1;
  private loopRange: { start: number; end: number; enabled: boolean } = {
    start: 1,
    end: 5,
    enabled: false,
  };

  // Anchor for tracking playback position
  private anchorTimestamp: number = 0;
  private anchorBar: number = 1;

  protected async handle(message: TransportMessage): Promise<void> {
    switch (message.type) {
      case "PLAY":
        this.handlePlay(message.timestamp);
        break;

      case "PAUSE":
        this.handlePause();
        break;

      case "STOP":
        this.handleStop();
        break;

      case "SEEK":
        this.handleSeek(message.bar);
        break;

      case "SET_TEMPO":
        this.handleSetTempo(message.tempo);
        break;

      case "SET_LOOP":
        this.handleSetLoop(message.start, message.end, message.enabled);
        break;

      case "GET_STATE":
        message.respondTo(this.getStateSnapshot());
        break;

      case "GET_CURRENT_BAR":
        message.respondTo(this.getCurrentBar());
        break;

      case "RESET":
        this.handleReset();
        break;
    }
  }

  private handlePlay(timestamp?: number): void {
    if (this.state === "playing") return;

    this.state = "playing";
    this.anchorBar = this.playheadBar;
    this.anchorTimestamp = timestamp ?? performance.now();
  }

  private handlePause(): void {
    if (this.state !== "playing") return;

    // Capture current position before pausing
    this.playheadBar = this.calculateCurrentBar();
    this.state = "paused";
  }

  private handleStop(): void {
    this.state = "stopped";

    // Return to loop start if looping is enabled, otherwise bar 1
    if (this.loopRange.enabled) {
      this.playheadBar = this.loopRange.start;
    } else {
      this.playheadBar = 1;
    }
  }

  private handleSeek(bar: number): void {
    this.playheadBar = bar;
    if (this.state === "playing") {
      this.anchorBar = bar;
      this.anchorTimestamp = performance.now();
    }
  }

  private handleSetTempo(tempo: number): void {
    // Update anchor before changing tempo
    if (this.state === "playing") {
      this.playheadBar = this.calculateCurrentBar();
      this.anchorBar = this.playheadBar;
      this.anchorTimestamp = performance.now();
    }
    this.tempo = tempo;
  }

  private handleSetLoop(start: number, end: number, enabled: boolean): void {
    this.loopRange = { start, end, enabled };
  }

  private handleReset(): void {
    this.state = "stopped";
    this.playheadBar = 1;
    this.anchorBar = 1;
    this.anchorTimestamp = 0;
  }

  /**
   * Gets the current playhead position in bars.
   * Updates in real-time during playback.
   */
  private getCurrentBar(): number {
    if (this.state !== "playing") {
      return this.playheadBar;
    }

    return this.calculateCurrentBar();
  }

  /**
   * Calculates current bar from anchor position.
   */
  private calculateCurrentBar(): number {
    const elapsedMs = performance.now() - this.anchorTimestamp;
    const elapsedSeconds = elapsedMs / 1000;

    // Convert elapsed time to bars
    const secondsPerBar = (60 / this.tempo) * 4;
    const barsElapsed = elapsedSeconds / secondsPerBar;

    let currentBar = this.anchorBar + barsElapsed;

    // Handle looping
    if (this.loopRange.enabled && currentBar >= this.loopRange.end) {
      // Calculate position within loop
      const loopLength = this.loopRange.end - this.loopRange.start;
      const positionInLoop = (currentBar - this.loopRange.start) % loopLength;
      currentBar = this.loopRange.start + positionInLoop;

      // Update anchor to maintain accuracy
      this.anchorBar = currentBar;
      this.anchorTimestamp = performance.now();
    }

    return currentBar;
  }

  private getStateSnapshot(): TransportStateSnapshot {
    return {
      state: this.state,
      currentBar: this.getCurrentBar(),
      tempo: this.tempo,
      loopRange: { ...this.loopRange },
    };
  }
}
