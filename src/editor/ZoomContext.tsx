import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

// Zoom range: 0.25x (zoomed out) to 4x (zoomed in)
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const DEFAULT_ZOOM = 1;

// Base bar width at 1x zoom
export const BASE_BAR_WIDTH = 112;

interface ZoomContextValue {
  /** Current zoom level (1 = 100%, 2 = 200%, etc.) */
  zoomLevel: number;
  /** Calculated bar width based on zoom level */
  barWidth: number;
  /** Set zoom level directly */
  setZoomLevel: (level: number) => void;
  /** Zoom in by step */
  zoomIn: () => void;
  /** Zoom out by step */
  zoomOut: () => void;
  /** Reset to default zoom */
  resetZoom: () => void;
  /** Zoom constraints */
  readonly minZoom: typeof MIN_ZOOM;
  readonly maxZoom: typeof MAX_ZOOM;
}

const ZoomContext = createContext<ZoomContextValue | null>(null);

export function ZoomProvider({ children }: PropsWithChildren) {
  const [zoomLevel, setZoomLevelState] = useState(DEFAULT_ZOOM);

  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
    setZoomLevelState(clampedLevel);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevelState((prev) => Math.min(MAX_ZOOM, prev * 1.25));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevelState((prev) => Math.max(MIN_ZOOM, prev / 1.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevelState(DEFAULT_ZOOM);
  }, []);

  const barWidth = Math.round(BASE_BAR_WIDTH * zoomLevel);

  return (
    <ZoomContext.Provider
      value={{
        zoomLevel,
        barWidth,
        setZoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
      }}
    >
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error("useZoom must be used within ZoomProvider");
  }
  return context;
}
