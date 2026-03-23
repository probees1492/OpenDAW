import { memo } from "react";

type TimelineStatusProps = {
  selectedClipIds: string[];
  canUndo: boolean;
  canRedo: boolean;
  getClipName: (clipId: string) => string;
};

export const TimelineStatus = memo(function TimelineStatus({
  selectedClipIds,
  canUndo,
  canRedo,
  getClipName,
}: TimelineStatusProps) {
  return (
    <footer className="timeline-status">
      {selectedClipIds.length > 0 ? (
        <span>
          Selected:{" "}
          {selectedClipIds.map((clipId) => getClipName(clipId)).join(", ")}
          . `Delete` removes, `Cmd/Ctrl + D` duplicates.
        </span>
      ) : (
        <span>
          Click a ruler cell to move the playhead. Drag empty lane space for
          marquee selection, or Shift-click clips for multi-select.
        </span>
      )}
      <span className="timeline-shortcuts">
        Undo {canUndo ? "available" : "empty"} · Redo{" "}
        {canRedo ? "available" : "empty"}
      </span>
    </footer>
  );
});
