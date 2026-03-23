import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import { EditorTopBar } from "../editor/EditorTopBar";
import { useAppState } from "../state/AppStateProvider";
import { EditorStateProvider, useEditorState } from "../state/EditorStateProvider";
import { AudioEngineConnector } from "../audio/AudioEngineConnector";
import type { TransportState } from "../state/types";

function EditorContent() {
  const { session, setPlayheadBar, setTransportState } = useEditorState();

  const handlePlayheadChange = useCallback(
    (bar: number) => setPlayheadBar(bar),
    [setPlayheadBar],
  );

  const handleTransportChange = useCallback(
    (state: TransportState) => setTransportState(state),
    [setTransportState],
  );

  return (
    <AudioEngineConnector
      session={session}
      onPlayheadChange={handlePlayheadChange}
      onTransportChange={handleTransportChange}
    />
  );
}

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

  const handleSessionChange = (nextSession: typeof session) => {
    updateSession(projectId, nextSession);
  };

  const handleRenameProject = (name: string) => {
    renameProject(projectId, name);
  };

  return (
    <EditorStateProvider
      session={session}
      onSessionChange={handleSessionChange}
    >
      <main className="screen editor-screen">
        <EditorTopBar
          project={project}
          onBack={() => navigate("/")}
          onRenameProject={handleRenameProject}
        />
        <EditorContent />
      </main>
    </EditorStateProvider>
  );
}
