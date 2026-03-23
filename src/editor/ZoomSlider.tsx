import { useZoom } from "./ZoomContext";

export function ZoomSlider() {
  const { zoomLevel, setZoomLevel, zoomIn, zoomOut, resetZoom, minZoom, maxZoom } =
    useZoom();

  const percentage = ((zoomLevel - minZoom) / (maxZoom - minZoom)) * 100;
  const displayValue = Math.round(zoomLevel * 100);

  return (
    <div className="zoom-slider-container">
      <button
        className="zoom-button"
        onClick={zoomOut}
        disabled={zoomLevel <= minZoom}
        aria-label="Zoom out"
      >
        −
      </button>
      <div className="zoom-slider-track">
        <input
          type="range"
          className="zoom-slider"
          min={minZoom}
          max={maxZoom}
          step={0.05}
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, #63e6ff ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
          }}
          aria-label={`Zoom level: ${displayValue}%`}
        />
      </div>
      <button
        className="zoom-button"
        onClick={zoomIn}
        disabled={zoomLevel >= maxZoom}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        className="zoom-reset-button"
        onClick={resetZoom}
        aria-label="Reset zoom to 100%"
      >
        {displayValue}%
      </button>
    </div>
  );
}
