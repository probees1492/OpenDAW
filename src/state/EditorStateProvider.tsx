import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import type { Clip, ProjectSession } from "./types";

type DragMode = "move" | "resize-start" | "resize-end";

type DragState = {
  clipId: string;
  trackId: string;
  mode: DragMode;
  originX: number;
  initialPositions: Array<{
    clipId: string;
    start: number;
    length: number;
  }>;
};

type EditorState = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  saveState: "saved" | "dirty" | "saving";
};

type EditorAction =
  | { type: "selectClip"; clipId: string; additive?: boolean }
  | { type: "clearSelection" }
  | { type: "startDrag"; dragState: DragState }
  | { type: "stopDrag" }
  | { type: "moveSelectedClips"; delta: number }
  | { type: "resizeClip"; clipId: string; start: number; length: number }
  | { type: "deleteSelectedClips" }
  | { type: "duplicateSelectedClips" }
  | { type: "setPlayheadBar"; bar: number }
  | { type: "setSaveState"; saveState: EditorState["saveState"] };

type EditorStateValue = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  saveState: EditorState["saveState"];
  selectClip: (clipId: string, additive?: boolean) => void;
  clearSelection: () => void;
  startDrag: (dragState: DragState) => void;
  stopDrag: () => void;
  moveSelectedClips: (delta: number) => void;
  resizeClip: (clipId: string, start: number, length: number) => void;
  deleteSelectedClips: () => void;
  duplicateSelectedClips: () => void;
  setPlayheadBar: (bar: number) => void;
  getClipById: (clipId: string) => { clip: Clip; trackId: string } | undefined;
};

const EditorStateContext = createContext<EditorStateValue | null>(null);

function cloneSession(session: ProjectSession): ProjectSession {
  return {
    ...session,
    loopRange: { ...session.loopRange },
    tracks: session.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => ({ ...clip })),
    })),
    comments: session.comments.map((comment) => ({ ...comment })),
  };
}

function withDirtySaveState(session: ProjectSession, state: EditorState): EditorState {
  return {
    ...state,
    session,
    saveState: "dirty",
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "selectClip": {
      const selectedClipIds = action.additive
        ? state.selectedClipIds.includes(action.clipId)
          ? state.selectedClipIds.filter((clipId) => clipId !== action.clipId)
          : [...state.selectedClipIds, action.clipId]
        : [action.clipId];

      return { ...state, selectedClipIds };
    }
    case "clearSelection":
      return { ...state, selectedClipIds: [] };
    case "startDrag":
      return { ...state, dragState: action.dragState };
    case "stopDrag":
      return { ...state, dragState: null };
    case "moveSelectedClips": {
      const initialPositions = state.dragState?.initialPositions ?? [];
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) => {
            const initial = initialPositions.find((item) => item.clipId === clip.id);
            if (!initial) {
              return clip;
            }

            return {
              ...clip,
              start: Math.max(0, initial.start + action.delta),
            };
          }),
        })),
      };

      return withDirtySaveState(session, state);
    }
    case "resizeClip": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) =>
            clip.id === action.clipId
              ? {
                  ...clip,
                  start: Math.max(0, action.start),
                  length: Math.max(0.5, action.length),
                }
              : clip,
          ),
        })),
      };

      return withDirtySaveState(session, state);
    }
    case "deleteSelectedClips": {
      if (state.selectedClipIds.length === 0) {
        return state;
      }

      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => !state.selectedClipIds.includes(clip.id)),
        })),
      };

      return {
        ...withDirtySaveState(session, state),
        selectedClipIds: [],
      };
    }
    case "duplicateSelectedClips": {
      if (state.selectedClipIds.length === 0) {
        return state;
      }

      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: [
            ...track.clips,
            ...track.clips
              .filter((clip) => state.selectedClipIds.includes(clip.id))
              .map((clip) => ({
                ...clip,
                id: `${clip.id}-copy-${Math.random().toString(36).slice(2, 7)}`,
                name: `${clip.name} Copy`,
                start: clip.start + 0.5,
              })),
          ],
        })),
      };

      return withDirtySaveState(session, state);
    }
    case "setPlayheadBar": {
      const boundedBar = Math.max(1, action.bar);
      return withDirtySaveState(
        {
          ...state.session,
          playheadBar: boundedBar,
          playhead: `${boundedBar}.1.000`,
        },
        state,
      );
    }
    case "setSaveState":
      return { ...state, saveState: action.saveState };
    default:
      return state;
  }
}

export function EditorStateProvider({
  children,
  session,
  onSessionChange,
}: PropsWithChildren<{
  session: ProjectSession;
  onSessionChange: (session: ProjectSession) => void;
}>) {
  const [state, dispatch] = useReducer(editorReducer, {
    session: cloneSession(session),
    selectedClipIds: [],
    dragState: null,
    saveState: "saved",
  });
  const isFirstSync = useRef(true);

  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    if (state.saveState !== "dirty") {
      return;
    }

    dispatch({ type: "setSaveState", saveState: "saving" });

    const timeout = window.setTimeout(() => {
      onSessionChange(state.session);
      dispatch({ type: "setSaveState", saveState: "saved" });
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [onSessionChange, state.saveState, state.session]);

  const selectClip = useCallback((clipId: string, additive?: boolean) => {
    dispatch({ type: "selectClip", clipId, additive });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: "clearSelection" });
  }, []);

  const startDrag = useCallback((dragState: DragState) => {
    dispatch({ type: "startDrag", dragState });
  }, []);

  const stopDrag = useCallback(() => {
    dispatch({ type: "stopDrag" });
  }, []);

  const moveSelectedClips = useCallback((delta: number) => {
    dispatch({ type: "moveSelectedClips", delta });
  }, []);

  const resizeClip = useCallback((clipId: string, start: number, length: number) => {
    dispatch({ type: "resizeClip", clipId, start, length });
  }, []);

  const deleteSelectedClips = useCallback(() => {
    dispatch({ type: "deleteSelectedClips" });
  }, []);

  const duplicateSelectedClips = useCallback(() => {
    dispatch({ type: "duplicateSelectedClips" });
  }, []);

  const setPlayheadBar = useCallback((bar: number) => {
    dispatch({ type: "setPlayheadBar", bar });
  }, []);

  const getClipById = useCallback(
    (clipId: string) => {
      for (const track of state.session.tracks) {
        const clip = track.clips.find((item) => item.id === clipId);
        if (clip) {
          return { clip, trackId: track.id };
        }
      }

      return undefined;
    },
    [state.session.tracks],
  );

  const value = useMemo<EditorStateValue>(
    () => ({
      session: state.session,
      selectedClipIds: state.selectedClipIds,
      dragState: state.dragState,
      saveState: state.saveState,
      selectClip,
      clearSelection,
      startDrag,
      stopDrag,
      moveSelectedClips,
      resizeClip,
      deleteSelectedClips,
      duplicateSelectedClips,
      setPlayheadBar,
      getClipById,
    }),
    [
      clearSelection,
      deleteSelectedClips,
      duplicateSelectedClips,
      getClipById,
      moveSelectedClips,
      resizeClip,
      selectClip,
      setPlayheadBar,
      startDrag,
      state,
      stopDrag,
    ],
  );

  return (
    <EditorStateContext.Provider value={value}>
      {children}
    </EditorStateContext.Provider>
  );
}

export function useEditorState() {
  const context = useContext(EditorStateContext);

  if (!context) {
    throw new Error("useEditorState must be used within EditorStateProvider");
  }

  return context;
}
