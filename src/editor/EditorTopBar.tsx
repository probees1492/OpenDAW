import { useEffect, useState } from "react";
import { useEditorState } from "../state/EditorStateProvider";
import type { ProjectSummary } from "../state/types";

type EditorTopBarProps = {
  project: ProjectSummary;
  onBack: () => void;
  onRenameProject: (name: string) => void;
};

export function EditorTopBar({
  project,
  onBack,
  onRenameProject,
}: EditorTopBarProps) {
  const { saveState, session } = useEditorState();
  const [name, setName] = useState(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  return (
    <header className="editor-topbar">
      <div className="editor-topbar-left">
        <button className="ghost-button" onClick={onBack}>
          Dashboard
        </button>
        <div className="project-title-block">
          <p className="eyebrow">Project</p>
          <input
            className="project-title-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => onRenameProject(name)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onRenameProject(name);
                (event.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      </div>

      <div className="editor-topbar-right">
        <span className={`save-badge ${saveState}`}>{saveState}</span>
        <span className="loop-badge">
          Loop{" "}
          {session.loopRange.enabled
            ? `${session.loopRange.start}-${session.loopRange.end}`
            : "off"}
        </span>
        <button className="secondary-button">Share</button>
        <button className="primary-button">Export</button>
      </div>
    </header>
  );
}
