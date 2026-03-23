import { Actor } from "./Actor";
import type { SchedulerMessage, ScheduledClip } from "./types";
import type { ProjectSession, TrackType } from "../../state/types";
import { LOOKAHEAD_SECONDS, SCHEDULER_INTERVAL_MS } from "../utils/constants";
import { barToSeconds } from "../utils/timeConverters";
import { SynthVoice } from "../SynthVoice";
import { MixerActor } from "./MixerActor";

/**
 * Actor that schedules audio clips for playback using a rolling scheduler pattern.
 *
 * The scheduler runs at regular intervals and schedules clips that fall
 * within the lookahead window. This ensures smooth playback even when
 * the main thread is busy.
 *
 * All state mutations go through message passing, ensuring thread safety.
 */
export class SchedulerActor extends Actor<SchedulerMessage> {
  private context: AudioContext | null = null;
  private mixer: MixerActor | null = null;
  private session: ProjectSession | null = null;
  private tempo: number = 120;
  private scheduledClips: ScheduledClip[] = [];
  private schedulerTimer: number | null = null;
  private currentBar: number = 1;
  private onBarChange: ((bar: number) => void) | null = null;

  protected async handle(message: SchedulerMessage): Promise<void> {
    switch (message.type) {
      case "START":
        this.handleStart(message.context, message.tempo);
        break;

      case "STOP":
        this.handleStop();
        break;

      case "UPDATE_SESSION":
        this.handleUpdateSession(message.session);
        break;

      case "SET_CURRENT_BAR":
        this.currentBar = message.bar;
        break;

      case "SET_TEMPO":
        this.tempo = message.tempo;
        break;

      case "SET_ON_BAR_CHANGE":
        this.onBarChange = message.callback;
        break;

      case "DISPOSE":
        this.handleDispose();
        break;
    }
  }

  /**
   * Sets the mixer reference (called by AudioEngineActor during initialization).
   */
  setMixer(mixer: MixerActor): void {
    this.mixer = mixer;
  }

  private handleStart(context: AudioContext, tempo: number): void {
    if (this.schedulerTimer !== null) {
      return;
    }

    this.context = context;
    this.tempo = tempo;

    // Schedule immediately
    this.schedule();

    // Then schedule at regular intervals
    this.schedulerTimer = window.setInterval(() => {
      this.schedule();
    }, SCHEDULER_INTERVAL_MS);
  }

  private handleStop(): void {
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    // Stop all active voices
    for (const scheduled of this.scheduledClips) {
      scheduled.voice.stop();
      scheduled.voice.dispose();
    }
    this.scheduledClips = [];
  }

  private handleUpdateSession(session: ProjectSession): void {
    this.session = session;
    this.tempo = session.tempo;
  }

  private handleDispose(): void {
    this.handleStop();
    this.context = null;
    this.mixer = null;
    this.session = null;
  }

  /**
   * Main scheduling function - schedules clips within the lookahead window.
   */
  private schedule(): void {
    if (!this.session || !this.context || !this.mixer) {
      return;
    }

    const currentBar = this.currentBar;
    const currentSeconds = barToSeconds(currentBar, this.tempo);

    // Update playhead callback
    if (this.onBarChange) {
      this.onBarChange(currentBar);
    }

    // Clean up finished clips
    this.cleanupFinishedClips();

    // Calculate scheduling window
    const scheduleStart = this.context.currentTime;
    const scheduleEnd = scheduleStart + LOOKAHEAD_SECONDS;

    // Schedule clips for each track (synchronous iteration)
    for (const track of this.session.tracks) {
      // Skip muted tracks (mixer handles solo logic)
      if (track.muted) {
        continue;
      }

      // Get track output from mixer synchronously
      // Note: We need direct access here for Web Audio timing
      const trackOutput = this.getTrackOutputSync(track.id);
      if (!trackOutput) {
        continue;
      }

      for (const clip of track.clips) {
        this.scheduleClip(
          clip,
          track.id,
          track.type,
          trackOutput,
          currentSeconds,
          scheduleStart,
          scheduleEnd
        );
      }
    }
  }

  /**
   * Synchronously gets track output (needed for Web Audio timing).
   */
  private getTrackOutputSync(trackId: string): AudioNode | null {
    // We need synchronous access for Web Audio scheduling
    // This is a design compromise - mixer actors handle state,
    // but Web Audio nodes need immediate access
    if (!this.mixer) return null;

    // Use the public synchronous getter
    return this.mixer.getTrackOutput(trackId);
  }

  /**
   * Schedules a single clip if it falls within the scheduling window.
   */
  private scheduleClip(
    clip: { id: string; start: number; length: number },
    trackId: string,
    trackType: TrackType,
    outputNode: AudioNode,
    currentSeconds: number,
    scheduleStart: number,
    scheduleEnd: number
  ): void {
    if (!this.session || !this.context) return;

    // Convert clip position to absolute time
    const clipStartSeconds = barToSeconds(clip.start, this.tempo);
    const clipEndSeconds = barToSeconds(clip.start + clip.length, this.tempo);

    // Calculate when this clip should play in audio context time
    const clipStartTime = scheduleStart + (clipStartSeconds - currentSeconds);
    const clipDuration = clipEndSeconds - clipStartSeconds;

    // Check if clip is already scheduled
    if (this.scheduledClips.some((s) => s.clipId === clip.id)) {
      return;
    }

    // Check if clip falls within scheduling window
    if (clipStartTime >= scheduleStart && clipStartTime < scheduleEnd) {
      // Create a new voice for this clip
      const voice = new SynthVoice(this.context, outputNode);
      voice.play(trackType, clip.start, clip.length, clipStartTime, clipDuration);

      this.scheduledClips.push({
        clipId: clip.id,
        trackId,
        endTime: clipStartTime + clipDuration,
        voice,
      });
    }
  }

  /**
   * Removes finished clips from the scheduled list.
   */
  private cleanupFinishedClips(): void {
    if (!this.context) return;

    const now = this.context.currentTime;
    const activeClips: ScheduledClip[] = [];

    for (const scheduled of this.scheduledClips) {
      if (scheduled.endTime < now) {
        scheduled.voice.dispose();
      } else {
        activeClips.push(scheduled);
      }
    }

    this.scheduledClips = activeClips;
  }
}
