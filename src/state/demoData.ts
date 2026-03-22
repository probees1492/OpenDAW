import type { ProjectSession, ProjectSummary } from "./types";

export const demoProjects: ProjectSummary[] = [
  {
    id: "project-opendaw",
    name: "OpenDAW MVP Session",
    owner: "probees1492",
    collaborators: "3 collaborators",
    updatedAt: "Updated 8 minutes ago",
    status: "Draft",
    summary: "Web-first songwriting session with arrangement, comments, and export shell.",
  },
  {
    id: "project-neon-drums",
    name: "Neon Drums Review",
    owner: "probees1492",
    collaborators: "1 collaborator",
    updatedAt: "Updated yesterday",
    status: "Review",
    summary: "A feedback-focused mix review project anchored to timeline comments.",
  },
];

export const demoSessions: Record<string, ProjectSession> = {
  "project-opendaw": {
    projectId: "project-opendaw",
    tempo: 128,
    timeSignature: "4/4",
    playhead: "17.2.120",
    playheadBar: 1,
    transport: "stopped",
    loopRange: {
      start: 1,
      end: 5,
      enabled: true,
    },
    tracks: [
      {
        id: "track-lead-vox",
        name: "Lead Vox",
        type: "Audio",
        color: "amber",
        muted: false,
        solo: false,
        clips: [
          { id: "clip-vox-1", name: "Verse Vox", start: 0.5, length: 1.8, color: "sun" },
          { id: "clip-vox-2", name: "Hook Double", start: 3.1, length: 1.4, color: "rose" },
        ],
      },
      {
        id: "track-keys",
        name: "Keys",
        type: "MIDI",
        color: "cyan",
        muted: false,
        solo: false,
        clips: [
          { id: "clip-keys-1", name: "MIDI Chords", start: 0.2, length: 2.6, color: "cyan" },
          { id: "clip-keys-2", name: "Lead Layer", start: 4.1, length: 1.8, color: "mint" },
        ],
      },
      {
        id: "track-drums",
        name: "Drums",
        type: "Audio",
        color: "rose",
        muted: false,
        solo: false,
        clips: [
          { id: "clip-drums-1", name: "Kick + Snare", start: 0, length: 2.2, color: "ember" },
          { id: "clip-drums-2", name: "Perc Loop", start: 2.8, length: 2.6, color: "amber" },
        ],
      },
      {
        id: "track-bass",
        name: "Bass",
        type: "MIDI",
        color: "lime",
        muted: false,
        solo: false,
        clips: [
          { id: "clip-bass-1", name: "Bass Phrase", start: 1.4, length: 2.2, color: "lime" },
        ],
      },
    ],
    comments: [
      {
        id: "comment-1",
        author: "probees1492",
        body: "Hook vocal needs a cleaner transition into bar 17.",
        anchorLabel: "Bars 17-18",
        resolved: false,
      },
      {
        id: "comment-2",
        author: "collaborator",
        body: "Try muting the keys during the pickup to open more space.",
        anchorLabel: "Bar 16.4",
        resolved: false,
      },
    ],
  },
  "project-neon-drums": {
    projectId: "project-neon-drums",
    tempo: 122,
    timeSignature: "4/4",
    playhead: "9.1.000",
    playheadBar: 2,
    transport: "paused",
    loopRange: {
      start: 2,
      end: 4,
      enabled: false,
    },
    tracks: [
      {
        id: "track-kit",
        name: "Main Kit",
        type: "Audio",
        color: "rose",
        muted: false,
        solo: false,
        clips: [
          { id: "clip-kit-1", name: "Drum Stem A", start: 0.5, length: 2.4, color: "rose" },
        ],
      },
    ],
    comments: [
      {
        id: "comment-3",
        author: "probees1492",
        body: "Low-end feels heavy after the fill.",
        anchorLabel: "Bar 9",
        resolved: false,
      },
    ],
  },
};
