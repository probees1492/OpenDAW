# OpenDAW Component Inventory

## 1. Objective

This document breaks the OpenDAW MVP UI into implementation-oriented components. It is intended to guide frontend architecture, ownership boundaries, and incremental delivery.

The focus is on component responsibility, composition, and data flow rather than final styling.

## 2. Component Principles

- Keep components aligned to product concepts, not arbitrary DOM slices.
- Separate canonical project data from transient interaction state.
- Prefer container and presenter boundaries where editor complexity is high.
- Avoid monolithic editor components that own unrelated state.
- Design components so timeline-heavy interactions can evolve without rewriting the whole shell.

## 3. Top-Level Application Components

### `AppRoot`

Responsibilities:

- initialize routing
- hydrate auth session
- provide global providers for query, editor state, and theme

Inputs:

- persisted auth state
- environment configuration

Children:

- `AuthShell`
- `DashboardShell`
- `EditorShell`

### `AuthShell`

Responsibilities:

- render sign in, sign up, and recovery views
- submit auth actions
- surface auth errors

### `DashboardShell`

Responsibilities:

- fetch and display projects
- handle project creation entry points
- host project list actions

### `EditorShell`

Responsibilities:

- load project metadata and session data
- compose editor layout
- coordinate save status and collaboration context

## 4. Dashboard Components

### `ProjectDashboardPage`

Responsibilities:

- render dashboard layout and list state
- connect project queries to list presentation

Children:

- `DashboardTopBar`
- `ProjectList`
- `EmptyProjectsState`

### `DashboardTopBar`

Responsibilities:

- show account menu
- trigger project creation flow
- expose sort or filter controls if needed

### `ProjectList`

Responsibilities:

- render project collection
- switch between loading, empty, and populated states

Children:

- `ProjectCard` or `ProjectRow`

### `ProjectCard`

Responsibilities:

- show project summary
- expose open and quick actions

Inputs:

- title
- updated timestamp
- owner or workspace
- collaborator summary

## 5. Editor Shell Components

### `EditorPage`

Responsibilities:

- render the full editor workspace
- bridge loaded session data into editor domain state

Children:

- `EditorTopBar`
- `TransportBar`
- `TrackHeaderPane`
- `TimelineViewport`
- `BottomPanelHost`
- `RightPanelHost`

### `EditorTopBar`

Responsibilities:

- display project title
- show save state
- host share and export actions
- expose project menu

Children:

- `ProjectTitleField`
- `SaveStatusBadge`
- `ShareButton`
- `ExportButton`
- `ProjectMenu`

### `TransportBar`

Responsibilities:

- display and control transport state
- edit tempo, time signature, loop, and metronome state

Children:

- `TransportControls`
- `PlayheadDisplay`
- `TempoControl`
- `TimeSignatureControl`
- `LoopToggle`
- `MetronomeToggle`
- `SnapIndicator`

### `TrackHeaderPane`

Responsibilities:

- render track header rows
- keep header controls aligned to visible timeline tracks

Children:

- `AddTrackButton`
- repeated `TrackHeaderRow`

### `TrackHeaderRow`

Responsibilities:

- show track identity and basic mixer state
- reflect track selection and arm state if present

Children:

- `TrackColorChip`
- `TrackNameField`
- `TrackTypeIcon`
- `MuteButton`
- `SoloButton`
- `TrackVolumeMiniControl`

### `TimelineViewport`

Responsibilities:

- host the timeline canvas and rulers
- handle viewport scrolling and zoom
- connect pointer interactions to editor actions

Children:

- `TimelineRuler`
- `PlayheadOverlay`
- repeated `TrackLane`
- `CommentMarkerLayer`
- `SelectionOverlay`

## 6. Timeline Components

### `TimelineRuler`

Responsibilities:

- render bar and beat divisions
- display and edit loop range
- support seek interaction

### `TrackLane`

Responsibilities:

- render clips for one track
- handle drop targets and lane-local selection visuals

Children:

- repeated `TimelineClip`

### `TimelineClip`

Responsibilities:

- render clip body, selection state, resize handles, and waveform or MIDI preview
- emit pointer events for selection, drag, resize, and context menu

Variants:

- `AudioClip`
- `MidiClip`

### `SelectionOverlay`

Responsibilities:

- render marquee selection
- show selected bounds and interaction affordances

### `CommentMarkerLayer`

Responsibilities:

- render comment anchors in timeline space
- map marker interaction to comment panel focus

## 7. Bottom Panel Components

### `BottomPanelHost`

Responsibilities:

- choose which contextual panel is visible
- preserve panel state when switching where appropriate

Variants:

- `PianoRollPanel`
- `AudioClipDetailPanel`
- `CommentsPanel`

### `PianoRollPanel`

Responsibilities:

- render MIDI note editor for selected clip
- manage note editing interactions

Children:

- `PianoRollToolbar`
- `PianoKeyboard`
- `MidiGrid`
- repeated `MidiNoteBlock`

### `AudioClipDetailPanel`

Responsibilities:

- show clip metadata and audio-specific controls
- surface source offset and preview information

### `CommentsPanel`

Responsibilities:

- display project or selection-linked comments
- enable comment creation, reply, and resolution

Children:

- `CommentComposer`
- repeated `CommentThread`

## 8. Right Panel Components

### `RightPanelHost`

Responsibilities:

- render inspector-like contextual side content
- switch between share, export, project detail, comment detail, and recovery flows

Variants:

- `InspectorPanel`
- `SharePanel`
- `ExportPanel`
- `SnapshotPanel`
- `CommentDetailPanel`

### `SharePanel`

Responsibilities:

- list collaborators
- manage invite and role changes

Children:

- `CollaboratorList`
- `InviteCollaboratorForm`
- `RoleSelector`

### `ExportPanel`

Responsibilities:

- show export action, progress, completion, and retry state

Children:

- `ExportSummary`
- `ExportProgress`
- `ExportActionButton`
- `DownloadArtifactButton`

### `SnapshotPanel`

Responsibilities:

- show autosave state and snapshot history
- allow recovery actions

Children:

- `SnapshotList`
- `SnapshotRestoreButton`

## 9. Interaction Utility Components

### `ContextMenu`

Responsibilities:

- host clip, track, or comment contextual actions

### `KeyboardShortcutLayer`

Responsibilities:

- map user shortcuts to editor actions
- avoid firing shortcuts when text fields are focused

### `ToastHost`

Responsibilities:

- show non-blocking feedback for save, export, share, and error events

### `ModalHost`

Responsibilities:

- handle infrequent confirmation flows
- avoid overuse for common editor actions

## 10. Data and State Containers

### `ProjectSessionProvider`

Responsibilities:

- hold loaded project session data
- expose mutation actions for editor features

### `EditorViewStateStore`

Responsibilities:

- hold selection state, zoom level, scroll offsets, panel visibility, and drag state

### `TransportStateStore`

Responsibilities:

- hold play state, playhead, loop range, and metronome settings

### `CollaborationStateStore`

Responsibilities:

- hold presence, comment focus, share panel state, and collaborator awareness

## 11. Suggested Ownership Boundaries

- app shell and dashboard components
- editor layout and panel orchestration
- timeline and clip interaction components
- piano roll components
- collaboration and comments components
- export and recovery components

These can later map cleanly to separate implementation workstreams.

## 12. Initial Build Order

1. `AppRoot`, `DashboardShell`, `ProjectDashboardPage`
2. `EditorShell`, `EditorPage`, `EditorTopBar`, `TransportBar`
3. `TrackHeaderPane`, `TimelineViewport`, `TrackLane`, `TimelineClip`
4. `BottomPanelHost`, `PianoRollPanel`
5. `SharePanel`, `CommentsPanel`
6. `ExportPanel`, `SnapshotPanel`

## 13. Open Questions

- How much of the timeline should be canvas-driven versus DOM-backed in the MVP?
- Should the track header and timeline lane share a virtualization strategy from the start?
- Should comments live primarily in the bottom panel or the right panel during review-heavy workflows?
- Which components need to be collaboration-aware in MVP versus later phases?
