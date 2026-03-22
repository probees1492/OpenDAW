import { useEditorState } from "../state/EditorStateProvider";

export function TrackHeaderPane() {
  const { session, addTrack } = useEditorState();

  return (
    <aside className="track-header-pane">
      <div className="add-track-actions">
        <button className="primary-button add-track-button" onClick={() => addTrack("Audio")}>
          Add audio
        </button>
        <button className="secondary-button add-track-button" onClick={() => addTrack("MIDI")}>
          Add MIDI
        </button>
      </div>
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
