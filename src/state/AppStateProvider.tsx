import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { demoProjects, demoSessions } from "./demoData";
import type { ProjectSession, ProjectSummary } from "./types";

const STORAGE_KEY = "opendaw-app-state";

type PersistedAppState = {
  projects: ProjectSummary[];
  sessions: Record<string, ProjectSession>;
};

type AppStateValue = {
  projects: ProjectSummary[];
  getProjectById: (projectId: string) => ProjectSummary | undefined;
  getSessionByProjectId: (projectId: string) => ProjectSession | undefined;
  createProject: () => string;
  updateSession: (projectId: string, session: ProjectSession) => void;
  renameProject: (projectId: string, name: string) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function createDefaultState(): PersistedAppState {
  return {
    projects: demoProjects,
    sessions: demoSessions,
  };
}

function loadInitialState(): PersistedAppState {
  const fallback = createDefaultState();

  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return fallback;
  }
}

function formatUpdatedAt() {
  return `Updated ${new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PersistedAppState>(() => loadInitialState());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getProjectById = useCallback(
    (projectId: string) => state.projects.find((project) => project.id === projectId),
    [state.projects],
  );

  const getSessionByProjectId = useCallback(
    (projectId: string) => state.sessions[projectId],
    [state.sessions],
  );

  const updateSession = useCallback((projectId: string, session: ProjectSession) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? { ...project, updatedAt: formatUpdatedAt() }
          : project,
      ),
      sessions: {
        ...current.sessions,
        [projectId]: session,
      },
    }));
  }, []);

  const renameProject = useCallback((projectId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: trimmed,
              updatedAt: formatUpdatedAt(),
            }
          : project,
      ),
    }));
  }, []);

  const createProject = useCallback(() => {
    const projectId = `project-${crypto.randomUUID().slice(0, 8)}`;

    setState((current) => {
      const newProject: ProjectSummary = {
        id: projectId,
        name: `Untitled Session ${current.projects.length + 1}`,
        owner: "probees1492",
        collaborators: "0 collaborators",
        updatedAt: formatUpdatedAt(),
        status: "Draft",
        summary: "Fresh arrangement workspace ready for clips, comments, and export.",
      };

      const newSession: ProjectSession = {
        projectId,
        tempo: 120,
        timeSignature: "4/4",
        playhead: "1.1.000",
        playheadBar: 1,
        loopRange: {
          start: 1,
          end: 5,
          enabled: false,
        },
        tracks: [
          {
            id: `${projectId}-track-audio`,
            name: "Audio Track",
            type: "Audio",
            color: "amber",
            muted: false,
            solo: false,
            clips: [
              {
                id: `${projectId}-clip-audio`,
                name: "New Audio Idea",
                start: 0.5,
                length: 1.5,
                color: "sun",
              },
            ],
          },
          {
            id: `${projectId}-track-midi`,
            name: "MIDI Track",
            type: "MIDI",
            color: "cyan",
            muted: false,
            solo: false,
            clips: [
              {
                id: `${projectId}-clip-midi`,
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

      return {
        projects: [newProject, ...current.projects],
        sessions: {
          ...current.sessions,
          [projectId]: newSession,
        },
      };
    });

    return projectId;
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      projects: state.projects,
      getProjectById,
      getSessionByProjectId,
      createProject,
      updateSession,
      renameProject,
    }),
    [
      createProject,
      getProjectById,
      getSessionByProjectId,
      renameProject,
      state.projects,
      updateSession,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
