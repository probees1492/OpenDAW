import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditorState } from "../state/EditorStateProvider";
import { useAudioEngineContext } from "../audio/AudioEngineContext";
import { useScrollSync } from "./ScrollSyncContext";
import { useZoom } from "./ZoomContext";
import {
  TimelineRuler,
  TimelineLane,
  TimelineStatus,
  useTimelineDrag,
  useMarqueeSelection,
  usePlayheadAnimation,
} from "./timeline";

const VISIBLE_BARS = 8;

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
    canUndo,
    canRedo,
    setPlayheadBar,
    getClipById,
  } = useEditorState();

  const { subscribeToPlayhead, seek } = useAudioEngineContext();
  const { registerTimelineGrid, syncScroll } = useScrollSync();
  const { barWidth } = useZoom();

  const timelineGridRef = useRef<HTMLDivElement>(null);
  const hasSoloTrack = session.tracks.some((track) => track.solo);

  // Calculate total bars needed
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

  // Register timeline grid for scroll sync
  useEffect(() => {
    registerTimelineGrid(timelineGridRef.current);
  }, [registerTimelineGrid]);

  // Scroll handler
  const handleScroll = useCallback(() => {
    if (timelineGridRef.current) {
      syncScroll("timelineGrid", timelineGridRef.current.scrollTop);
    }
  }, [syncScroll]);

  // Drag handling
  useTimelineDrag({
    dragState,
    barWidth,
    onMoveClips: moveSelectedClips,
    onResizeClip: resizeClip,
    onStopDrag: stopDrag,
  });

  // Marquee selection
  const { marquee, startMarquee } = useMarqueeSelection({
    onSelectMultiple: selectMultipleClips,
  });

  // Playhead animation
  const { setPlayheadRef } = usePlayheadAnimation({
    subscribeToPlayhead,
    initialBar: session.playheadBar,
    barWidth,
  });

  // Handle ruler click
  const handleRulerClick = useCallback(
    (barNumber: number) => {
      setPlayheadBar(barNumber);
      seek(barNumber);
    },
    [setPlayheadBar, seek],
  );

  // Get clip name helper
  const getClipName = useCallback(
    (clipId: string) => getClipById(clipId)?.clip.name ?? clipId,
    [getClipById],
  );

  return (
    <section className="timeline-viewport">
      <TimelineRuler
        totalBars={totalBars}
        barWidth={barWidth}
        playheadBar={session.playheadBar}
        loopRange={session.loopRange}
        onBarClick={handleRulerClick}
      />

      <div
        ref={timelineGridRef}
        className="timeline-grid scroll-sync-area"
        onScroll={handleScroll}
        onPointerDown={() => clearSelection()}
      >
        {session.tracks.map((track, index) => (
          <TimelineLane
            key={track.id}
            track={track}
            trackIndex={index}
            barWidth={barWidth}
            hasSoloTrack={hasSoloTrack}
            selectedClipIds={selectedClipIds}
            marquee={marquee}
            playheadBar={session.playheadBar}
            onSelectClip={selectClip}
            onClearSelection={clearSelection}
            onStartDrag={startDrag}
            onStartMarquee={startMarquee}
            getClipById={getClipById}
            setPlayheadRef={setPlayheadRef}
          />
        ))}
      </div>

      <TimelineStatus
        selectedClipIds={selectedClipIds}
        canUndo={canUndo}
        canRedo={canRedo}
        getClipName={getClipName}
      />
    </section>
  );
}
