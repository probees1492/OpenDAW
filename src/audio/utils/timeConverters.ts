import { DEFAULT_BEATS_PER_BAR, DEFAULT_TEMPO } from "./constants";

/**
 * Converts a bar position to seconds based on tempo.
 *
 * In 4/4 time:
 * - Bar 1 = 0 seconds
 * - Bar 2 = (60 / tempo) * 4 seconds
 *
 * @param bar - Bar position (1-indexed)
 * @param tempo - Tempo in BPM
 * @param beatsPerBar - Number of beats per bar (default 4 for 4/4 time)
 * @returns Time in seconds
 */
export function barToSeconds(
  bar: number,
  tempo: number = DEFAULT_TEMPO,
  beatsPerBar: number = DEFAULT_BEATS_PER_BAR
): number {
  const secondsPerBeat = 60 / tempo;
  const secondsPerBar = secondsPerBeat * beatsPerBar;
  return (bar - 1) * secondsPerBar;
}

/**
 * Converts seconds to a bar position based on tempo.
 *
 * @param seconds - Time in seconds
 * @param tempo - Tempo in BPM
 * @param beatsPerBar - Number of beats per bar (default 4 for 4/4 time)
 * @returns Bar position (1-indexed)
 */
export function secondsToBar(
  seconds: number,
  tempo: number = DEFAULT_TEMPO,
  beatsPerBar: number = DEFAULT_BEATS_PER_BAR
): number {
  const secondsPerBeat = 60 / tempo;
  const secondsPerBar = secondsPerBeat * beatsPerBar;
  return seconds / secondsPerBar + 1;
}

/**
 * Gets the duration of a bar in seconds.
 *
 * @param tempo - Tempo in BPM
 * @param beatsPerBar - Number of beats per bar (default 4 for 4/4 time)
 * @returns Duration of one bar in seconds
 */
export function getBarDuration(
  tempo: number = DEFAULT_TEMPO,
  beatsPerBar: number = DEFAULT_BEATS_PER_BAR
): number {
  return (60 / tempo) * beatsPerBar;
}

/**
 * Gets the duration of a beat in seconds.
 *
 * @param tempo - Tempo in BPM
 * @returns Duration of one beat in seconds
 */
export function getBeatDuration(tempo: number = DEFAULT_TEMPO): number {
  return 60 / tempo;
}
