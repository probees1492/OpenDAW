import { useEditorState } from "../state/EditorStateProvider";

export function BottomPanelHost() {
  const { selectedClipIds, getClipById } = useEditorState();
  const selectedClip = selectedClipIds[0] ? getClipById(selectedClipIds[0]) : undefined;

  return (
    <section className="bottom-panel">
      <div className="bottom-panel-header">
        <p className="eyebrow">Bottom panel</p>
        <h2>
          {selectedClip ? `${selectedClip.clip.name} detail` : "Piano roll / clip detail region"}
        </h2>
      </div>
      <div className="piano-roll-grid">
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="piano-roll-row">
            <span className="note-label">C{6 - row}</span>
            <div className="note-cells">
              {Array.from({ length: 12 }, (_, cell) => (
                <span
                  key={cell}
                  className={
                    cell % 3 === 0 && selectedClip ? "active-cell" : ""
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
