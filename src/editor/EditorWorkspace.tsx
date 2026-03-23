import { useMemo } from "react";
import { TrackHeaderPane } from "./TrackHeaderPane";
import { TimelineViewport } from "./TimelineViewport";
import { RightPanelHost } from "./RightPanelHost";
import { useEditorState } from "../state/EditorStateProvider";
import { useGlobalShortcuts } from "./useGlobalShortcuts";

export function EditorWorkspace() {
  const {
    deleteSelectedClips,
    duplicateSelectedClips,
    undo,
    redo,
    clearSelection,
  } = useEditorState();

  // Centralized keyboard shortcuts (excluding B for bottom panel)
  const shortcuts = useMemo(
    () => ({
      delete: deleteSelectedClips,
      duplicate: duplicateSelectedClips,
      undo,
      redo,
      escape: clearSelection,
      toggleBottomPanel: () => {}, // Handled by BottomPanelHost
    }),
    [deleteSelectedClips, duplicateSelectedClips, undo, redo, clearSelection],
  );

  useGlobalShortcuts(shortcuts);

  return (
    <section className="editor-workspace">
      <TrackHeaderPane />
      <TimelineViewport />
      <RightPanelHost />
    </section>
  );
}
