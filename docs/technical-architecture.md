# OpenDAW Technical Architecture

## 1. Objective

This document describes the proposed technical architecture for the OpenDAW MVP. It translates the service design and MVP requirements into an implementation-oriented system structure.

The architecture must support:

- browser-based editing for audio and MIDI projects
- reliable autosave and project recovery
- asynchronous collaboration with comments and permissions
- stereo export workflows
- future expansion toward richer realtime collaboration

## 2. Architecture Principles

- Keep the MVP web-first and deployment-simple.
- Separate media-heavy workflows from request-response application logic.
- Treat project session state as a first-class domain object.
- Prefer operational simplicity over early microservice fragmentation.
- Design for progressive enhancement toward realtime features later.

## 3. High-Level System Shape

The MVP should be built as a modular web platform with:

- a browser client for editing, playback, and collaboration
- an application backend for auth, project APIs, permissions, comments, and session persistence
- a media pipeline for upload processing, waveform generation, and export jobs
- shared storage layers for structured metadata and binary assets

Recommended deployment model for MVP:

- one frontend application
- one backend application, internally modularized by domain
- one worker process for asynchronous jobs
- one relational database
- one object storage bucket or equivalent
- one cache or message broker for job coordination and short-lived state

## 4. Recommended Stack Direction

This is a pragmatic MVP stack recommendation, not a final mandate.

### Frontend

- React with TypeScript
- Vite or Next.js app router, depending on whether integrated backend delivery is preferred
- Web Audio API for browser audio graph and playback scheduling
- Canvas or WebGL-backed rendering for dense timeline and piano roll interactions
- Zustand or equivalent lightweight client state store for editor-local state

### Backend

- TypeScript on Node.js
- NestJS, Fastify, or a structured Express-based service depending on team preference
- REST APIs for MVP product workflows
- WebSocket channel for presence, save state, and future collaboration events

### Persistence and infrastructure

- PostgreSQL for relational data
- S3-compatible object storage for uploaded audio, waveform assets, and exports
- Redis for job queue coordination, cache, presence, and ephemeral collaboration state
- Background job runner for waveform generation, transcoding, and export rendering

## 5. Frontend Architecture

## 5.1 Main application areas

The client should be split into these concerns:

- shell layer: auth gate, workspace navigation, routing
- editor layer: timeline, mixer, piano roll, inspector, comments
- transport layer: playback state, playhead, tempo, loop state
- project sync layer: autosave, loading, optimistic updates, error state
- media layer: upload handling, waveform fetching, preview loading

## 5.2 Frontend module boundaries

- `app shell`: routes, workspace navigation, recent projects, settings
- `editor store`: currently selected project, selection state, edit mode, zoom, snapping
- `timeline engine`: track rendering, clip layout, drag-resize, split, duplication
- `midi editor`: note grid, note editing, quantization, velocity defaults
- `audio engine`: playback scheduling, clip alignment, audition preview, metronome
- `collaboration client`: comments, presence, share state, access awareness

## 5.3 Client state categories

- server state: project metadata, permissions, comments, snapshots
- persistent session state: tracks, clips, automation, transport settings
- transient UI state: selections, cursor, drag handles, panel visibility
- realtime ephemeral state: presence, save indicator, export progress

These categories should remain intentionally separate to avoid coupling UI movement to save semantics.

## 6. Backend Architecture

## 6.1 Core application modules

- `auth`: account lifecycle, sessions, password reset, identity checks
- `users`: profile and workspace identity data
- `projects`: project CRUD, duplication, archive state, collaborator assignment
- `sessions`: track and clip state, session serialization, autosave snapshots
- `media`: upload registration, asset metadata, waveform generation requests
- `comments`: anchored comments, resolution state, audit metadata
- `exports`: export job lifecycle and downloadable artifacts
- `permissions`: authorization checks across project resources
- `notifications`: invitation and product event messaging

## 6.2 API shape

The MVP should prefer versioned REST endpoints for reliability and implementation speed.

Representative API groups:

- `POST /auth/login`
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `POST /projects/:id/share`
- `GET /projects/:id/session`
- `PUT /projects/:id/session`
- `POST /projects/:id/snapshots`
- `GET /projects/:id/comments`
- `POST /projects/:id/comments`
- `POST /projects/:id/uploads`
- `POST /projects/:id/exports`

WebSocket channels should initially be limited to:

- presence updates
- save state notifications
- export progress events
- comment or share state refresh hints

## 7. Session Data Model

The project session is the main editable document in the MVP. It should be stored in a structured JSON form that is stable, versioned, and independent from the UI implementation.

Suggested session document sections:

- project settings: tempo, time signature, master settings
- tracks: track order, type, mixer values, output assignment
- clips: placement, references to media assets or MIDI content
- midi note data: note pitch, timing, length, velocity
- automation placeholders for future use
- markers and arrangement metadata

Recommended approach:

- store normalized project metadata in relational tables
- store session document revisions in a dedicated table or revision store
- create snapshots on interval and milestone boundaries

## 8. Media Pipeline

## 8.1 Upload flow

1. Client requests upload intent from backend.
2. Backend issues secure upload target.
3. Client uploads audio file to object storage.
4. Backend records asset metadata and queues waveform generation.
5. Worker produces waveform or preview artifacts.
6. Client fetches waveform data for timeline rendering.

## 8.2 Export flow

1. Client requests stereo export.
2. Backend creates export job record.
3. Worker loads project session and referenced assets.
4. Worker renders output audio.
5. Export artifact is stored in object storage.
6. Backend marks job complete and notifies client.

The export worker can use a dedicated rendering engine or a server-side audio graph implementation. The MVP should choose the simplest approach that gives deterministic results.

## 9. Realtime and Autosave Model

The MVP should avoid fully concurrent editing semantics, but it still needs responsive save behavior and lightweight shared awareness.

Recommended model:

- client applies edits locally first
- autosave batches deltas or document writes on a debounce interval
- backend writes the latest session revision and snapshot metadata
- websocket emits save status and optional presence signals
- editor reconnect logic reconciles against latest persisted revision

Conflict handling for MVP:

- use last-write-wins at session level or track subset level
- surface stale editor warnings when another editor has changed the project recently
- avoid silent overwrite where practical

## 10. Data Storage

### Relational database tables

- users
- workspaces
- projects
- project_members
- project_sessions
- project_snapshots
- media_assets
- comments
- export_jobs
- audit_events

### Object storage prefixes

- `projects/{projectId}/uploads/`
- `projects/{projectId}/waveforms/`
- `projects/{projectId}/exports/`

## 11. Security Model

- All project resources require authenticated access unless explicitly shared through a future public review mode.
- Every project read or write checks membership and role.
- Upload and download URLs should be scoped and time-limited.
- Session writes should validate project access and request origin.
- Audit logging should capture share changes, snapshot restores, and export requests.

## 12. Deployment Model

MVP environments should include:

- local development
- staging
- production

Recommended deployment units:

- frontend app
- backend API app
- worker app
- PostgreSQL
- Redis
- object storage

The first release should favor containerized deployment with simple horizontal scaling on API and worker processes.

## 13. Observability

- structured logging for API requests, worker jobs, and editor save failures
- metrics for project opens, save latency, export duration, upload failures, and playback initialization failures
- tracing across upload, save, and export pipelines where possible
- alerting for job queue buildup, export failure spikes, and auth service instability

## 14. Risks and Tradeoffs

- Browser audio timing can diverge from server-side export behavior if rendering engines are not aligned.
- A single session document is simple to build but can become large under heavy editing.
- Rich realtime editing should be deferred because it complicates synchronization and conflict semantics.
- Canvas-heavy editor rendering improves performance but increases implementation complexity.
- Server-side rendering of exports simplifies consistency but increases infrastructure cost.

## 15. Initial Build Order

1. Auth, projects, and dashboard flows
2. Session document model and autosave APIs
3. Timeline editor with audio import and clip operations
4. MIDI editor and built-in instrument playback
5. Comments and project sharing
6. Export jobs and artifact delivery

## 16. Open Technical Decisions

- Choose between a single integrated TypeScript platform and a more split deployment model.
- Decide whether session persistence stores full documents, deltas, or both.
- Choose the browser rendering technology for timeline density and smooth zooming.
- Confirm the server-side export rendering engine.
- Define the maximum supported session size for the MVP performance budget.
