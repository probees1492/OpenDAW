import { useState } from "react";
import { useEditorState } from "../state/EditorStateProvider";

function anchorToBar(anchorLabel: string) {
  const match = anchorLabel.match(/Bar[s]?\s+(\d+)/i);
  return match ? Number(match[1]) : 1;
}

export function RightPanelHost() {
  const { session, selectedClipIds, getClipById, addComment, setPlayheadBar } =
    useEditorState();
  const [commentDraft, setCommentDraft] = useState("");
  const selectedClip = selectedClipIds[0] ? getClipById(selectedClipIds[0]) : undefined;

  return (
    <aside className="right-panel">
      <section className="panel-card">
        <p className="eyebrow">Comments</p>
        <h2>Review thread</h2>
        <form
          className="comment-composer"
          onSubmit={(event) => {
            event.preventDefault();
            addComment(commentDraft);
            setCommentDraft("");
          }}
        >
          <textarea
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            placeholder={`Add a note at ${session.playhead}`}
            rows={3}
          />
          <button className="primary-button" type="submit">
            Add comment
          </button>
        </form>
        <ul className="thread-list">
          {session.comments.length > 0 ? (
            session.comments.map((comment) => (
              <li key={comment.id}>
                <button
                  type="button"
                  className="comment-jump"
                  onClick={() => setPlayheadBar(anchorToBar(comment.anchorLabel))}
                >
                  <strong>{comment.author}</strong>
                  <p>{comment.body}</p>
                  <small className="muted">{comment.anchorLabel}</small>
                </button>
              </li>
            ))
          ) : (
            <li>
              <strong>No comments yet</strong>
              <p>Share the session or add the first review note from the current playhead.</p>
            </li>
          )}
        </ul>
      </section>

      <section className="panel-card">
        <p className="eyebrow">Inspector</p>
        <h2>{selectedClip ? selectedClip.clip.name : "No clip selected"}</h2>
        <ul className="detail-list">
          <li>
            Track:{" "}
            {selectedClip
              ? session.tracks.find((track) => track.id === selectedClip.trackId)?.name
              : "Select a clip"}
          </li>
          <li>Start: {selectedClip ? `${selectedClip.clip.start.toFixed(2)} bars` : "—"}</li>
          <li>Length: {selectedClip ? `${selectedClip.clip.length.toFixed(2)} bars` : "—"}</li>
          <li>Loop: {session.loopRange.enabled ? "Enabled" : "Disabled"}</li>
        </ul>
      </section>
    </aside>
  );
}
