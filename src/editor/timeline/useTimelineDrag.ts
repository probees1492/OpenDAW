import { useEffect } from "react";
import type { DragState } from "../../state/slices/types";

const MIN_CLIP_LENGTH = 0.5;

function roundToGrid(value: number) {
  return Math.round(value * 4) / 4;
}

type UseTimelineDragOptions = {
  dragState: DragState | null;
  barWidth: number;
  onMoveClips: (delta: number) => void;
  onResizeClip: (clipId: string, start: number, length: number) => void;
  onStopDrag: () => void;
};

export function useTimelineDrag({
  dragState,
  barWidth,
  onMoveClips,
  onResizeClip,
  onStopDrag,
}: UseTimelineDragOptions) {
  useEffect(() => {
    if (!dragState) {
      return undefined;
    }

    const activeDragState = dragState;

    function onPointerMove(event: PointerEvent) {
      const deltaBars = roundToGrid(
        (event.clientX - activeDragState.originX) / barWidth,
      );

      if (activeDragState.mode === "move") {
        onMoveClips(deltaBars);
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
        onResizeClip(activeDragState.clipId, boundedStart, end - boundedStart);
        return;
      }

      const nextLength = initial.length + deltaBars;
      onResizeClip(
        activeDragState.clipId,
        initial.start,
        Math.max(MIN_CLIP_LENGTH, nextLength),
      );
    }

    function onPointerUp() {
      onStopDrag();
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragState, barWidth, onMoveClips, onResizeClip, onStopDrag]);
}
