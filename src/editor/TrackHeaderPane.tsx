import { useEditorState } from "../state/EditorStateProvider";

export function TrackHeaderPane() {
  const { session } = useEditorState();

  return (
    <aside className="track-header-pane">
      <button className="primary-button add-track-button">Add track</button>
      <div className="track-list">
        {session.tracks.map((track) => (
          <article key={track.id} className="track-row">
            <div className={`track-color ${track.color}`} />
            <div className="track-copy">
              <strong>{track.name}</strong>
              <span>{track.type}</span>
            </div>
            <div className="track-toggles">
              <button>M</button>
              <button>S</button>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
