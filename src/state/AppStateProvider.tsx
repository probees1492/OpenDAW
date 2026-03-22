import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { demoProjects, demoSessions } from "./demoData";
import type { ProjectSession, ProjectSummary } from "./types";

type AppStateValue = {
  projects: ProjectSummary[];
  getProjectById: (projectId: string) => ProjectSummary | undefined;
  getSessionByProjectId: (projectId: string) => ProjectSession | undefined;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const value = useMemo<AppStateValue>(
    () => ({
      projects: demoProjects,
      getProjectById: (projectId) =>
        demoProjects.find((project) => project.id === projectId),
      getSessionByProjectId: (projectId) => demoSessions[projectId],
    }),
    [],
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
