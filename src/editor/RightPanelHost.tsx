import { useEditorState } from "../state/EditorStateProvider";

export function RightPanelHost() {
  const { session, selectedClipIds, getClipById } = useEditorState();
  const selectedClip = selectedClipIds[0] ? getClipById(selectedClipIds[0]) : undefined;

  return (
    <aside className="right-panel">
      <section className="panel-card">
        <p className="eyebrow">Comments</p>
        <h2>Review thread</h2>
        <ul className="thread-list">
          {session.comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.author}</strong>
              <p>{comment.body}</p>
              <small className="muted">{comment.anchorLabel}</small>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-card">
        <p className="eyebrow">Inspector</p>
        <h2>{selectedClip ? selectedClip.clip.name : "No clip selected"}</h2>
        <ul className="detail-list">
          <li>
            Track: {selectedClip ? session.tracks.find((track) => track.id === selectedClip.trackId)?.name : "Select a clip"}
          </li>
          <li>
            Start: {selectedClip ? `${selectedClip.clip.start.toFixed(2)} bars` : "—"}
          </li>
          <li>
            Length: {selectedClip ? `${selectedClip.clip.length.toFixed(2)} bars` : "—"}
          </li>
        </ul>
      </section>
    </aside>
  );
}
