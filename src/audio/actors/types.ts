import type { TransportState } from "../../state/types";
import type { ProjectSession, Track } from "../../state/types";

// ============================================================================
// Transport Actor Messages
// ============================================================================

export interface TransportStateSnapshot {
  state: TransportState;
  currentBar: number;
  tempo: number;
  loopRange: {
    start: number;
    end: number;
    enabled: boolean;
  };
}

export type TransportMessage =
  | { type: "PLAY"; timestamp?: number }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "SEEK"; bar: number }
  | { type: "SET_TEMPO"; tempo: number }
  | { type: "SET_LOOP"; start: number; end: number; enabled: boolean }
  | { type: "GET_STATE"; respondTo: (state: TransportStateSnapshot) => void }
  | { type: "GET_CURRENT_BAR"; respondTo: (bar: number) => void }
  | { type: "RESET" };

// ============================================================================
// Mixer Actor Messages
// ============================================================================

export type MixerMessage =
  | { type: "INITIALIZE"; context: AudioContext; respondTo?: (success: boolean) => void }
  | { type: "UPDATE_TRACKS"; tracks: Track[] }
  | { type: "SET_MASTER_VOLUME"; volume: number }
  | { type: "GET_TRACK_OUTPUT"; trackId: string; respondTo: (node: AudioNode | null) => void }
  | { type: "GET_MASTER_OUTPUT"; respondTo: (node: AudioNode | null) => void }
  | { type: "REGISTER_TRACK"; trackId: string; respondTo: (node: GainNode) => void }
  | { type: "DISPOSE" };

// ============================================================================
// Scheduler Actor Messages
// ============================================================================

export type SchedulerMessage =
  | {
      type: "START";
      context: AudioContext;
      tempo: number;
    }
  | { type: "STOP" }
  | { type: "UPDATE_SESSION"; session: ProjectSession }
  | { type: "SET_CURRENT_BAR"; bar: number }
  | { type: "SET_TEMPO"; tempo: number }
  | { type: "SET_ON_BAR_CHANGE"; callback: ((bar: number) => void) | null }
  | { type: "DISPOSE" };

// ============================================================================
// Engine Actor Messages
// ============================================================================

export type EngineMessage =
  | { type: "INITIALIZE"; respondTo: (success: boolean) => void }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "SEEK"; bar: number }
  | { type: "UPDATE_SESSION"; session: ProjectSession }
  | { type: "GET_CURRENT_BAR"; respondTo: (bar: number) => void }
  | { type: "GET_TRANSPORT_STATE"; respondTo: (state: TransportState) => void }
  | { type: "SET_MASTER_VOLUME"; volume: number }
  | { type: "SET_ON_PLAYHEAD_CHANGE"; callback: ((bar: number) => void) | null }
  | { type: "SET_ON_TRANSPORT_CHANGE"; callback: ((state: TransportState) => void) | null }
  | { type: "DISPOSE" };

// ============================================================================
// Internal Scheduler Types
// ============================================================================

export interface ScheduledClip {
  clipId: string;
  trackId: string;
  endTime: number;
  voice: import("../SynthVoice").SynthVoice;
}
