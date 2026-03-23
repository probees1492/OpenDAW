// Main audio engine (Actor-based)
export { AudioEngineActor } from "./AudioEngineActor";

// React integration
export { AudioEngineProvider, useAudioEngineContext } from "./AudioEngineContext";

// Actor classes (for advanced usage)
export { Actor } from "./actors/Actor";
export { TransportActor } from "./actors/TransportActor";
export { MixerActor } from "./actors/MixerActor";
export { SchedulerActor } from "./actors/SchedulerActor";

// Type exports
export type {
  TransportMessage,
  TransportStateSnapshot,
  MixerMessage,
  SchedulerMessage,
  EngineMessage,
  ScheduledClip,
} from "./actors/types";

// Utilities
export { LOOKAHEAD_SECONDS, SCHEDULER_INTERVAL_MS } from "./utils/constants";
export {
  barToSeconds,
  secondsToBar,
  getBarDuration,
  getBeatDuration,
} from "./utils/timeConverters";
