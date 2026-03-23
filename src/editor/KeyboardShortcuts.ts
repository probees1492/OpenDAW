type KeyboardShortcut = {
  key: string;
  ctrlOrCmd?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
};

export type ShortcutHandler = () => void;

export type ShortcutMap = {
  delete: ShortcutHandler;
  duplicate: ShortcutHandler;
  undo: ShortcutHandler;
  redo: ShortcutHandler;
  escape: ShortcutHandler;
  toggleBottomPanel: ShortcutHandler;
};

const isInputFocused = (): boolean => {
  const target = document.activeElement as HTMLElement | null;
  return (
    target !== null &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  );
};

export function createKeyboardHandler(shortcuts: ShortcutMap) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isInputFocused()) {
      return;
    }

    const { key, metaKey, ctrlKey, shiftKey } = event;
    const ctrlOrCmd = metaKey || ctrlKey;

    // Delete/Backspace
    if (key === "Delete" || key === "Backspace") {
      event.preventDefault();
      shortcuts.delete();
      return;
    }

    // Cmd/Ctrl + D (Duplicate)
    if (ctrlOrCmd && key.toLowerCase() === "d") {
      event.preventDefault();
      shortcuts.duplicate();
      return;
    }

    // Cmd/Ctrl + Z (Undo)
    if (ctrlOrCmd && !shiftKey && key.toLowerCase() === "z") {
      event.preventDefault();
      shortcuts.undo();
      return;
    }

    // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y (Redo)
    if (
      ctrlOrCmd &&
      ((shiftKey && key.toLowerCase() === "z") || key.toLowerCase() === "y")
    ) {
      event.preventDefault();
      shortcuts.redo();
      return;
    }

    // Escape
    if (key === "Escape") {
      shortcuts.escape();
      return;
    }

    // B (Toggle bottom panel)
    if (key.toLowerCase() === "b" && !ctrlOrCmd) {
      event.preventDefault();
      shortcuts.toggleBottomPanel();
      return;
    }
  };

  return handleKeyDown;
}

export function getShortcutList(): Array<{
  keys: string;
  description: string;
}> {
  return [
    { keys: "Delete / Backspace", description: "선택한 클립 삭제" },
    { keys: "Cmd/Ctrl + D", description: "선택한 클립 복제" },
    { keys: "Cmd/Ctrl + Z", description: "실행 취소" },
    { keys: "Cmd/Ctrl + Shift + Z", description: "다시 실행" },
    { keys: "Cmd/Ctrl + Y", description: "다시 실행" },
    { keys: "Escape", description: "선택 해제" },
    { keys: "B", description: "하단 패널 토글" },
  ];
}
