import { Actor } from "./actors/Actor";
import type { EngineMessage } from "./actors/types";
import { TransportActor } from "./actors/TransportActor";
import { MixerActor } from "./actors/MixerActor";
import { SchedulerActor } from "./actors/SchedulerActor";
import type { TransportState, ProjectSession } from "../state/types";

/**
 * Main audio engine actor that coordinates all audio components.
 *
 * Uses the Actor pattern for message-based communication:
 * - TransportActor: Manages play/pause/stop state and playhead position
 * - MixerActor: Manages track gain, mute, and solo
 * - SchedulerActor: Schedules clips for playback
 *
 * Usage:
 * 1. Create instance
 * 2. Send INITIALIZE message (on user gesture)
 * 3. Send UPDATE_SESSION with project data
 * 4. Send PLAY/PAUSE/STOP/SEEK for transport control
 * 5. Send DISPOSE when done
 */
export class AudioEngineActor extends Actor<EngineMessage> {
  private context: AudioContext | null = null;
  private transportActor: TransportActor;
  private mixerActor: MixerActor;
  private schedulerActor: SchedulerActor;
  private session: ProjectSession | null = null;
  private isInitialized = false;

  // Callbacks
  private onPlayheadChange: ((bar: number) => void) | null = null;
  private onTransportChange: ((state: TransportState) => void) | null = null;

  // Playhead animation
  private playheadAnimationId: number | null = null;

  constructor() {
    super();
    this.transportActor = new TransportActor();
    this.mixerActor = new MixerActor();
    this.schedulerActor = new SchedulerActor();
  }

  protected async handle(message: EngineMessage): Promise<void> {
    switch (message.type) {
      case "INITIALIZE":
        await this.handleInitialize(message.respondTo);
        break;

      case "PLAY":
        this.handlePlay();
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

      case "UPDATE_SESSION":
        this.handleUpdateSession(message.session);
        break;

      case "GET_CURRENT_BAR":
        this.handleGetCurrentBar(message.respondTo);
        break;

      case "GET_TRANSPORT_STATE":
        this.handleGetTransportState(message.respondTo);
        break;

      case "SET_MASTER_VOLUME":
        this.handleSetMasterVolume(message.volume);
        break;

      case "SET_ON_PLAYHEAD_CHANGE":
        this.onPlayheadChange = message.callback;
        break;

      case "SET_ON_TRANSPORT_CHANGE":
        this.onTransportChange = message.callback;
        break;

      case "DISPOSE":
        this.handleDispose();
        break;
    }
  }

  private async handleInitialize(
    respondTo: (success: boolean) => void
  ): Promise<void> {
    if (this.isInitialized) {
      respondTo(true);
      return;
    }

    try {
      // Create audio context (requires user gesture)
      this.context = new AudioContext();

      // Resume if suspended (browser autoplay policy)
      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      // Initialize mixer
      this.mixerActor.send({
        type: "INITIALIZE",
        context: this.context,
      });

      // Connect mixer to destination
      this.mixerActor.connect(this.context.destination);

      // Link scheduler to mixer
      this.schedulerActor.setMixer(this.mixerActor);

      this.isInitialized = true;
      respondTo(true);
    } catch (error) {
      console.error("AudioEngineActor initialization failed:", error);
      respondTo(false);
    }
  }

  private handlePlay(): void {
    if (!this.isInitialized) {
      console.warn("AudioEngineActor not initialized. Send INITIALIZE first.");
      return;
    }

    // Start transport
    this.transportActor.send({ type: "PLAY" });

    // Start scheduler with current tempo
    const tempo = this.session?.tempo ?? 120;
    this.schedulerActor.send({
      type: "START",
      context: this.context!,
      tempo,
    });

    // Start playhead updates
    this.startPlayheadUpdates();

    // Notify transport state change
    if (this.onTransportChange) {
      this.onTransportChange("playing");
    }
  }

  private handlePause(): void {
    // Pause transport
    this.transportActor.send({ type: "PAUSE" });

    // Stop scheduler
    this.schedulerActor.send({ type: "STOP" });

    // Stop playhead updates
    this.stopPlayheadUpdates();

    // Notify transport state change
    if (this.onTransportChange) {
      this.onTransportChange("paused");
    }
  }

  private handleStop(): void {
    // Stop transport
    this.transportActor.send({ type: "STOP" });

    // Stop scheduler
    this.schedulerActor.send({ type: "STOP" });

    // Stop playhead updates
    this.stopPlayheadUpdates();

    // Notify of new playhead position
    this.transportActor.send({
      type: "GET_CURRENT_BAR",
      respondTo: (bar) => {
        if (this.onPlayheadChange) {
          this.onPlayheadChange(bar);
        }
      },
    });

    // Notify transport state change
    if (this.onTransportChange) {
      this.onTransportChange("stopped");
    }
  }

  private handleSeek(bar: number): void {
    this.transportActor.send({ type: "SEEK", bar });

    // Update scheduler's current bar
    this.schedulerActor.send({ type: "SET_CURRENT_BAR", bar });

    if (this.onPlayheadChange) {
      this.onPlayheadChange(bar);
    }
  }

  private handleUpdateSession(session: ProjectSession): void {
    this.session = session;

    // Update transport
    this.transportActor.send({ type: "SET_TEMPO", tempo: session.tempo });
    this.transportActor.send({
      type: "SET_LOOP",
      start: session.loopRange.start,
      end: session.loopRange.end,
      enabled: session.loopRange.enabled,
    });
    this.transportActor.send({ type: "SEEK", bar: session.playheadBar });

    // Update scheduler
    this.schedulerActor.send({ type: "UPDATE_SESSION", session });

    // Update mixer with track states
    this.mixerActor.send({ type: "UPDATE_TRACKS", tracks: session.tracks });
  }

  private handleGetCurrentBar(respondTo: (bar: number) => void): void {
    this.transportActor.send({
      type: "GET_CURRENT_BAR",
      respondTo,
    });
  }

  private handleGetTransportState(
    respondTo: (state: TransportState) => void
  ): void {
    this.transportActor.send({
      type: "GET_STATE",
      respondTo: (state) => respondTo(state.state),
    });
  }

  private handleSetMasterVolume(volume: number): void {
    this.mixerActor.send({ type: "SET_MASTER_VOLUME", volume });
  }

  /**
   * Starts the playhead animation loop using requestAnimationFrame.
   */
  private startPlayheadUpdates(): void {
    if (this.playheadAnimationId !== null) {
      return;
    }

    const animate = () => {
      this.transportActor.send({
        type: "GET_STATE",
        respondTo: (state) => {
          if (state.state === "playing") {
            // Update scheduler with current bar
            this.schedulerActor.send({
              type: "SET_CURRENT_BAR",
              bar: state.currentBar,
            });

            if (this.onPlayheadChange) {
              this.onPlayheadChange(state.currentBar);
            }
            this.playheadAnimationId = requestAnimationFrame(animate);
          }
        },
      });
    };

    this.playheadAnimationId = requestAnimationFrame(animate);
  }

  /**
   * Stops the playhead animation loop.
   */
  private stopPlayheadUpdates(): void {
    if (this.playheadAnimationId !== null) {
      cancelAnimationFrame(this.playheadAnimationId);
      this.playheadAnimationId = null;
    }
  }

  private handleDispose(): void {
    this.stopPlayheadUpdates();

    // Dispose scheduler
    this.schedulerActor.send({ type: "DISPOSE" });

    // Dispose mixer
    this.mixerActor.send({ type: "DISPOSE" });

    // Dispose transport
    this.transportActor.send({ type: "RESET" });
    this.transportActor.dispose();

    // Close audio context
    if (this.context) {
      this.context.close();
      this.context = null;
    }

    this.isInitialized = false;
    this.session = null;

    // Dispose actors
    this.mixerActor.dispose();
    this.schedulerActor.dispose();
  }

  /**
   * Gets the current playhead position synchronously.
   * This is a convenience method for UI updates.
   * Note: Prefer using the callback-based approach via SET_ON_PLAYHEAD_CHANGE.
   */
  getCurrentBarSync(): number {
    // This is a synchronous fallback for compatibility
    // It bypasses the actor pattern, so use sparingly
    let bar = 1;
    this.transportActor.send({
      type: "GET_CURRENT_BAR",
      respondTo: (b) => {
        bar = b;
      },
    });
    return bar;
  }
}
