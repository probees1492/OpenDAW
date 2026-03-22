import { useEffect, useMemo } from "react";
import { useEditorState } from "../state/EditorStateProvider";

const BAR_WIDTH = 112;
const MIN_CLIP_LENGTH = 0.5;
const VISIBLE_BARS = 8;

function roundToGrid(value: number) {
  return Math.round(value * 4) / 4;
}

export function TimelineViewport() {
  const {
    session,
    selectedClipIds,
    dragState,
    selectClip,
    clearSelection,
    startDrag,
    stopDrag,
    moveClip,
    resizeClip,
    getClipById,
  } = useEditorState();

  const totalBars = useMemo(() => {
    const maxClipEnd = Math.max(
      ...session.tracks.flatMap((track) =>
        track.clips.map((clip) => clip.start + clip.length),
      ),
      VISIBLE_BARS,
    );

    return Math.ceil(maxClipEnd + 1);
  }, [session.tracks]);

  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const activeDragState = dragState;

    function onPointerMove(event: PointerEvent) {
      const deltaBars = roundToGrid(
        (event.clientX - activeDragState.originX) / BAR_WIDTH,
      );

      if (activeDragState.mode === "move") {
        moveClip(activeDragState.clipId, activeDragState.initialStart + deltaBars);
        return;
      }

      if (activeDragState.mode === "resize-start") {
        const nextStart = activeDragState.initialStart + deltaBars;
        const end = activeDragState.initialStart + activeDragState.initialLength;
        const boundedStart = Math.min(end - MIN_CLIP_LENGTH, nextStart);
        resizeClip(activeDragState.clipId, boundedStart, end - boundedStart);
        return;
      }

      const nextLength = activeDragState.initialLength + deltaBars;
      resizeClip(
        activeDragState.clipId,
        activeDragState.initialStart,
        Math.max(MIN_CLIP_LENGTH, nextLength),
      );
    }

    function onPointerUp() {
      stopDrag();
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, moveClip, resizeClip, stopDrag]);

  return (
    <section className="timeline-viewport">
      <div
        className="timeline-ruler"
        style={{ gridTemplateColumns: `repeat(${totalBars}, ${BAR_WIDTH}px)` }}
      >
        {Array.from({ length: totalBars }, (_, index) => (
          <span key={index}>Bar {index + 1}</span>
        ))}
      </div>

      <div className="timeline-grid" onPointerDown={() => clearSelection()}>
        {session.tracks.map((track) => (
          <div key={track.id} className="timeline-lane">
            {track.clips.map((clip) => {
              const selected = selectedClipIds.includes(clip.id);

              return (
                <article
                  key={clip.id}
                  className={`timeline-clip ${clip.color} ${selected ? "selected" : ""}`}
                  style={{
                    left: `${clip.start * BAR_WIDTH}px`,
                    width: `${clip.length * BAR_WIDTH}px`,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    selectClip(clip.id, event.shiftKey);
                    startDrag({
                      clipId: clip.id,
                      trackId: track.id,
                      mode: "move",
                      originX: event.clientX,
                      initialStart: clip.start,
                      initialLength: clip.length,
                    });
                  }}
                >
                  <button
                    type="button"
                    className="clip-handle start"
                    aria-label={`Resize start for ${clip.name}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectClip(clip.id);
                      startDrag({
                        clipId: clip.id,
                        trackId: track.id,
                        mode: "resize-start",
                        originX: event.clientX,
                        initialStart: clip.start,
                        initialLength: clip.length,
                      });
                    }}
                  />
                  <div className="clip-copy">
                    <span>{clip.name}</span>
                    <small>
                      {track.name} · {track.type}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="clip-handle end"
                    aria-label={`Resize end for ${clip.name}`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      selectClip(clip.id);
                      startDrag({
                        clipId: clip.id,
                        trackId: track.id,
                        mode: "resize-end",
                        originX: event.clientX,
                        initialStart: clip.start,
                        initialLength: clip.length,
                      });
                    }}
                  />
                </article>
              );
            })}
          </div>
        ))}
      </div>

      <footer className="timeline-status">
        {selectedClipIds.length > 0 ? (
          <span>
            Selected:{" "}
            {selectedClipIds
              .map((clipId) => getClipById(clipId)?.clip.name ?? clipId)
              .join(", ")}
          </span>
        ) : (
          <span>Click a clip to select it. Drag the body to move or the handles to resize.</span>
        )}
      </footer>
    </section>
  );
}
