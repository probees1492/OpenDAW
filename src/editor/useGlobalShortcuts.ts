import { useEffect } from "react";
import { createKeyboardHandler, type ShortcutMap } from "./KeyboardShortcuts";

export function useGlobalShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = createKeyboardHandler(shortcuts);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
