import { useEffect, useRef } from "react";

type UsePlayheadAnimationOptions = {
  subscribeToPlayhead: (callback: (bar: number) => void) => () => void;
  initialBar: number;
  barWidth: number;
};

export function usePlayheadAnimation({
  subscribeToPlayhead,
  initialBar,
  barWidth,
}: UsePlayheadAnimationOptions) {
  const playheadLineRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastAnimatedBarRef = useRef<number>(-1);

  // Set playhead ref for a track
  const setPlayheadRef = (trackId: string, element: HTMLDivElement | null) => {
    if (element) {
      playheadLineRefs.current.set(trackId, element);
      element.style.transform = `translateX(${(initialBar - 1) * barWidth}px)`;
    } else {
      playheadLineRefs.current.delete(trackId);
    }
  };

  // Subscribe to playhead updates for smooth animation
  useEffect(() => {
    const unsubscribe = subscribeToPlayhead((bar: number) => {
      if (Math.abs(bar - lastAnimatedBarRef.current) < 0.01) {
        return;
      }
      lastAnimatedBarRef.current = bar;

      const leftPosition = (bar - 1) * barWidth;
      playheadLineRefs.current.forEach((element) => {
        element.style.transform = `translateX(${leftPosition}px)`;
      });
    });

    return unsubscribe;
  }, [subscribeToPlayhead, barWidth]);

  // Update position when initialBar changes
  useEffect(() => {
    const leftPosition = (initialBar - 1) * barWidth;
    playheadLineRefs.current.forEach((element) => {
      element.style.transform = `translateX(${leftPosition}px)`;
    });
    lastAnimatedBarRef.current = initialBar;
  }, [initialBar, barWidth]);

  return { setPlayheadRef };
}
