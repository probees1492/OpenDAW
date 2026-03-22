# OpenDAW Wireframe Specification

## 1. Objective

This document translates the editor interaction design into concrete wireframe-level screens and regions for the MVP. It is intended to guide product discussion, UI implementation, and later visual design work.

The goal is not to define final visuals. The goal is to define information hierarchy, primary actions, and screen states.

## 2. Wireframe Principles

- Keep the editing surface dominant over navigation chrome.
- Make the transport and save state visible in every editing context.
- Keep collaboration actions close to the project context.
- Avoid modal flows for frequent editing tasks.
- Let empty states teach the next meaningful action.

## 3. Screen Inventory

The MVP needs these primary screens or shells:

- authentication screen
- project dashboard
- new project flow
- main editor
- share panel
- export panel
- snapshot or recovery panel

## 4. Authentication Screen

### Purpose

Allow sign in, sign up, and account recovery.

### Regions

- brand area with short product statement
- primary auth form
- secondary action links for sign up and password reset

### Key requirements

- one dominant action at a time
- concise error messaging
- no editor-specific complexity on this screen

## 5. Project Dashboard

### Purpose

Let the user create, open, and manage projects.

### Regions

- top bar with account menu and create project action
- project list or grid
- recent activity or updated time
- filters or sort controls if needed

### Item contents

Each project card or row should show:

- project title
- owner or workspace
- updated timestamp
- collaborator count if applicable
- quick actions for open, rename, duplicate, archive, or delete

### Empty state

The first-time dashboard should show:

- short explanation of what a project is
- primary call to create a new project
- optional template entry points

## 6. New Project Flow

### Purpose

Create a project with minimal friction.

### Modes

- blank project
- template-based project if templates exist in MVP

### Required inputs

- project title
- optional tempo
- optional time signature

### Actions

- create and open project
- cancel and return to dashboard

This flow should be light enough to feel nearly instant.

## 7. Main Editor Shell

### Purpose

Provide the primary composition, arrangement, and collaboration environment.

### Core layout

- top application bar
- transport bar
- left track header column
- central timeline canvas
- bottom contextual panel
- right contextual side panel

### Layout priorities

- timeline gets most horizontal and vertical space
- transport stays pinned
- contextual panels can collapse without hiding transport or timeline

## 8. Main Editor Regions

## 8.1 Top application bar

### Contents

- project title
- save state indicator
- share button
- export button
- project menu
- account menu

### Behavior

- save state must update without moving layout
- share and export actions open side panels or overlays rather than full page changes

## 8.2 Transport bar

### Contents

- play
- pause
- stop
- record only if MVP includes recording
- loop toggle
- playhead time display
- tempo
- time signature
- metronome
- zoom summary or snap setting if space permits

### Behavior

- transport remains visible during scroll
- playback state is visually obvious
- disabled states are explicit when audio is not ready

## 8.3 Left track header column

### Track row contents

- track color chip
- track name
- track type icon
- mute
- solo
- compact volume control or indicator

### Add-track area

- primary button to add audio or MIDI track
- empty-track guidance for first project state

## 8.4 Central timeline canvas

### Timeline contents

- ruler with bars or beats and loop region
- vertical playhead
- track lanes
- clip blocks
- waveform views for audio clips
- comments markers
- selection outlines and drag handles

### Behavior

- scrollable horizontally and vertically
- zoomable in time resolution
- drag and resize interactions happen here
- loop range is editable on the ruler

## 8.5 Bottom contextual panel

The bottom panel changes by context:

- piano roll for selected MIDI clip
- clip detail view for selected audio clip
- comments list for selected comment marker or review mode
- hidden state when not needed

### Requirements

- panel switching should not disorient the user
- user should always understand why a panel opened
- closing the panel should preserve editor context

## 8.6 Right side panel

The right panel can host:

- inspector
- project details
- sharing controls
- comment thread details
- export status
- snapshot recovery controls

The panel should be narrow enough to avoid crushing the timeline but wide enough for forms and metadata.

## 9. Editor Wireframe States

## 9.1 Empty project state

When a new project opens with no tracks or clips, the editor should show:

- visible add track controls
- guidance text inside the timeline area
- import audio shortcut
- create MIDI clip shortcut

### Purpose

The empty project state must teach the first action without feeling like a tutorial trap.

## 9.2 Active arrangement state

When the user has multiple tracks and clips:

- the timeline dominates the view
- bottom and right panels are optional and contextual
- transport and save state remain persistent

## 9.3 Comment review state

When the user reviews comments:

- timeline markers stay visible
- a comment list or thread opens in a side panel
- clicking a comment moves focus to the linked time range

## 9.4 Export state

When the user triggers export:

- export panel opens without leaving the editor
- current status is visible until completion
- user can close the panel and continue editing if product behavior permits

## 10. Share Panel Wireframe

### Contents

- current project access summary
- collaborator list
- role selector for each collaborator
- invite input
- copy link action if supported

### States

- no collaborators
- pending invite
- existing editor
- existing viewer

### Rules

- owner permissions should be clearly distinguished
- destructive permission changes should require confirmation when appropriate

## 11. Export Panel Wireframe

### Contents

- export format summary
- start export action
- job progress indicator
- completed artifact download action
- error or retry state

### MVP simplification

- stereo mix only
- minimal configuration

## 12. Snapshot and Recovery Panel

### Purpose

Allow the user to understand save history and recover prior state when needed.

### Contents

- latest autosave status
- recent snapshots list
- timestamp and optional labels
- restore action

### Rules

- restoring state must be clearly explained
- recovery UI must avoid technical jargon

## 13. Responsive Wireframe Notes

On reduced widths:

- right panel becomes overlay or drawer
- bottom panel can expand over part of the timeline
- secondary controls compress into menus before transport controls do
- project title and save state remain visible

The MVP should still be desktop-first, but these rules keep the product usable on smaller laptops.

## 14. Accessibility Notes

- focus order should follow the visual hierarchy
- all primary actions need text labels or accessible names
- panel open and close state should be announced to assistive technology
- selection state needs non-color cues

## 15. Deliverables to Follow

- low-fidelity annotated wireframes
- component map by region
- interaction state notes for timeline and panels
- handoff-ready screen definitions for implementation
