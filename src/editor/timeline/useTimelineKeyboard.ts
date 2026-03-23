import { useEffect } from "react";

type UseTimelineKeyboardOptions = {
  onDelete: () => void;
  onDuplicate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearSelection: () => void;
};

export function useTimelineKeyboard({
  onDelete,
  onDuplicate,
  onUndo,
  onRedo,
  onClearSelection,
}: UseTimelineKeyboardOptions) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        onDelete();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        onDuplicate();
        return;
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        onUndo();
        return;
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        ((event.shiftKey && event.key.toLowerCase() === "z") ||
          event.key.toLowerCase() === "y")
      ) {
        event.preventDefault();
        onRedo();
        return;
      }

      if (event.key === "Escape") {
        onClearSelection();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClearSelection, onDelete, onDuplicate, onRedo, onUndo]);
}
