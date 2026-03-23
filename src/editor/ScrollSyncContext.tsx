import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type PropsWithChildren,
} from "react";

interface ScrollSyncContextValue {
  registerTrackList: (element: HTMLDivElement | null) => void;
  registerTimelineGrid: (element: HTMLDivElement | null) => void;
  syncScroll: (source: "trackList" | "timelineGrid", scrollTop: number) => void;
}

const ScrollSyncContext = createContext<ScrollSyncContextValue | null>(null);

export function ScrollSyncProvider({ children }: PropsWithChildren) {
  const trackListRef = useRef<HTMLDivElement | null>(null);
  const timelineGridRef = useRef<HTMLDivElement | null>(null);
  const isScrolling = useRef(false);

  const registerTrackList = useCallback((element: HTMLDivElement | null) => {
    trackListRef.current = element;
  }, []);

  const registerTimelineGrid = useCallback((element: HTMLDivElement | null) => {
    timelineGridRef.current = element;
  }, []);

  const syncScroll = useCallback(
    (source: "trackList" | "timelineGrid", scrollTop: number) => {
      // Prevent infinite loop
      if (isScrolling.current) return;
      isScrolling.current = true;

      requestAnimationFrame(() => {
        if (source === "trackList" && timelineGridRef.current) {
          timelineGridRef.current.scrollTop = scrollTop;
        } else if (source === "timelineGrid" && trackListRef.current) {
          trackListRef.current.scrollTop = scrollTop;
        }
        isScrolling.current = false;
      });
    },
    []
  );

  return (
    <ScrollSyncContext.Provider
      value={{
        registerTrackList,
        registerTimelineGrid,
        syncScroll,
      }}
    >
      {children}
    </ScrollSyncContext.Provider>
  );
}

export function useScrollSync() {
  const context = useContext(ScrollSyncContext);
  if (!context) {
    throw new Error("useScrollSync must be used within ScrollSyncProvider");
  }
  return context;
}
