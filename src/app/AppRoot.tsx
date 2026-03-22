import { useMemo, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { EditorShell } from "./EditorShell";
import { AuthShell } from "./AuthShell";
import { demoProjects } from "../state/demoData";
import type { AppScreen, ProjectSummary } from "../state/types";

export function AppRoot() {
  const [screen, setScreen] = useState<AppScreen>("dashboard");
  const [projects] = useState<ProjectSummary[]>(demoProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(demoProjects[0].id);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [activeProjectId, projects],
  );

  if (screen === "auth") {
    return <AuthShell onContinue={() => setScreen("dashboard")} />;
  }

  if (screen === "editor") {
    return (
      <EditorShell
        project={activeProject}
        onBack={() => setScreen("dashboard")}
      />
    );
  }

  return (
    <DashboardShell
      projects={projects}
      onOpenProject={(projectId) => {
        setActiveProjectId(projectId);
        setScreen("editor");
      }}
      onOpenAuth={() => setScreen("auth")}
    />
  );
}
