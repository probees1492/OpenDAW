import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAppState } from "../state/AppStateProvider";
import { AuthShell } from "./AuthShell";
import { DashboardShell } from "./DashboardShell";
import { EditorShell } from "./EditorShell";

export function AppRoot() {
  const { projects } = useAppState();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardShell projects={projects} />} />
        <Route path="/auth" element={<AuthShell />} />
        <Route path="/projects/:projectId" element={<EditorShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
