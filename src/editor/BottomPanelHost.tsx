import { useState, useCallback, useEffect, useId } from "react";
import { useEditorState } from "../state/EditorStateProvider";

export function BottomPanelHost() {
  const { selectedClipIds, getClipById } = useEditorState();
  const selectedClip = selectedClipIds[0]
    ? getClipById(selectedClipIds[0])
    : undefined;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // React 18 useId for accessible IDs
  const panelId = useId();
  const headerId = useId();

  const togglePanel = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Keyboard shortcut: B to toggle bottom panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key.toLowerCase() === "b" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePanel]);

  return (
    <section
      id={panelId}
      className={`bottom-panel ${isCollapsed ? "collapsed" : ""}`}
      aria-labelledby={headerId}
    >
      <div className="bottom-panel-header">
        <div className="bottom-panel-title">
          <p className="eyebrow">Bottom panel</p>
          <h2 id={headerId}>
            {selectedClip
              ? `${selectedClip.clip.name} detail`
              : "Piano roll / clip detail region"}
          </h2>
        </div>
        <button
          className="panel-toggle-button"
          onClick={togglePanel}
          aria-label={isCollapsed ? "Expand bottom panel" : "Collapse bottom panel"}
          aria-expanded={!isCollapsed}
          aria-controls={panelId}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`toggle-icon ${isCollapsed ? "rotated" : ""}`}
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="bottom-panel-content">
        <p className="muted bottom-panel-copy">
          {selectedClip
            ? "This area is ready for piano roll editing and clip-level detail tools."
            : "Select a clip to inspect note content, waveform details, or contextual editing tools."}
        </p>
        <div className="piano-roll-grid" role="presentation">
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} className="piano-roll-row">
              <span className="note-label">C{6 - row}</span>
              <div className="note-cells">
                {Array.from({ length: 12 }, (_, cell) => (
                  <span
                    key={cell}
                    className={cell % 3 === 0 && selectedClip ? "active-cell" : ""}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-panel-hint">
        Press <kbd>B</kbd> to {isCollapsed ? "expand" : "collapse"}
      </div>
    </section>
  );
}
