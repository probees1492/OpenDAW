import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RepositoryProvider } from "../data";
import { AppStateProvider, useAppState } from "../state/AppStateProvider";
import { AuthShell } from "./AuthShell";
import { DashboardShell } from "./DashboardShell";
import { EditorShell } from "./EditorShell";
import { ErrorBoundary } from "../components/ErrorBoundary";

function AppRoutes() {
  const { projects } = useAppState();

  return (
    <Routes>
      <Route path="/" element={<DashboardShell projects={projects} />} />
      <Route path="/auth" element={<AuthShell />} />
      <Route
        path="/projects/:projectId"
        element={
          <ErrorBoundary
            fallback={
              <div className="error-screen">
                <h1>Editor Error</h1>
                <p>프로젝트를 불러오는 중 문제가 발생했습니다.</p>
                <a href="/">대시보드로 돌아가기</a>
              </div>
            }
          >
            <EditorShell />
          </ErrorBoundary>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function AppRoot() {
  return (
    <RepositoryProvider>
      <AppStateProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppStateProvider>
    </RepositoryProvider>
  );
}
