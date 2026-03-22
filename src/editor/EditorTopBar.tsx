import type { ProjectSummary } from "../state/types";

type EditorTopBarProps = {
  project: ProjectSummary;
  onBack: () => void;
};

export function EditorTopBar({ project, onBack }: EditorTopBarProps) {
  return (
    <header className="editor-topbar">
      <div className="editor-topbar-left">
        <button className="ghost-button" onClick={onBack}>
          Dashboard
        </button>
        <div>
          <p className="eyebrow">Project</p>
          <h1>{project.name}</h1>
        </div>
      </div>

      <div className="editor-topbar-right">
        <span className="save-badge">Saved 12s ago</span>
        <button className="secondary-button">Share</button>
        <button className="primary-button">Export</button>
      </div>
    </header>
  );
}
