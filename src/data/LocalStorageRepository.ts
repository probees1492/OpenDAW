import type { ProjectSession, ProjectSummary, Track, Clip, CommentThread } from "../state/types";
import type {
  DataRepository,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTrackInput,
  UpdateTrackInput,
  CreateClipInput,
  UpdateClipInput,
  CreateCommentInput,
  UpdateCommentInput,
} from "./types";

const STORAGE_KEY = "opendaw-app-state";

interface PersistedData {
  projects: ProjectSummary[];
  sessions: Record<string, ProjectSession>;
}

/**
 * Default demo data for new installations.
 */
function createDefaultData(): PersistedData {
  const projectId = "demo-project-001";

  return {
    projects: [
      {
        id: projectId,
        name: "Demo Session",
        owner: "probees1492",
        collaborators: "1 collaborator",
        updatedAt: "Updated just now",
        status: "Review",
        summary: "A demo session with example clips and tracks to explore the editor.",
      },
    ],
    sessions: {
      [projectId]: {
        projectId,
        tempo: 120,
        timeSignature: "4/4",
        playhead: "1.1.000",
        playheadBar: 1,
        transport: "stopped",
        loopRange: { start: 1, end: 5, enabled: false },
        tracks: [
          {
            id: `${projectId}-track-audio`,
            name: "Drums",
            type: "Audio",
            color: "amber",
            muted: false,
            solo: false,
            clips: [
              { id: `${projectId}-clip-drums-1`, name: "Kick Pattern", start: 1, length: 2, color: "sun" },
              { id: `${projectId}-clip-drums-2`, name: "Snare Fill", start: 3.5, length: 1, color: "sun" },
            ],
          },
          {
            id: `${projectId}-track-midi`,
            name: "Bass",
            type: "MIDI",
            color: "cyan",
            muted: false,
            solo: false,
            clips: [
              { id: `${projectId}-clip-bass-1`, name: "Bass Line", start: 1, length: 4, color: "cyan" },
            ],
          },
        ],
        comments: [
          {
            id: `${projectId}-comment-1`,
            author: "probees1492",
            body: "Nice groove! Consider adding variation at bar 4.",
            anchorLabel: "Bar 2-3",
            resolved: false,
          },
        ],
      },
    },
  };
}

/**
 * Generates a unique ID.
 */
function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Formats timestamp for display.
 */
function formatTimestamp(): string {
  return `Updated ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Deep clones a session for immutability.
 */
function cloneSession(session: ProjectSession): ProjectSession {
  return {
    ...session,
    loopRange: { ...session.loopRange },
    tracks: session.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => ({ ...clip })),
    })),
    comments: session.comments.map((comment) => ({ ...comment })),
  };
}

/**
 * LocalStorage-based repository implementation.
 * Provides synchronous-style API wrapped in Promises for consistency.
 */
export class LocalStorageRepository implements DataRepository {
  private data: PersistedData;
  private saveTimeout: number | null = null;

  constructor() {
    this.data = this.loadFromStorage();
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private loadFromStorage(): PersistedData {
    if (typeof window === "undefined") {
      return createDefaultData();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultData();
    }

    try {
      return JSON.parse(raw) as PersistedData;
    } catch {
      return createDefaultData();
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout !== null) {
      window.clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = window.setTimeout(() => {
      this.saveToStorage();
      this.saveTimeout = null;
    }, 100);
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  private getProjectIndex(id: string): number {
    return this.data.projects.findIndex((p) => p.id === id);
  }

  private findClip(session: ProjectSession, clipId: string): { clip: Clip; trackIndex: number; clipIndex: number } | null {
    for (let trackIndex = 0; trackIndex < session.tracks.length; trackIndex++) {
      const track = session.tracks[trackIndex];
      const clipIndex = track.clips.findIndex((c) => c.id === clipId);

      if (clipIndex !== -1) {
        return {
          clip: track.clips[clipIndex],
          trackIndex,
          clipIndex,
        };
      }
    }
    return null;
  }

  // =========================================================================
  // Project CRUD
  // =========================================================================

  async listProjects(): Promise<ProjectSummary[]> {
    return [...this.data.projects];
  }

  async getProject(id: string): Promise<ProjectSummary | null> {
    const project = this.data.projects.find((p) => p.id === id);
    return project ? { ...project } : null;
  }

  async createProject(input: CreateProjectInput = {}): Promise<ProjectSummary> {
    const projectId = generateId("project");
    const projectNumber = this.data.projects.length + 1;

    const newProject: ProjectSummary = {
      id: projectId,
      name: input.name ?? `Untitled Session ${projectNumber}`,
      owner: input.owner ?? "probees1492",
      collaborators: "0 collaborators",
      updatedAt: formatTimestamp(),
      status: "Draft",
      summary: "Fresh arrangement workspace ready for clips, comments, and export.",
    };

    const newSession: ProjectSession = {
      projectId,
      tempo: 120,
      timeSignature: "4/4",
      playhead: "1.1.000",
      playheadBar: 1,
      transport: "stopped",
      loopRange: { start: 1, end: 5, enabled: false },
      tracks: [
        {
          id: generateId(`${projectId}-track-audio`),
          name: "Audio Track",
          type: "Audio",
          color: "amber",
          muted: false,
          solo: false,
          clips: [
            {
              id: generateId(`${projectId}-clip`),
              name: "New Audio Idea",
              start: 0.5,
              length: 1.5,
              color: "sun",
            },
          ],
        },
        {
          id: generateId(`${projectId}-track-midi`),
          name: "MIDI Track",
          type: "MIDI",
          color: "cyan",
          muted: false,
          solo: false,
          clips: [
            {
              id: generateId(`${projectId}-clip`),
              name: "Chord Sketch",
              start: 2,
              length: 2,
              color: "cyan",
            },
          ],
        },
      ],
      comments: [],
    };

    this.data.projects.unshift(newProject);
    this.data.sessions[projectId] = newSession;
    this.scheduleSave();

    return { ...newProject };
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<ProjectSummary | null> {
    const index = this.getProjectIndex(id);

    if (index === -1) {
      return null;
    }

    const existing = this.data.projects[index];
    const updated: ProjectSummary = {
      ...existing,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.summary !== undefined && { summary: input.summary }),
      updatedAt: formatTimestamp(),
    };

    this.data.projects[index] = updated;
    this.scheduleSave();

    return { ...updated };
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.getProjectIndex(id);

    if (index === -1) {
      return false;
    }

    this.data.projects.splice(index, 1);
    delete this.data.sessions[id];
    this.scheduleSave();

    return true;
  }

  // =========================================================================
  // Session CRUD
  // =========================================================================

  async getSession(projectId: string): Promise<ProjectSession | null> {
    const session = this.data.sessions[projectId];
    return session ? cloneSession(session) : null;
  }

  async saveSession(projectId: string, session: ProjectSession): Promise<void> {
    this.data.sessions[projectId] = cloneSession(session);

    // Update project timestamp
    const index = this.getProjectIndex(projectId);
    if (index !== -1) {
      this.data.projects[index].updatedAt = formatTimestamp();
    }

    this.scheduleSave();
  }

  // =========================================================================
  // Batch Operations
  // =========================================================================

  async loadAll(): Promise<{
    projects: ProjectSummary[];
    sessions: Record<string, ProjectSession>;
  }> {
    return {
      projects: [...this.data.projects],
      sessions: Object.fromEntries(
        Object.entries(this.data.sessions).map(([id, session]) => [id, cloneSession(session)])
      ),
    };
  }

  // =========================================================================
  // Track CRUD
  // =========================================================================

  async createTrack(projectId: string, input: CreateTrackInput): Promise<Track | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const trackNumber = session.tracks.filter((t) => t.type === input.type).length + 1;
    const trackId = generateId(`${projectId}-track-${input.type.toLowerCase()}`);

    const newTrack: Track = {
      id: trackId,
      name: input.name ?? `${input.type} Track ${trackNumber}`,
      type: input.type,
      color: input.color ?? (input.type === "Audio" ? "amber" : "cyan"),
      muted: false,
      solo: false,
      clips: [],
    };

    session.tracks.push(newTrack);
    this.scheduleSave();

    return { ...newTrack };
  }

  async updateTrack(projectId: string, trackId: string, input: UpdateTrackInput): Promise<Track | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const track = session.tracks.find((t) => t.id === trackId);
    if (!track) return null;

    if (input.name !== undefined) track.name = input.name;
    if (input.muted !== undefined) track.muted = input.muted;
    if (input.solo !== undefined) track.solo = input.solo;
    if (input.color !== undefined) track.color = input.color;

    this.scheduleSave();

    return { ...track };
  }

  async deleteTrack(projectId: string, trackId: string): Promise<boolean> {
    const session = this.data.sessions[projectId];
    if (!session) return false;

    const index = session.tracks.findIndex((t) => t.id === trackId);
    if (index === -1) return false;

    session.tracks.splice(index, 1);
    this.scheduleSave();

    return true;
  }

  async reorderTracks(projectId: string, trackIds: string[]): Promise<boolean> {
    const session = this.data.sessions[projectId];
    if (!session) return false;

    const trackMap = new Map(session.tracks.map((t) => [t.id, t]));
    const reordered: Track[] = [];

    for (const id of trackIds) {
      const track = trackMap.get(id);
      if (track) {
        reordered.push(track);
        trackMap.delete(id);
      }
    }

    // Add any remaining tracks at the end
    reordered.push(...trackMap.values());

    session.tracks = reordered;
    this.scheduleSave();

    return true;
  }

  // =========================================================================
  // Clip CRUD
  // =========================================================================

  async createClip(projectId: string, input: CreateClipInput): Promise<Clip | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const track = session.tracks.find((t) => t.id === input.trackId);
    if (!track) return null;

    const clipId = generateId(`${projectId}-clip`);
    const newClip: Clip = {
      id: clipId,
      name: input.name ?? (track.type === "Audio" ? "New Audio Clip" : "New MIDI Clip"),
      start: input.start,
      length: input.length,
      color: input.color ?? track.color,
    };

    track.clips.push(newClip);
    this.scheduleSave();

    return { ...newClip };
  }

  async updateClip(projectId: string, clipId: string, input: UpdateClipInput): Promise<Clip | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const found = this.findClip(session, clipId);
    if (!found) return null;

    const { trackIndex, clipIndex } = found;
    const clip = session.tracks[trackIndex].clips[clipIndex];

    if (input.name !== undefined) clip.name = input.name;
    if (input.start !== undefined) clip.start = input.start;
    if (input.length !== undefined) clip.length = input.length;
    if (input.color !== undefined) clip.color = input.color;

    this.scheduleSave();

    return { ...clip };
  }

  async deleteClip(projectId: string, clipId: string): Promise<boolean> {
    const session = this.data.sessions[projectId];
    if (!session) return false;

    const found = this.findClip(session, clipId);
    if (!found) return false;

    const { trackIndex, clipIndex } = found;
    session.tracks[trackIndex].clips.splice(clipIndex, 1);
    this.scheduleSave();

    return true;
  }

  // =========================================================================
  // Comment CRUD
  // =========================================================================

  async createComment(projectId: string, input: CreateCommentInput): Promise<CommentThread | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const commentId = generateId(`${projectId}-comment`);
    const newComment: CommentThread = {
      id: commentId,
      author: input.author ?? "probees1492",
      body: input.body,
      anchorLabel: input.anchorLabel ?? "",
      resolved: false,
    };

    session.comments.push(newComment);
    this.scheduleSave();

    return { ...newComment };
  }

  async updateComment(projectId: string, commentId: string, input: UpdateCommentInput): Promise<CommentThread | null> {
    const session = this.data.sessions[projectId];
    if (!session) return null;

    const comment = session.comments.find((c) => c.id === commentId);
    if (!comment) return null;

    if (input.body !== undefined) comment.body = input.body;
    if (input.resolved !== undefined) comment.resolved = input.resolved;
    if (input.anchorLabel !== undefined) comment.anchorLabel = input.anchorLabel;

    this.scheduleSave();

    return { ...comment };
  }

  async deleteComment(projectId: string, commentId: string): Promise<boolean> {
    const session = this.data.sessions[projectId];
    if (!session) return false;

    const index = session.comments.findIndex((c) => c.id === commentId);
    if (index === -1) return false;

    session.comments.splice(index, 1);
    this.scheduleSave();

    return true;
  }
}
