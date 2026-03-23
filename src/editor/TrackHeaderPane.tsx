import { useEffect, useRef } from "react";
import { useEditorState } from "../state/EditorStateProvider";
import { useScrollSync } from "./ScrollSyncContext";

export function TrackHeaderPane() {
  const { session, addTrack, toggleTrackMute, toggleTrackSolo } = useEditorState();
  const hasSoloTrack = session.tracks.some((track) => track.solo);
  const { registerTrackList, syncScroll } = useScrollSync();
  const trackListRef = useRef<HTMLDivElement>(null);

  // Register track list element
  useEffect(() => {
    registerTrackList(trackListRef.current);
  }, [registerTrackList]);

  // Handle scroll events
  const handleScroll = () => {
    if (trackListRef.current) {
      syncScroll("trackList", trackListRef.current.scrollTop);
    }
  };

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
      <div
        ref={trackListRef}
        className="track-list scroll-sync-area"
        onScroll={handleScroll}
      >
        {session.tracks.map((track, index) => {
          const dimmed = hasSoloTrack && !track.solo;

          return (
            <article
              key={track.id}
              className={`track-row ${track.muted ? "muted-track" : ""} ${dimmed ? "dimmed-track" : ""}`}
              style={{ "--track-index": index } as React.CSSProperties}
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
