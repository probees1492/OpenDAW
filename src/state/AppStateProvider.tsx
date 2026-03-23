import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useRepository } from "../data";
import type { ProjectSession, ProjectSummary, Track, Clip, CommentThread } from "./types";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  CreateTrackInput,
  UpdateTrackInput,
  CreateClipInput,
  UpdateClipInput,
  CreateCommentInput,
  UpdateCommentInput,
} from "../data";

// ============================================================================
// App State Types
// ============================================================================

type AppStateValue = {
  // Data (synchronous access from cache)
  projects: ProjectSummary[];
  isLoading: boolean;
  error: Error | null;

  // Project CRUD (sync from cache, async to repository)
  getProjectById: (projectId: string) => ProjectSummary | undefined;
  getSessionByProjectId: (projectId: string) => ProjectSession | undefined;
  createProject: (input?: CreateProjectInput) => Promise<string>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  updateSession: (projectId: string, session: ProjectSession) => Promise<void>;

  // Track CRUD
  createTrack: (projectId: string, input: CreateTrackInput) => Promise<Track | null>;
  updateTrack: (projectId: string, trackId: string, input: UpdateTrackInput) => Promise<Track | null>;
  deleteTrack: (projectId: string, trackId: string) => Promise<void>;
  reorderTracks: (projectId: string, trackIds: string[]) => Promise<void>;

  // Clip CRUD
  createClip: (projectId: string, input: CreateClipInput) => Promise<Clip | null>;
  updateClip: (projectId: string, clipId: string, input: UpdateClipInput) => Promise<Clip | null>;
  deleteClip: (projectId: string, clipId: string) => Promise<void>;

  // Comment CRUD
  createComment: (projectId: string, input: CreateCommentInput) => Promise<CommentThread | null>;
  updateComment: (projectId: string, commentId: string, input: UpdateCommentInput) => Promise<CommentThread | null>;
  deleteComment: (projectId: string, commentId: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function AppStateProvider({ children }: PropsWithChildren) {
  const repository = useRepository();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sessions, setSessions] = useState<Record<string, ProjectSession>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initial load
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await repository.loadAll();

        if (mounted) {
          setProjects(data.projects);
          setSessions(data.sessions);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [repository]);

  // Project CRUD (sync from cache, async to repository)
  const getProjectById = useCallback(
    (projectId: string) => projects.find((p) => p.id === projectId),
    [projects],
  );

  const getSessionByProjectId = useCallback(
    (projectId: string) => sessions[projectId],
    [sessions],
  );

  const createProject = useCallback(
    async (input?: CreateProjectInput) => {
      const project = await repository.createProject(input ?? {});
      const session = await repository.getSession(project.id);

      setProjects((prev) => [project, ...prev]);
      if (session) {
        setSessions((prev) => ({ ...prev, [project.id]: session }));
      }

      return project.id;
    },
    [repository],
  );

  const renameProject = useCallback(
    async (projectId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const updated = await repository.updateProject(projectId, { name: trimmed });
      if (updated) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? updated : p)),
        );
      }
    },
    [repository],
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      const success = await repository.deleteProject(projectId);
      if (success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        setSessions((prev) => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
      }
    },
    [repository],
  );

  const updateSession = useCallback(
    async (projectId: string, session: ProjectSession) => {
      await repository.saveSession(projectId, session);
      setSessions((prev) => ({ ...prev, [projectId]: session }));

      // Update project timestamp
      const project = await repository.getProject(projectId);
      if (project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? project : p)),
        );
      }
    },
    [repository],
  );

  // Track CRUD
  const createTrack = useCallback(
    async (projectId: string, input: CreateTrackInput) => {
      const track = await repository.createTrack(projectId, input);
      if (track) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return track;
    },
    [repository],
  );

  const updateTrack = useCallback(
    async (projectId: string, trackId: string, input: UpdateTrackInput) => {
      const track = await repository.updateTrack(projectId, trackId, input);
      if (track) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return track;
    },
    [repository],
  );

  const deleteTrack = useCallback(
    async (projectId: string, trackId: string) => {
      const success = await repository.deleteTrack(projectId, trackId);
      if (success) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
    },
    [repository],
  );

  const reorderTracks = useCallback(
    async (projectId: string, trackIds: string[]) => {
      const success = await repository.reorderTracks(projectId, trackIds);
      if (success) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
    },
    [repository],
  );

  // Clip CRUD
  const createClip = useCallback(
    async (projectId: string, input: CreateClipInput) => {
      const clip = await repository.createClip(projectId, input);
      if (clip) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return clip;
    },
    [repository],
  );

  const updateClip = useCallback(
    async (projectId: string, clipId: string, input: UpdateClipInput) => {
      const clip = await repository.updateClip(projectId, clipId, input);
      if (clip) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return clip;
    },
    [repository],
  );

  const deleteClip = useCallback(
    async (projectId: string, clipId: string) => {
      const success = await repository.deleteClip(projectId, clipId);
      if (success) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
    },
    [repository],
  );

  // Comment CRUD
  const createComment = useCallback(
    async (projectId: string, input: CreateCommentInput) => {
      const comment = await repository.createComment(projectId, input);
      if (comment) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return comment;
    },
    [repository],
  );

  const updateComment = useCallback(
    async (projectId: string, commentId: string, input: UpdateCommentInput) => {
      const comment = await repository.updateComment(projectId, commentId, input);
      if (comment) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
      return comment;
    },
    [repository],
  );

  const deleteComment = useCallback(
    async (projectId: string, commentId: string) => {
      const success = await repository.deleteComment(projectId, commentId);
      if (success) {
        const session = await repository.getSession(projectId);
        if (session) {
          setSessions((prev) => ({ ...prev, [projectId]: session }));
        }
      }
    },
    [repository],
  );

  // Refresh
  const refresh = useCallback(async () => {
    const data = await repository.loadAll();
    setProjects(data.projects);
    setSessions(data.sessions);
  }, [repository]);

  // Memoized value
  const value = useMemo<AppStateValue>(
    () => ({
      projects,
      isLoading,
      error,
      getProjectById,
      getSessionByProjectId,
      createProject,
      renameProject,
      deleteProject,
      updateSession,
      createTrack,
      updateTrack,
      deleteTrack,
      reorderTracks,
      createClip,
      updateClip,
      deleteClip,
      createComment,
      updateComment,
      deleteComment,
      refresh,
    }),
    [
      projects,
      isLoading,
      error,
      getProjectById,
      getSessionByProjectId,
      createProject,
      renameProject,
      deleteProject,
      updateSession,
      createTrack,
      updateTrack,
      deleteTrack,
      reorderTracks,
      createClip,
      updateClip,
      deleteClip,
      createComment,
      updateComment,
      deleteComment,
      refresh,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
