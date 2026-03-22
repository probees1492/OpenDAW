# OpenDAW Audio Engine Design

## 1. Objective

This document defines the MVP audio engine design for OpenDAW. It focuses on how the browser client loads audio assets, schedules playback, renders MIDI instruments, manages transport state, and stays consistent with session data and export behavior.

The MVP audio engine must feel responsive for composition and arrangement, even if it does not yet match desktop DAW recording depth.

## 2. Audio Engine Goals

- provide stable browser-based playback for multitrack arrangements
- keep transport timing predictable and musically aligned
- support audio clips and MIDI clips in the same session
- expose simple mixer behavior for track and master control
- remain consistent with project save state and export semantics

## 3. MVP Audio Engine Scope

Included in MVP:

- playback of audio clips on a project timeline
- playback of MIDI clips through at least one built-in instrument path
- timeline seeking, play, pause, stop, and loop
- track volume, pan, mute, and solo
- metronome support if enabled for MVP
- preview audition for assets or clips

Excluded from MVP:

- third-party plugin hosting
- advanced insert chains and routing graphs
- sample-accurate realtime collaboration playback sync across users
- complex automation playback beyond basic placeholders
- professional-grade multichannel I/O

## 4. Core Design Principles

- The transport is the source of truth for playback position.
- Session state should be independent from runtime audio node state.
- Playback scheduling should happen ahead of the current audio time in small rolling windows.
- Audio engine recovery should be explicit when the browser suspends or device output changes.
- The MVP should favor deterministic, debuggable behavior over feature breadth.

## 5. Runtime Architecture

The client audio engine should be composed of these main layers:

- transport controller
- project playback graph
- clip scheduler
- asset decoder and buffer cache
- MIDI instrument layer
- mixer layer
- metronome and preview layer

### 5.1 Transport controller

The transport controller owns:

- play state
- playhead position in musical time and seconds
- loop range
- tempo and time signature reference
- seek and stop behavior

It should expose a stable API to the rest of the editor:

- `play()`
- `pause()`
- `stop()`
- `seek(position)`
- `setLoop(range)`
- `setTempo(value)`

### 5.2 Playback graph

The playback graph should be built on the Web Audio API using:

- one `AudioContext`
- per-track gain node
- per-track stereo panner node where supported
- clip source nodes created per scheduled playback event
- one master bus gain stage
- optional metering path for UI feedback

The graph should remain simple for MVP and rebuild only when necessary.

## 6. Time Model

The engine needs two aligned time systems:

- musical timeline time: bars, beats, ticks, clip offsets
- audio runtime time: `AudioContext.currentTime`

Recommended approach:

- convert musical positions into seconds using current tempo map
- store the transport anchor at play start as:
  - project timeline start position
  - corresponding audio context start time
- derive current playhead continuously from those anchors while playing

This avoids making the audio context itself the source of truth for the project timeline.

## 7. Scheduling Model

Playback should use rolling scheduling rather than attempting to schedule the full song at once.

Recommended model:

- scheduler interval around 25 to 100 ms
- schedule horizon around 100 to 300 ms ahead
- each pass finds clip events entering the lookahead window
- each clip event creates a new buffer source or note event

This model balances timing stability with the ability to react to seek, pause, loop, and clip edits.

## 8. Audio Clip Playback

### 8.1 Clip representation

Each audio clip should reference:

- media asset id
- source start offset
- timeline start position
- clip duration
- gain adjustment if supported
- fade placeholders for future expansion

### 8.2 Asset preparation

Before playback, the engine should:

- fetch decoded waveform metadata separately for UI
- fetch or stream the underlying media asset
- decode the asset into an `AudioBuffer`
- cache decoded buffers by asset id

### 8.3 Scheduling clips

For each audio clip event:

- determine whether the clip intersects the current scheduling window
- calculate playback offset inside the source asset
- create a new buffer source node
- connect it through track gain and panner nodes
- start it at the scheduled audio time with the correct offset and duration

Buffer source nodes are one-shot. The scheduler should recreate them on each playback event or loop entry.

## 9. MIDI Playback

### 9.1 MVP instrument strategy

The MVP should support at least one built-in instrument layer for browser playback. The simplest acceptable path is a lightweight sampler or synth that can be controlled from MIDI note events.

### 9.2 MIDI note model

Each note event should include:

- pitch
- start time
- duration
- velocity
- channel or instrument target if needed

### 9.3 MIDI scheduling

The scheduler should:

- scan upcoming MIDI note events within the horizon
- schedule note-on and note-off behavior through the instrument layer
- keep note timing aligned to the same transport clock as audio clips

MIDI scheduling should share the transport and loop model with audio playback.

## 10. Mixer Model

Each track should include a minimal signal chain:

- source events
- track gain
- track pan
- mute or solo gate logic
- master bus

### Track state rules

- `mute` silences the track regardless of solo state elsewhere
- `solo` causes non-solo tracks to be attenuated or muted
- volume and pan changes apply in near realtime

The master bus should expose:

- master gain
- peak metering for UI

## 11. Seeking, Stop, and Loop

### Seeking

When the user seeks:

- clear pending scheduled events
- stop active source nodes safely
- update transport anchors
- resume scheduling from the new target only when transport is playing

### Stop

When the user stops:

- stop active nodes
- clear future scheduled events
- return the playhead to the chosen stop target

### Loop

Looping should:

- define start and end points in project time
- reschedule playback from loop start when the playhead crosses loop end
- avoid audible gaps as much as possible within browser constraints

## 12. Preview and Audition

The engine should support short preview playback for:

- imported audio assets
- selected clips
- MIDI note audition in the piano roll

Preview playback should be isolated enough that it does not corrupt the main transport state.

## 13. Browser Lifecycle Handling

The engine must handle browser and device events safely:

- suspended `AudioContext`
- tab backgrounding
- output device changes when detectable
- failed decode or fetch operations

Expected behavior:

- surface recoverable audio errors in the UI
- allow a clean resume path
- reinitialize nodes if the audio context becomes invalid

## 14. Interaction with Session State

The engine should not directly mutate canonical project session data. Instead:

- the editor state updates session data
- the engine subscribes to relevant read models
- runtime node instances are derived from session state

This separation is important because:

- save logic remains deterministic
- undo or redo stays in the editor model
- runtime graph resets are easier to reason about

## 15. Export Consistency

The MVP must define how export behavior relates to browser playback behavior.

Preferred rule:

- session structure and timing rules are shared between editor playback and export
- export uses the same session document, clip offsets, track states, and tempo settings
- if browser playback and server rendering differ, export rules are authoritative for output artifacts

The export path should avoid depending on unstable client-only runtime state.

## 16. Performance Considerations

- decoded audio buffers should be cached with memory limits
- timeline rendering and audio scheduling must remain separated
- scheduler work should avoid scanning the entire project on every tick
- session indexing should allow fast retrieval of upcoming events
- waveform rendering must not block playback scheduling

## 17. Risks

- browser timing jitter can create audible issues if the schedule horizon is too short
- large projects can exhaust memory if decoded buffers are cached without limits
- MIDI instrument choice strongly affects perceived responsiveness and quality
- loop transitions can click or gap if source scheduling is not careful
- browser autoplay and suspended audio policies can interrupt first-use flow

## 18. Implementation Phases

### Phase 1

- transport controller
- audio asset decode and cache
- audio clip scheduling
- track gain and pan
- master output and metering

### Phase 2

- MIDI instrument playback
- piano roll audition
- loop refinement
- metronome support

### Phase 3

- tighter export alignment
- automation playback foundations
- device handling and recovery improvements

## 19. Open Decisions

- choose the built-in instrument approach for MVP
- define whether recording monitoring is in or out for release one
- define the maximum active clip count to optimize scheduling targets
- decide whether waveform generation happens only server-side or partially client-side
- determine how much playback drift is acceptable before resync behavior triggers
