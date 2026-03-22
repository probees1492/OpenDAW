import { useEditorState } from "../state/EditorStateProvider";

export function TrackHeaderPane() {
  const { session, addTrack, toggleTrackMute, toggleTrackSolo } = useEditorState();
  const hasSoloTrack = session.tracks.some((track) => track.solo);

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
        {session.tracks.map((track) => {
          const dimmed = hasSoloTrack && !track.solo;

          return (
            <article
              key={track.id}
              className={`track-row ${track.muted ? "muted-track" : ""} ${dimmed ? "dimmed-track" : ""}`}
            >
              <div className={`track-color ${track.color}`} />
              <div className="track-copy">
                <strong>{track.name}</strong>
                <span>{track.type}</span>
              </div>
              <div className="track-toggles">
                <button
                  className={track.muted ? "active-toggle" : ""}
                  onClick={() => toggleTrackMute(track.id)}
                >
                  M
                </button>
                <button
                  className={track.solo ? "active-toggle" : ""}
                  onClick={() => toggleTrackSolo(track.id)}
                >
                  S
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </aside>
  );
}
