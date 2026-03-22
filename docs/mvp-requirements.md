# OpenDAW MVP Requirements

## 1. Objective

This document defines the minimum product scope required to launch the first usable version of OpenDAW.

The MVP should prove that a user can create a music project in the browser, build a simple multitrack arrangement with audio and MIDI, save progress safely, share the project with another person, and export a stereo mix.

## 2. MVP Product Goal

The first release is successful if an individual creator can go from an empty project to a shareable song draft without installing a traditional DAW.

The MVP is not intended to replace professional desktop DAWs. It is intended to deliver a fast, reliable, collaborative music creation workflow for early-stage composition and review.

## 3. Target User for MVP

The primary MVP user is a solo musician or songwriter who needs to:

- create a project quickly
- import or record ideas
- edit a song structure on a timeline
- perform basic mixing
- share work for asynchronous review

The MVP should also support a lightweight collaborator who needs to:

- open a shared project
- play back the song
- leave time-based comments

## 4. User Stories

### Creator stories

- As a creator, I can sign in and create a new project so I can start working immediately.
- As a creator, I can set tempo and time signature so the session matches my song structure.
- As a creator, I can add tracks and arrange clips on a timeline so I can build a draft song.
- As a creator, I can import audio and edit MIDI notes so I can combine recorded and programmed material.
- As a creator, I can control play, pause, stop, loop, and timeline position so I can audition my arrangement.
- As a creator, I can adjust volume, pan, mute, and solo so I can create a basic working mix.
- As a creator, I can rely on autosave and version snapshots so I do not lose my work.
- As a creator, I can invite another user to view or edit a project so I can collaborate.
- As a creator, I can export a stereo mix so I can share a finished draft.

### Collaborator stories

- As a collaborator, I can open a shared project in the browser so I can review the current draft.
- As a collaborator, I can leave comments anchored to a time range so feedback is precise and actionable.
- As a collaborator, I can see the latest saved version of the project so I know what I am reviewing.

## 5. In-Scope Functional Requirements

### 5.1 Accounts and access

- Users can register, sign in, sign out, and recover access to their account.
- Users can create personal projects.
- Project owners can invite other users by email or account identity.
- Project permissions support at least `viewer` and `editor`.

### 5.2 Project management

- Users can create, rename, duplicate, archive, and delete projects.
- Each project stores title, owner, collaborators, creation date, and updated date.
- Users can open a recent project from a project list or dashboard.

### 5.3 Timeline and transport

- The editor provides a multitrack timeline view.
- The transport supports play, pause, stop, seek, loop on or off, and timeline ruler display.
- The project stores tempo and time signature as editable session settings.

### 5.4 Track and clip editing

- Users can create audio tracks and MIDI tracks.
- Users can add, move, resize, duplicate, and delete clips on the timeline.
- Users can split clips at a selected playhead position.
- Users can snap clip movement and note editing to a timing grid.

### 5.5 Audio handling

- Users can upload supported audio files into a project.
- Uploaded audio becomes available as clips on audio tracks.
- The system generates preview waveform data for timeline rendering.
- Audio playback remains synchronized with the transport.

### 5.6 MIDI handling

- Users can create MIDI clips on MIDI tracks.
- Users can open a piano roll editor for a clip.
- Users can create, move, resize, and delete MIDI notes.
- MIDI clips can trigger at least one built-in instrument sound source in the MVP.

### 5.7 Mixing

- Each track supports volume and pan controls.
- Each track supports mute and solo state.
- The mixer and track header stay synchronized.
- The master output exposes a simple level control and peak meter.

### 5.8 Save and recovery

- Project edits are autosaved without requiring manual save.
- The system stores recoverable version snapshots at defined intervals or milestones.
- Users can load a prior snapshot version of the project.
- Autosave failures are visible to the user.

### 5.9 Collaboration and comments

- Owners can share projects with viewers and editors.
- Shared users can access projects according to their assigned role.
- Users can add comments attached to a timeline position or time range.
- Comment threads display author, timestamp, and resolved or unresolved state.

### 5.10 Export

- Users can export a stereo mix of the current project.
- The system shows export progress and completion status.
- Users can download the exported file after processing completes.

## 6. Explicitly Out of Scope for MVP

- third-party plugin hosting
- advanced routing, buses, and sidechain
- realtime multi-user co-editing on the same timeline
- marketplace, sample store, or social discovery features
- mobile-native production features
- offline desktop mode
- stem separation, AI generation, or AI-assisted mixing
- advanced mastering workflows

## 7. UX Requirements

- A new user can create a project and reach the editor in a short, obvious flow.
- Core creation actions should be visible without deep menus.
- The arrangement view should prioritize clarity of tracks, clips, and playback position.
- Errors that block creative work should be concise and actionable.
- Autosave state should always be visible.
- Shared users should immediately understand whether they have view or edit access.

## 8. Non-Functional Requirements

### Performance

- Transport actions should feel immediate to the user.
- Timeline editing should remain responsive on typical song-sized sessions for MVP usage.
- Project open time should be acceptable for browser-based creative work.

### Reliability

- The system should avoid silent data loss.
- Failed uploads, saves, and exports should be surfaced clearly.
- Export jobs should be retryable when practical.

### Security

- Projects are private by default.
- Access control is enforced on every project read and write path.
- Media assets use controlled access and should not be publicly exposed by default.

### Observability

- The system logs critical failures for authentication, save, upload, playback initialization, and export.
- Product analytics should capture core funnel events such as project creation, first clip added, first export, and first share.

## 9. Release Readiness Criteria

The MVP is ready to launch when all of the following are true:

- A new user can create an account and open a project successfully.
- A creator can build a simple song draft using at least audio clips and MIDI clips.
- The project autosaves and can recover from a previous snapshot.
- A collaborator can open the shared project and leave comments.
- A creator can export and download a stereo mix.
- Critical user paths are covered by automated and manual validation.

## 10. Acceptance Scenarios

### Scenario A: Solo creation flow

1. User signs in.
2. User creates a new project.
3. User sets tempo and time signature.
4. User imports audio and creates at least one MIDI clip.
5. User edits the arrangement and basic mix.
6. User closes and reopens the project.
7. The latest saved state is preserved.

### Scenario B: Collaboration flow

1. Owner shares a project with another user as `viewer` or `editor`.
2. Collaborator opens the shared project in the browser.
3. Collaborator leaves a comment at a selected timeline range.
4. Owner sees the comment in the project and can resolve it.

### Scenario C: Export flow

1. User starts a stereo export.
2. The system creates an export job and displays progress.
3. The export completes successfully.
4. User downloads the rendered file.

## 11. Product Decisions Needed Before Implementation

- Confirm whether audio recording is required in MVP or if import-first is acceptable for release one.
- Confirm the built-in instrument strategy for MIDI playback in the browser.
- Confirm whether collaboration invitations require full accounts or can support guest review links.
- Confirm whether project version history is user-facing in MVP or only used as an internal recovery tool.
- Confirm the maximum target session size for performance testing.

## 12. Suggested Follow-Up Docs

- technical architecture
- editor interaction design
- audio engine design
- collaboration permission model
- export pipeline design
- QA test plan
