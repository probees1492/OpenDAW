import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BottomPanelHost } from "../editor/BottomPanelHost";
import { EditorTopBar } from "../editor/EditorTopBar";
import { RightPanelHost } from "../editor/RightPanelHost";
import { TimelineViewport } from "../editor/TimelineViewport";
import { TrackHeaderPane } from "../editor/TrackHeaderPane";
import { TransportBar } from "../editor/TransportBar";
import { useAppState } from "../state/AppStateProvider";
import { EditorStateProvider } from "../state/EditorStateProvider";

export function EditorShell() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { getProjectById, getSessionByProjectId, updateSession, renameProject } =
    useAppState();

  if (!projectId) {
    return <Navigate to="/" replace />;
  }

  const project = getProjectById(projectId);
  const session = getSessionByProjectId(projectId);

  if (!project || !session) {
    return <Navigate to="/" replace />;
  }

  return (
    <EditorStateProvider
      session={session}
      onSessionChange={(nextSession) => updateSession(projectId, nextSession)}
    >
      <main className="screen editor-screen">
        <EditorTopBar
          project={project}
          onBack={() => navigate("/")}
          onRenameProject={(name) => renameProject(projectId, name)}
        />
        <TransportBar />
        <section className="editor-workspace">
          <TrackHeaderPane />
          <TimelineViewport />
          <RightPanelHost />
        </section>
        <BottomPanelHost />
      </main>
    </EditorStateProvider>
  );
}
