import { memo } from "react";

type TimelineRulerProps = {
  totalBars: number;
  barWidth: number;
  playheadBar: number;
  loopRange: {
    enabled: boolean;
    start: number;
    end: number;
  };
  onBarClick: (bar: number) => void;
};

export const TimelineRuler = memo(function TimelineRuler({
  totalBars,
  barWidth,
  playheadBar,
  loopRange,
  onBarClick,
}: TimelineRulerProps) {
  return (
    <div className="timeline-ruler-wrap">
      <div
        className="timeline-ruler"
        style={{ gridTemplateColumns: `repeat(${totalBars}, ${barWidth}px)` }}
      >
        {Array.from({ length: totalBars }, (_, index) => {
          const barNumber = index + 1;
          const inLoop =
            loopRange.enabled &&
            barNumber >= loopRange.start &&
            barNumber < loopRange.end;
          const active = Math.floor(playheadBar) === barNumber;

          return (
            <button
              key={barNumber}
              type="button"
              className={`ruler-cell ${inLoop ? "loop" : ""} ${active ? "active" : ""}`}
              onClick={() => onBarClick(barNumber)}
            >
              Bar {barNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
});
