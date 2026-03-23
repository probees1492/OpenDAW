import type { ProjectSession, ProjectSummary, Track, Clip, CommentThread } from "../state/types";

// ============================================================================
// Input Types for CRUD Operations
// ============================================================================

export interface CreateProjectInput {
  name?: string;
  owner?: string;
}

export interface UpdateProjectInput {
  name?: string;
  status?: ProjectSummary["status"];
  summary?: string;
}

export interface CreateTrackInput {
  name?: string;
  type: Track["type"];
  color?: string;
}

export interface UpdateTrackInput {
  name?: string;
  muted?: boolean;
  solo?: boolean;
  color?: string;
}

export interface CreateClipInput {
  trackId: string;
  name?: string;
  start: number;
  length: number;
  color?: string;
}

export interface UpdateClipInput {
  name?: string;
  start?: number;
  length?: number;
  color?: string;
}

export interface CreateCommentInput {
  author?: string;
  body: string;
  anchorLabel?: string;
}

export interface UpdateCommentInput {
  body?: string;
  resolved?: boolean;
  anchorLabel?: string;
}

// ============================================================================
// Repository Interface
// ============================================================================

/**
 * Repository interface for data access abstraction.
 *
 * This allows swapping between different storage backends:
 * - LocalStorageRepository: Browser localStorage (current)
 * - ApiRepository: REST API
 * - IndexedDbRepository: Browser IndexedDB
 * - MockRepository: In-memory for testing
 */
export interface ProjectRepository {
  // Project CRUD
  listProjects(): Promise<ProjectSummary[]>;
  getProject(id: string): Promise<ProjectSummary | null>;
  createProject(input: CreateProjectInput): Promise<ProjectSummary>;
  updateProject(id: string, input: UpdateProjectInput): Promise<ProjectSummary | null>;
  deleteProject(id: string): Promise<boolean>;

  // Session CRUD
  getSession(projectId: string): Promise<ProjectSession | null>;
  saveSession(projectId: string, session: ProjectSession): Promise<void>;

  // Batch operations
  loadAll(): Promise<{
    projects: ProjectSummary[];
    sessions: Record<string, ProjectSession>;
  }>;
}

/**
 * Repository interface for editor-level operations.
 * Provides fine-grained CRUD for tracks, clips, and comments.
 */
export interface EditorRepository {
  // Track CRUD
  createTrack(projectId: string, input: CreateTrackInput): Promise<Track | null>;
  updateTrack(projectId: string, trackId: string, input: UpdateTrackInput): Promise<Track | null>;
  deleteTrack(projectId: string, trackId: string): Promise<boolean>;
  reorderTracks(projectId: string, trackIds: string[]): Promise<boolean>;

  // Clip CRUD
  createClip(projectId: string, input: CreateClipInput): Promise<Clip | null>;
  updateClip(projectId: string, clipId: string, input: UpdateClipInput): Promise<Clip | null>;
  deleteClip(projectId: string, clipId: string): Promise<boolean>;

  // Comment CRUD
  createComment(projectId: string, input: CreateCommentInput): Promise<CommentThread | null>;
  updateComment(projectId: string, commentId: string, input: UpdateCommentInput): Promise<CommentThread | null>;
  deleteComment(projectId: string, commentId: string): Promise<boolean>;
}

// ============================================================================
// Combined Repository
// ============================================================================

export type DataRepository = ProjectRepository & EditorRepository;
