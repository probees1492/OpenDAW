import { memo, useId } from "react";
import type { Clip, Track } from "../../state/types";
import type { DragState } from "../../state/slices/types";

type TimelineClipProps = {
  clip: Clip;
  track: Track;
  barWidth: number;
  isSelected: boolean;
  isInMarquee: boolean;
  selectedClipIds: string[];
  onSelectClip: (clipId: string, additive?: boolean) => void;
  onStartDrag: (dragState: DragState) => void;
  getClipById: (clipId: string) => { clip: Clip; trackId: string } | undefined;
};

export const TimelineClip = memo(function TimelineClip({
  clip,
  track,
  barWidth,
  isSelected,
  isInMarquee,
  selectedClipIds,
  onSelectClip,
  onStartDrag,
  getClipById,
}: TimelineClipProps) {
  const clipLabelId = useId();
  const clipDescId = useId();

  const handleClipPointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    const additive = event.shiftKey;
    onSelectClip(clip.id, additive);

    const activeIds =
      additive && selectedClipIds.includes(clip.id)
        ? selectedClipIds
        : additive
          ? [...selectedClipIds, clip.id]
          : [clip.id];

    onStartDrag({
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
  };

  const handleResizeStart = (event: React.PointerEvent) => {
    event.stopPropagation();
    onSelectClip(clip.id);
    onStartDrag({
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
  };

  const handleResizeEnd = (event: React.PointerEvent) => {
    event.stopPropagation();
    onSelectClip(clip.id);
    onStartDrag({
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
  };

  return (
    <article
      className={`timeline-clip ${clip.color} ${
        isSelected || isInMarquee ? "selected" : ""
      }`}
      style={{
        left: `${clip.start * barWidth}px`,
        width: `${clip.length * barWidth}px`,
      }}
      onPointerDown={handleClipPointerDown}
      role="button"
      tabIndex={0}
      aria-labelledby={clipLabelId}
      aria-describedby={clipDescId}
      aria-pressed={isSelected}
    >
      <button
        type="button"
        className="clip-handle start"
        aria-label={`Resize start for ${clip.name}`}
        onPointerDown={handleResizeStart}
      />
      <div className="clip-copy">
        <span id={clipLabelId}>{clip.name}</span>
        <small id={clipDescId}>
          {track.name} · {track.type}
        </small>
      </div>
      <button
        type="button"
        className="clip-handle end"
        aria-label={`Resize end for ${clip.name}`}
        onPointerDown={handleResizeEnd}
      />
    </article>
  );
});
