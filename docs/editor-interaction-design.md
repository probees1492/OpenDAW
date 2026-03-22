# OpenDAW Editor Interaction Design

## 1. Objective

This document defines the interaction model for the OpenDAW editor in the MVP. It focuses on how a user moves through the editor, manipulates tracks and clips, receives feedback, and completes the main creation tasks with low friction.

The goal is to make the editor feel immediate, readable, and musically oriented rather than tool-heavy.

## 2. Design Principles

- Keep the transport and timeline mentally central at all times.
- Reduce interruption between idea capture, arrangement, and review.
- Make selection state and edit targets obvious.
- Keep destructive actions recoverable.
- Reserve advanced controls for progressive disclosure.

## 3. Primary User Tasks

- create a new project and enter the editor
- add tracks and clips
- play, stop, seek, and loop a song section
- move and edit audio clips on the timeline
- create and edit MIDI clips in a piano roll
- adjust a basic mix
- save work with confidence
- share the project and review comments

## 4. Editor Layout

The MVP editor should use a desktop-first layout optimized for laptops and large screens.

### Core regions

- top bar: project title, save state, share action, export action, account menu
- transport bar: play, pause, stop, record if supported, tempo, time signature, metronome, loop
- left track column: track names, color, mute, solo, arm if supported, volume summary
- central timeline: ruler, playhead, clips, track lanes, loop region, comments markers
- bottom panel: piano roll, clip inspector, or comments depending on selection
- right side panel: inspector, project details, share settings, or comment thread context

The layout should keep the timeline visible as the primary editing surface and avoid modal detours for common actions.

## 5. Navigation Model

### Project entry

After project selection, the user enters the editor directly into the arrangement timeline.

### Inside the editor

- clicking a track selects the track
- clicking a clip selects the clip
- double-clicking a MIDI clip opens the piano roll in the bottom panel
- double-clicking an audio clip opens clip details or waveform-focused editing in the bottom panel
- pressing escape clears focused selection before closing panels

Navigation should prefer panel swaps over full-page navigation.

## 6. Timeline Interaction Rules

## 6.1 Selection

- single click selects one clip
- shift-click adds clips to selection
- drag on empty space creates a marquee selection
- selected clips show strong visual contrast and visible handles

## 6.2 Movement and resize

- dragging a selected clip moves it on the timeline
- dragging clip edges resizes clip start or end
- dragging with snap enabled aligns to the visible timing grid
- modifier input can temporarily disable snapping

## 6.3 Duplication and split

- duplicate should be available from keyboard shortcut and context action
- split occurs at the playhead or cursor position
- split clips remain selected after the action to support rapid arrangement work

## 6.4 Zoom and scroll

- vertical scroll moves across track lanes
- horizontal scroll moves across time
- zoom should center around the cursor or current playhead target
- zoom level should preserve editing readability without obscuring the musical grid

## 7. Transport Behavior

- transport controls remain visible at all times
- play starts from playhead or selection context
- stop once returns the playhead to the stopped position
- repeated stop can return to the last explicit start point if adopted by product decision
- loop region is created or adjusted directly on the ruler
- transport state must visibly distinguish playing, paused, buffering, and error states

The transport is the heartbeat of the editor. Its state should never be ambiguous.

## 8. Track Model in the UI

Each track row should expose the minimum necessary controls in the collapsed state:

- track name
- track color
- mute
- solo
- volume indicator or compact control
- track type icon for audio or MIDI

Expanded or inspector state can expose:

- pan
- detailed volume control
- output target placeholder
- comments or note metadata

## 9. Audio Clip Interaction

- imported audio should appear as a waveform clip with immediate visual confirmation
- waveform previews should load progressively when needed
- clip drag, resize, duplicate, and split should use the same rules as other clip types
- audio clips should show loading or unavailable state if media is not ready
- if recording is not in MVP, the UI should not imply recording availability

## 10. MIDI Clip Interaction

- MIDI clips should open in the piano roll without leaving the timeline context
- the piano roll should show a note grid aligned to project timing
- clicking inserts a note when in draw mode or selects a note in select mode
- dragging changes note start time and pitch
- dragging note edges changes duration
- deleting notes should be straightforward and recoverable

The piano roll should prioritize legibility over advanced composition tooling in the MVP.

## 11. Mixer Interaction

- mixer controls should be available in track headers and in an optional mixer-focused view
- volume and pan changes should update immediately in both places
- mute and solo state should be highly visible
- peak feedback should help users avoid clipping without introducing complex mastering controls

The MVP does not need deep routing, but it does need enough feedback for a user to trust the mix.

## 12. Save and Recovery Feedback

- autosave state should always be visible in the top bar
- save states should include saving, saved, offline or retrying, and error
- recovery from unsaved or prior snapshot state should be understandable without technical language
- users should never need to wonder whether an edit was stored

## 13. Collaboration Interactions

- share should be accessible from the top bar
- project roles should be visible in the share panel
- comments should be attachable to a playhead position or selected range
- timeline comment markers should remain visible without overwhelming the arrangement
- resolved comments should be hidden by default or visually de-emphasized

The collaboration flow should feel like an extension of editing, not a separate product area.

## 14. Empty States

### Empty project

The first open of a new project should guide the user toward:

- adding an audio track
- adding a MIDI track
- importing an audio file
- creating the first clip

### Empty collaboration state

If no collaborators or comments exist, the UI should explain sharing and review in one short step.

## 15. Error States

- upload failures should stay close to the affected asset action
- export failures should appear in the export flow with a retry path
- loading failures should preserve as much editor state as possible
- permission errors should clearly explain whether the project is view-only or unavailable

## 16. Keyboard and Efficiency

The MVP should support a small but high-value keyboard set:

- space: play or pause
- delete or backspace: remove selected item
- cmd or ctrl plus d: duplicate selection
- cmd or ctrl plus z: undo
- cmd or ctrl plus shift plus z: redo
- s: split at playhead if no text field is focused
- plus or minus: zoom in or out

Keyboard shortcuts should accelerate frequent actions without becoming a discovery burden.

## 17. Responsive Strategy

The editor should remain usable on smaller laptop screens, but the MVP should optimize for desktop and defer true mobile editing.

On reduced widths:

- secondary panels should collapse before the timeline does
- the mixer should become panel-based instead of always visible
- comment threads should use overlays instead of fixed side panels

## 18. Accessibility Expectations

- interactive controls need clear focus indication
- core controls should remain usable by keyboard
- color should not be the only signal for clip state, mute, solo, or errors
- labels should remain understandable for new users

## 19. Acceptance Criteria

The editor interaction design is acceptable for MVP if:

- a new user can identify how to play the project and add material quickly
- timeline selection and clip manipulation are predictable
- MIDI editing does not require leaving the main editor context
- save state is always visible and understandable
- a collaborator can comment on a specific song moment without confusion

## 20. Follow-Up Design Docs

- wireframe specification
- component inventory
- timeline interaction state machine
- keyboard shortcut map
- comment system UX details
