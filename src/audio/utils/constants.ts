/**
 * Audio scheduling constants for the Web Audio API engine.
 *
 * These values are tuned for reliable playback with minimal latency
 * while avoiding scheduling gaps.
 */

/**
 * How far ahead to schedule audio events (in seconds).
 * Larger values = more stable but less responsive to changes.
 */
export const LOOKAHEAD_SECONDS = 0.2;

/**
 * How often to check and schedule new events (in milliseconds).
 * Smaller values = more precise but higher CPU usage.
 */
export const SCHEDULER_INTERVAL_MS = 25;

/**
 * Default tempo fallback when not specified.
 */
export const DEFAULT_TEMPO = 120;

/**
 * Default time signature (beats per bar).
 * 4/4 time = 4 beats per bar.
 */
export const DEFAULT_BEATS_PER_BAR = 4;
