import { useEffect, useMemo, useState } from "react";
import { useEditorState } from "../state/EditorStateProvider";

const BAR_WIDTH = 112;
const MIN_CLIP_LENGTH = 0.5;
const VISIBLE_BARS = 8;

type MarqueeState = {
  laneLeft: number;
  trackId: string;
  clipBounds: Array<{ clipId: string; left: number; right: number }>;
  startX: number;
  currentX: number;
};

function roundToGrid(value: number) {
  return Math.round(value * 4) / 4;
}

export function TimelineViewport() {
  const {
    session,
    selectedClipIds,
    dragState,
    selectClip,
    selectMultipleClips,
    clearSelection,
    startDrag,
    stopDrag,
    moveSelectedClips,
    resizeClip,
    deleteSelectedClips,
    duplicateSelectedClips,
    undo,
    redo,
    canUndo,
    canRedo,
    setPlayheadBar,
    getClipById,
  } = useEditorState();
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const hasSoloTrack = session.tracks.some((track) => track.solo);

  const totalBars = useMemo(() => {
    const maxClipEnd = Math.max(
      ...session.tracks.flatMap((track) =>
        track.clips.map((clip) => clip.start + clip.length),
      ),
      VISIBLE_BARS,
      session.loopRange.end + 1,
    );

    return Math.ceil(maxClipEnd + 1);
  }, [session.loopRange.end, session.tracks]);

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
        moveSelectedClips(deltaBars);
        return;
      }

      const initial = activeDragState.initialPositions[0];
      if (!initial) {
        return;
      }

      if (activeDragState.mode === "resize-start") {
        const nextStart = initial.start + deltaBars;
        const end = initial.start + initial.length;
        const boundedStart = Math.min(end - MIN_CLIP_LENGTH, nextStart);
        resizeClip(activeDragState.clipId, boundedStart, end - boundedStart);
        return;
      }

      const nextLength = initial.length + deltaBars;
      resizeClip(
        activeDragState.clipId,
        initial.start,
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
  }, [dragState, moveSelectedClips, resizeClip, stopDrag]);

  useEffect(() => {
    if (!marquee) {
      return undefined;
    }

    function onPointerMove(event: PointerEvent) {
      setMarquee((current) => {
        if (!current) {
          return null;
        }

        const nextCurrentX = event.clientX - current.laneLeft;
        const left = Math.min(current.startX, nextCurrentX);
        const right = Math.max(current.startX, nextCurrentX);
        const clipIds = current.clipBounds
          .filter((clip) => clip.right >= left && clip.left <= right)
          .map((clip) => clip.clipId);

        selectMultipleClips(clipIds);

        return {
          ...current,
          currentX: nextCurrentX,
        };
      });
    }

    function onPointerUp() {
      setMarquee(null);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [marquee, selectMultipleClips]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedClips();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelectedClips();
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        undo();
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        ((event.shiftKey && event.key.toLowerCase() === "z") ||
          event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        redo();
      }

      if (event.key === "Escape") {
        clearSelection();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearSelection, deleteSelectedClips, duplicateSelectedClips, redo, undo]);

  return (
    <section className="timeline-viewport">
      <div className="timeline-ruler-wrap">
        <div
          className="timeline-ruler"
          style={{ gridTemplateColumns: `repeat(${totalBars}, ${BAR_WIDTH}px)` }}
        >
          {Array.from({ length: totalBars }, (_, index) => {
            const barNumber = index + 1;
            const inLoop =
              session.loopRange.enabled &&
              barNumber >= session.loopRange.start &&
              barNumber < session.loopRange.end;
            const active = session.playheadBar === barNumber;

            return (
              <button
                key={barNumber}
                type="button"
                className={`ruler-cell ${inLoop ? "loop" : ""} ${active ? "active" : ""}`}
                onClick={() => setPlayheadBar(barNumber)}
              >
                Bar {barNumber}
              </button>
            );
          })}
        </div>
      </div>

      <div className="timeline-grid" onPointerDown={() => clearSelection()}>
        {session.tracks.map((track) => (
          <div
            key={track.id}
            className={`timeline-lane ${track.muted ? "muted-lane" : ""} ${
              hasSoloTrack && !track.solo ? "dimmed-lane" : ""
            }`}
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) {
                return;
              }

              event.stopPropagation();
              clearSelection();
              const rect = event.currentTarget.getBoundingClientRect();
              setMarquee({
                laneLeft: rect.left,
                trackId: track.id,
                clipBounds: track.clips.map((clip) => ({
                  clipId: clip.id,
                  left: clip.start * BAR_WIDTH,
                  right: clip.start * BAR_WIDTH + clip.length * BAR_WIDTH,
                })),
                startX: event.clientX - rect.left,
                currentX: event.clientX - rect.left,
              });
            }}
          >
            <div
              className="playhead-line"
              style={{ left: `${(session.playheadBar - 1) * BAR_WIDTH}px` }}
            />
            {track.clips.map((clip) => {
              const selected = selectedClipIds.includes(clip.id);
              const clipLeft = clip.start * BAR_WIDTH;
              const clipRight = clipLeft + clip.length * BAR_WIDTH;
              const marqueeLeft = marquee
                ? Math.min(marquee.startX, marquee.currentX)
                : null;
              const marqueeRight = marquee
                ? Math.max(marquee.startX, marquee.currentX)
                : null;
              const inMarquee =
                marquee?.trackId === track.id &&
                marqueeLeft !== null &&
                marqueeRight !== null &&
                clipRight >= marqueeLeft &&
                clipLeft <= marqueeRight;

              return (
                <article
                  key={clip.id}
                  className={`timeline-clip ${clip.color} ${
                    selected || inMarquee ? "selected" : ""
                  }`}
                  style={{
                    left: `${clipLeft}px`,
                    width: `${clip.length * BAR_WIDTH}px`,
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    const additive = event.shiftKey;
                    selectClip(clip.id, additive);
                    const activeIds =
                      additive && selectedClipIds.includes(clip.id)
                        ? selectedClipIds
                        : additive
                          ? [...selectedClipIds, clip.id]
                          : [clip.id];

                    startDrag({
                      clipId: clip.id,
                      trackId: track.id,
                      mode: "move",
                      originX: event.clientX,
                      initialPositions: activeIds
                        .map((clipId) => getClipById(clipId))
                        .filter((item): item is NonNullable<typeof item> => Boolean(item))
                        .map((item) => ({
                          clipId: item.clip.id,
                          start: item.clip.start,
                          length: item.clip.length,
                        })),
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
                        initialPositions: [
                          {
                            clipId: clip.id,
                            start: clip.start,
                            length: clip.length,
                          },
                        ],
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
                        initialPositions: [
                          {
                            clipId: clip.id,
                            start: clip.start,
                            length: clip.length,
                          },
                        ],
                      });
                    }}
                  />
                </article>
              );
            })}
            {marquee ? (
              <div
                className="marquee-box"
                style={{
                  left: `${Math.min(marquee.startX, marquee.currentX)}px`,
                  width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
                }}
              />
            ) : null}
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
            . `Delete` removes, `Cmd/Ctrl + D` duplicates.
          </span>
        ) : (
          <span>
            Click a ruler cell to move the playhead. Drag empty lane space for marquee
            selection, or Shift-click clips for multi-select.
          </span>
        )}
        <span className="timeline-shortcuts">
          Undo {canUndo ? "available" : "empty"} · Redo {canRedo ? "available" : "empty"}
        </span>
      </footer>
    </section>
  );
}
