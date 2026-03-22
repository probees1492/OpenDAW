import { BottomPanelHost } from "../editor/BottomPanelHost";
import { EditorTopBar } from "../editor/EditorTopBar";
import { RightPanelHost } from "../editor/RightPanelHost";
import { TimelineViewport } from "../editor/TimelineViewport";
import { TrackHeaderPane } from "../editor/TrackHeaderPane";
import { TransportBar } from "../editor/TransportBar";
import type { ProjectSummary } from "../state/types";

type EditorShellProps = {
  project: ProjectSummary;
  onBack: () => void;
};

export function EditorShell({ project, onBack }: EditorShellProps) {
  return (
    <main className="screen editor-screen">
      <EditorTopBar project={project} onBack={onBack} />
      <TransportBar />
      <section className="editor-workspace">
        <TrackHeaderPane />
        <TimelineViewport />
        <RightPanelHost />
      </section>
      <BottomPanelHost />
    </main>
  );
}
