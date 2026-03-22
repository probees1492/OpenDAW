# OpenDAW Timeline Interaction State Machine

## 1. Objective

This document defines the interaction states and state transitions for the OpenDAW timeline in the MVP. Its purpose is to make clip editing behavior predictable, testable, and implementation-friendly.

The timeline is the highest-interaction part of the product. Ambiguity here will create user confusion and brittle code.

## 2. Principles

- Only one primary pointer-driven timeline interaction should be active at a time.
- Selection state and manipulation state must remain distinct.
- Pointer movement should not commit an edit until drag thresholds are passed.
- State transitions must support cancel and rollback paths.
- Clip and empty-space interactions should share consistent rules.

## 3. State Model Overview

The timeline interaction machine should manage these top-level states:

- `idle`
- `hovering`
- `selecting_clip`
- `selecting_marquee`
- `dragging_clip`
- `resizing_clip_start`
- `resizing_clip_end`
- `seeking_playhead`
- `editing_loop_range`
- `opening_context_menu`
- `error_recovery`

The current selection model exists alongside these states but is not the same thing.

## 4. Shared Context

The state machine should have access to:

- selected clip ids
- selected track ids if any
- hovered clip id
- active pointer origin
- current modifier keys
- current snap mode
- current zoom level
- current playhead position
- visible loop range
- drag threshold status

## 5. Events

Representative events:

- `POINTER_DOWN_EMPTY`
- `POINTER_DOWN_CLIP_BODY`
- `POINTER_DOWN_CLIP_START_HANDLE`
- `POINTER_DOWN_CLIP_END_HANDLE`
- `POINTER_DOWN_RULER`
- `POINTER_MOVE`
- `POINTER_UP`
- `POINTER_CANCEL`
- `KEY_ESCAPE`
- `KEY_DELETE`
- `KEY_DUPLICATE`
- `KEY_SPLIT`
- `CONTEXT_MENU`
- `SCROLL`
- `ZOOM`

## 6. Top-Level States

## 6.1 `idle`

Meaning:

- no active pointer manipulation is in progress

Allowed entry sources:

- initial state
- completed interaction
- cancelled interaction

Possible transitions:

- to `hovering` when pointer enters an interactive region
- to `selecting_clip` on clip body pointer down
- to `selecting_marquee` on empty-space pointer down plus drag intent
- to `resizing_clip_start` on start handle pointer down
- to `resizing_clip_end` on end handle pointer down
- to `seeking_playhead` on ruler pointer down
- to `opening_context_menu` on context menu invocation

## 6.2 `hovering`

Meaning:

- pointer is over an interactive clip or ruler region

Possible transitions:

- to `idle` when hover target clears
- to `selecting_clip` on pointer down over clip body
- to `resizing_clip_start` on pointer down over left resize handle
- to `resizing_clip_end` on pointer down over right resize handle
- to `seeking_playhead` on ruler pointer down

## 6.3 `selecting_clip`

Meaning:

- user pressed on a clip but has not yet exceeded drag threshold

Entry actions:

- compute selection result based on current modifiers
- store pointer origin and clip target

Possible transitions:

- to `dragging_clip` when pointer move exceeds drag threshold
- to `idle` on pointer up with selection committed
- to `idle` on escape with selection reverted if needed

## 6.4 `selecting_marquee`

Meaning:

- user is dragging across empty timeline space to select multiple clips

Entry actions:

- store marquee start point
- initialize marquee rectangle

During state:

- update marquee bounds on pointer move
- compute intersecting clips

Possible transitions:

- to `idle` on pointer up with marquee selection committed
- to `idle` on escape with marquee cancelled

## 6.5 `dragging_clip`

Meaning:

- user is moving one or more selected clips

Entry actions:

- capture initial clip positions
- compute drag anchor against selection

During state:

- update provisional clip positions
- apply snapping rules unless temporarily disabled
- clamp moves if track or timeline constraints require it

Possible transitions:

- to `idle` on pointer up with move committed
- to `idle` on escape with positions reverted
- to `error_recovery` if move resolution fails unexpectedly

## 6.6 `resizing_clip_start`

Meaning:

- user is adjusting the left boundary of a clip

Entry actions:

- capture original clip boundaries

During state:

- update provisional start time
- preserve minimum clip duration
- update source offset rules for audio clips where needed

Possible transitions:

- to `idle` on pointer up with resize committed
- to `idle` on escape with resize reverted
- to `error_recovery` on invalid resolution

## 6.7 `resizing_clip_end`

Meaning:

- user is adjusting the right boundary of a clip

During state:

- update provisional end time
- enforce minimum clip duration

Possible transitions:

- to `idle` on pointer up with resize committed
- to `idle` on escape with resize reverted
- to `error_recovery` on invalid resolution

## 6.8 `seeking_playhead`

Meaning:

- user is positioning the playhead via the ruler or timeline seek gesture

Entry actions:

- compute target project time from pointer location

During state:

- update provisional playhead location as pointer moves

Possible transitions:

- to `idle` on pointer up with seek committed
- to `idle` on pointer cancel with prior playhead restored if product rules require

## 6.9 `editing_loop_range`

Meaning:

- user is creating or modifying the loop range on the ruler

Entry actions:

- capture prior loop start and end

During state:

- update provisional loop boundaries
- normalize start and end ordering
- apply snap rules

Possible transitions:

- to `idle` on pointer up with loop change committed
- to `idle` on escape with loop range reverted

## 6.10 `opening_context_menu`

Meaning:

- timeline interaction is temporarily yielding to contextual action selection

Possible transitions:

- to `idle` when the context menu closes
- to action-specific flows handled outside the pointer machine

## 6.11 `error_recovery`

Meaning:

- the machine detected an invalid or failed interaction commit

Entry actions:

- revert provisional changes
- log diagnostic metadata
- surface safe feedback to the user

Possible transitions:

- to `idle` after cleanup

## 7. Selection Rules

- clicking a non-selected clip selects that clip
- shift-click toggles or extends multi-selection by product rule
- clicking empty space clears clip selection unless a marquee selection starts
- marquee selection should respect current track visibility
- selected clips remain selected after duplicate and split when practical

Selection changes should happen before manipulation state begins so drag behavior is predictable.

## 8. Modifier Rules

- shift modifies selection behavior
- alt or option can disable snap or trigger duplication by product decision
- meta or ctrl shortcuts trigger duplicate, undo, redo, and split outside pointer drag flow

These rules should be normalized into machine-readable modifier flags before transition logic runs.

## 9. Snap Resolution Rules

Snap logic should apply consistently in:

- clip drag
- clip resize
- playhead seek if enabled
- loop range editing

Snap inputs may include:

- visible grid resolution
- tempo and time signature
- clip edges
- playhead or marker positions in future iterations

## 10. Commit Semantics

An interaction commit should:

- validate resulting clip geometry
- generate one editor action payload
- update canonical session state once
- emit undoable history entries

A drag should not write partial canonical edits on every pointer move unless the editor architecture explicitly requires it.

## 11. Cancel Semantics

Escape or pointer cancel should:

- revert provisional interaction data
- leave prior canonical state intact
- keep selection if product behavior expects continuity

Cancel must be reliable for drag, resize, marquee, and loop edits.

## 12. Keyboard-Driven Actions

Keyboard actions should operate from `idle` or compatible selection states:

- `delete` removes current selection
- `duplicate` clones selection at defined target position
- `split` splits selected clip or clips at playhead
- `undo` and `redo` bypass pointer substate and operate on editor history

If a pointer interaction is active, keyboard behavior should be explicitly defined rather than incidental.

## 13. Testing Scenarios

The implementation should be validated against at least these scenarios:

- click to select one clip
- shift-click to build multi-selection
- drag selected clip with snapping
- resize clip start and preserve valid bounds
- resize clip end and preserve valid bounds
- marquee select multiple clips across lanes
- cancel drag with escape
- seek playhead from ruler
- create or modify loop range
- open context menu without corrupting selection state

## 14. Recommended Implementation Shape

- keep the machine pure where possible
- separate state transition logic from rendering code
- emit high-level editor intents rather than directly mutating view objects
- centralize drag threshold and snap resolution helpers

This will make the timeline interaction system easier to test and evolve.

## 15. Open Questions

- Should alt or option drag duplicate clips immediately or remain out of MVP?
- Should marquee selection start immediately on empty down or only after threshold?
- Should seeking while playing scrub visually only or alter transport in realtime?
- Should loop range editing use dedicated handles or ruler drag gestures only?
