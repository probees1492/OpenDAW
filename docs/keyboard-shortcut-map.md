# OpenDAW Keyboard Shortcut Map

## 1. Objective

This document defines the MVP keyboard shortcut system for OpenDAW. It specifies which shortcuts exist, where they apply, when they are blocked, and how they interact with editor state.

The goal is to make keyboard behavior predictable, discoverable, and safe in a high-interaction editing environment.

## 2. Shortcut Design Principles

- Prefer a small, high-value shortcut set for MVP.
- Keep behavior consistent across macOS and Windows where possible.
- Do not let shortcuts fire unexpectedly while the user is typing.
- Keep transport and editing shortcuts available without deep mode switching.
- Resolve shortcut conflicts explicitly instead of implicitly.

## 3. Platform Mapping

For documentation purposes:

- `Mod` means `Command` on macOS
- `Mod` means `Control` on Windows and Linux
- `Alt` means `Option` on macOS

## 4. Input Contexts

Shortcuts must be interpreted within these contexts:

- global application context
- editor idle context
- timeline interaction context
- piano roll context
- text input context
- modal or confirmation context

Shortcut handlers should receive the active context before deciding whether to execute.

## 5. Global Rules

- If focus is inside a text input, textarea, or editable field, editing shortcuts must not fire unless explicitly allowed.
- If a modal dialog is open, only modal-relevant shortcuts should execute.
- If a pointer drag interaction is active, only cancel or interaction-specific shortcuts should remain active.
- When a shortcut is blocked, the system should fail silently rather than perform a surprising fallback action.

## 6. Core Global Shortcuts

### Playback and transport

- `Space`: play or pause
- `Shift + Space`: play from current selection or loop start if supported
- `Enter`: stop
- `L`: toggle loop on or off when text input is not focused

### History

- `Mod + Z`: undo
- `Mod + Shift + Z`: redo
- `Mod + Y`: redo on Windows-friendly mapping if supported

### Save and session

- `Mod + S`: force save if manual save exists, otherwise surface saved state or no-op safely
- `Escape`: cancel current interaction, close transient UI, or clear focus based on priority

## 7. Timeline Shortcuts

These shortcuts apply when the editor is focused and no text field is active.

### Selection and editing

- `Delete` or `Backspace`: delete selected clips, notes, or comments depending on active selection
- `Mod + D`: duplicate current selection
- `S`: split selected clip or clips at the playhead
- `A`: select all clips in current applicable scope if adopted for MVP

### Navigation and zoom

- `+` or `=`: zoom in
- `-` or `_`: zoom out
- `Home`: move playhead to project start if supported
- `Left Arrow`: nudge playhead left by the current grid unit or configured step
- `Right Arrow`: nudge playhead right by the current grid unit or configured step

### View toggles

- `B`: toggle bottom panel visibility if adopted for MVP
- `I`: toggle inspector or right panel visibility if adopted for MVP

## 8. Piano Roll Shortcuts

These shortcuts apply when the piano roll has active focus.

- `Delete` or `Backspace`: delete selected notes
- `Mod + D`: duplicate selected notes
- `Mod + A`: select all notes in the active clip
- `Left Arrow`: move selected notes left by grid step
- `Right Arrow`: move selected notes right by grid step
- `Up Arrow`: move selected notes up by semitone
- `Down Arrow`: move selected notes down by semitone
- `Shift + Up Arrow`: move selected notes up by octave if adopted
- `Shift + Down Arrow`: move selected notes down by octave if adopted

Piano roll shortcuts should override timeline shortcuts only while piano roll focus is explicit.

## 9. Share, Export, and Panel Shortcuts

- `Mod + Shift + E`: open export panel if adopted
- `Mod + Shift + S`: open share panel if adopted
- `Escape`: close currently focused panel before clearing timeline selection

The MVP can defer some panel-specific shortcuts if discoverability cost outweighs value.

## 10. Context Priority Rules

When more than one shortcut target could handle the same key, use this order:

1. modal or confirmation context
2. text input context
3. active pointer interaction context
4. focused panel context such as piano roll
5. editor-wide context
6. global application context

This priority order prevents editor shortcuts from breaking direct manipulation or text entry.

## 11. Escape Key Behavior

`Escape` needs deterministic behavior because it is overloaded across the editor.

Priority order for `Escape`:

1. cancel active drag, resize, marquee, seek, or loop interaction
2. close context menu
3. close modal or transient overlay
4. close focused side or bottom panel if it was transiently opened
5. clear current selection
6. no-op

The editor should not guess. It should apply this order consistently.

## 12. Delete Key Behavior

`Delete` or `Backspace` should remove the most directly active selection by this order:

1. selected MIDI notes in focused piano roll
2. selected clips in timeline
3. selected comment draft or target if product rules allow
4. no-op

Destructive keyboard actions should remain undoable.

## 13. Shortcut Blocking Rules

Shortcuts should be blocked in these cases:

- the user is typing in project title, comment composer, invite field, or any text input
- the browser or OS reserves the shortcut and OpenDAW should not override it
- a modal requires exclusive keyboard focus
- a background loading state temporarily disables the relevant action

## 14. Visual and UX Requirements

- high-value shortcuts should appear in tooltips, menus, or context actions
- shortcut labels should use platform-correct notation
- blocked shortcuts should not produce unexpected side effects
- users should be able to learn the core editing set without reading a manual

## 15. Recommended MVP Shortcut Set

The minimum recommended set for release one is:

- `Space`
- `Enter`
- `Escape`
- `Mod + Z`
- `Mod + Shift + Z`
- `Delete` or `Backspace`
- `Mod + D`
- `S`
- `+` or `=`
- `-` or `_`

This set is small enough to stay learnable and large enough to materially improve editing speed.

## 16. Testing Scenarios

The shortcut system should be validated with at least these cases:

- `Space` toggles transport when the editor is focused
- `Space` does not toggle transport while typing in a text field
- `Delete` removes selected clips in timeline context
- `Delete` removes selected notes in piano roll context
- `Escape` cancels active drag and restores prior state
- `Mod + D` duplicates selected clips
- `S` splits selected clips at the playhead
- `Mod + Z` undoes the last editor action
- zoom shortcuts operate on the timeline rather than browser page zoom if supported by implementation

## 17. Open Questions

- Should `A` mean select all, add track, or stay unused in MVP?
- Should `L` toggle loop in the MVP or remain toolbar-only for discoverability?
- Should `Mod + S` trigger a visible save confirmation even when autosave is primary?
- Which optional panel shortcuts are worth supporting in release one?
