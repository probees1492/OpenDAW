import { memo } from "react";
import type { Track, Clip } from "../../state/types";
import type { DragState } from "../../state/slices/types";
import type { MarqueeState } from "./useMarqueeSelection";
import { TimelineClip } from "./TimelineClip";

type TimelineLaneProps = {
  track: Track;
  trackIndex: number;
  barWidth: number;
  hasSoloTrack: boolean;
  selectedClipIds: string[];
  marquee: MarqueeState | null;
  playheadBar: number;
  onSelectClip: (clipId: string, additive?: boolean) => void;
  onClearSelection: () => void;
  onStartDrag: (dragState: DragState) => void;
  onStartMarquee: (params: {
    laneLeft: number;
    trackId: string;
    clips: Array<{ id: string; start: number; length: number }>;
    startX: number;
    barWidth: number;
  }) => void;
  getClipById: (clipId: string) => { clip: Clip; trackId: string } | undefined;
  setPlayheadRef: (trackId: string, element: HTMLDivElement | null) => void;
};

export const TimelineLane = memo(function TimelineLane({
  track,
  trackIndex,
  barWidth,
  hasSoloTrack,
  selectedClipIds,
  marquee,
  playheadBar,
  onSelectClip,
  onClearSelection,
  onStartDrag,
  onStartMarquee,
  getClipById,
  setPlayheadRef,
}: TimelineLaneProps) {
  const handleLanePointerDown = (event: React.PointerEvent) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    event.stopPropagation();
    onClearSelection();
    const rect = event.currentTarget.getBoundingClientRect();
    onStartMarquee({
      laneLeft: rect.left,
      trackId: track.id,
      clips: track.clips.map((clip) => ({
        id: clip.id,
        start: clip.start,
        length: clip.length,
      })),
      startX: event.clientX - rect.left,
      barWidth,
    });
  };

  return (
    <div
      className={`timeline-lane ${track.muted ? "muted-lane" : ""} ${
        hasSoloTrack && !track.solo ? "dimmed-lane" : ""
      }`}
      style={
        {
          "--track-index": trackIndex,
          "--bar-width": `${barWidth}px`,
          backgroundSize: `${barWidth}px 100%`,
        } as React.CSSProperties
      }
      onPointerDown={handleLanePointerDown}
    >
      <div
        ref={(el) => setPlayheadRef(track.id, el)}
        className="playhead-line"
      />
      {track.clips.map((clip) => {
        const selected = selectedClipIds.includes(clip.id);
        const clipLeft = clip.start * barWidth;
        const clipRight = clipLeft + clip.length * barWidth;
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
          <TimelineClip
            key={clip.id}
            clip={clip}
            track={track}
            barWidth={barWidth}
            isSelected={selected}
            isInMarquee={inMarquee}
            selectedClipIds={selectedClipIds}
            onSelectClip={onSelectClip}
            onStartDrag={onStartDrag}
            getClipById={getClipById}
          />
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
  );
});
