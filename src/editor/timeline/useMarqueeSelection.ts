import { useCallback, useEffect, useState } from "react";

export type MarqueeState = {
  laneLeft: number;
  trackId: string;
  clipBounds: Array<{ clipId: string; left: number; right: number }>;
  startX: number;
  currentX: number;
};

type UseMarqueeSelectionOptions = {
  onSelectMultiple: (clipIds: string[]) => void;
};

export function useMarqueeSelection({ onSelectMultiple }: UseMarqueeSelectionOptions) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);

  // Handle marquee pointer events
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

        onSelectMultiple(clipIds);

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
  }, [marquee, onSelectMultiple]);

  const startMarquee = useCallback(
    (params: {
      laneLeft: number;
      trackId: string;
      clips: Array<{ id: string; start: number; length: number }>;
      startX: number;
      barWidth: number;
    }) => {
      setMarquee({
        laneLeft: params.laneLeft,
        trackId: params.trackId,
        clipBounds: params.clips.map((clip) => ({
          clipId: clip.id,
          left: clip.start * params.barWidth,
          right: clip.start * params.barWidth + clip.length * params.barWidth,
        })),
        startX: params.startX,
        currentX: params.startX,
      });
    },
    [],
  );

  const cancelMarquee = useCallback(() => {
    setMarquee(null);
  }, []);

  return {
    marquee,
    startMarquee,
    cancelMarquee,
  };
}
