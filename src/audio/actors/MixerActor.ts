import { Actor } from "./Actor";
import type { MixerMessage } from "./types";
import type { Track } from "../../state/types";

interface TrackNodes {
  gainNode: GainNode;
  muted: boolean;
  solo: boolean;
}

/**
 * Actor that manages per-track gain, mute, and solo functionality.
 *
 * Solo Logic:
 * - If any track has solo enabled, only solo tracks are audible.
 * - Mute takes priority over solo (a muted solo track is still muted).
 *
 * All state mutations go through message passing, ensuring thread safety.
 */
export class MixerActor extends Actor<MixerMessage> {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks: Map<string, TrackNodes> = new Map();

  protected async handle(message: MixerMessage): Promise<void> {
    switch (message.type) {
      case "INITIALIZE":
        this.handleInitialize(message.context);
        message.respondTo?.(true);
        break;

      case "UPDATE_TRACKS":
        this.handleUpdateTracks(message.tracks);
        break;

      case "SET_MASTER_VOLUME":
        this.handleSetMasterVolume(message.volume);
        break;

      case "GET_TRACK_OUTPUT":
        message.respondTo(this.getTrackOutputSync(message.trackId));
        break;

      case "GET_MASTER_OUTPUT":
        message.respondTo(this.masterGain);
        break;

      case "REGISTER_TRACK":
        message.respondTo(this.registerTrack(message.trackId));
        break;

      case "DISPOSE":
        this.handleDispose();
        break;
    }
  }

  private handleInitialize(context: AudioContext): void {
    this.context = context;
    this.masterGain = context.createGain();
    this.masterGain.gain.value = 1;
  }

  /**
   * Registers or updates a track in the mixer.
   */
  private registerTrack(trackId: string): GainNode {
    if (!this.context) {
      throw new Error("MixerActor not initialized");
    }

    let trackNodes = this.tracks.get(trackId);

    if (!trackNodes) {
      trackNodes = {
        gainNode: this.context.createGain(),
        muted: false,
        solo: false,
      };
      trackNodes.gainNode.gain.value = 1;
      trackNodes.gainNode.connect(this.masterGain!);
      this.tracks.set(trackId, trackNodes);
    }

    return trackNodes.gainNode;
  }

  /**
   * Updates all tracks with current mute/solo states.
   */
  private handleUpdateTracks(tracks: Track[]): void {
    if (!this.context) return;

    const hasAnySolo = tracks.some((t) => t.solo);

    for (const track of tracks) {
      let trackNodes = this.tracks.get(track.id);

      if (!trackNodes) {
        // Register new track
        this.registerTrack(track.id);
        trackNodes = this.tracks.get(track.id)!;
      }

      // Update state
      trackNodes.muted = track.muted;
      trackNodes.solo = track.solo;

      // Calculate effective gain
      let effectiveGain = 1;

      if (track.muted) {
        // Mute takes priority
        effectiveGain = 0;
      } else if (hasAnySolo && !track.solo) {
        // If any solo is active and this track is not soloed, mute it
        effectiveGain = 0;
      }

      // Apply gain smoothly
      trackNodes.gainNode.gain.setTargetAtTime(
        effectiveGain,
        this.context.currentTime,
        0.01
      );
    }
  }

  /**
   * Gets the output node for a specific track.
   * This is synchronous for Web Audio timing requirements.
   */
  getTrackOutput(trackId: string): AudioNode | null {
    const trackNodes = this.tracks.get(trackId);
    return trackNodes?.gainNode ?? null;
  }

  /**
   * Gets the output node for a specific track (for message handler).
   */
  private getTrackOutputSync(trackId: string): AudioNode | null {
    return this.getTrackOutput(trackId);
  }

  /**
   * Sets the master volume.
   */
  private handleSetMasterVolume(volume: number): void {
    if (!this.context || !this.masterGain) return;

    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      this.context.currentTime,
      0.01
    );
  }

  /**
   * Connects the master output to the destination.
   */
  connect(destination: AudioNode): void {
    if (this.masterGain) {
      this.masterGain.connect(destination);
    }
  }

  /**
   * Disconnects and cleans up all resources.
   */
  private handleDispose(): void {
    for (const trackNodes of this.tracks.values()) {
      trackNodes.gainNode.disconnect();
    }
    this.tracks.clear();

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }

    this.context = null;
  }
}
