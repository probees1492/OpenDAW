import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { Clip, ProjectSession } from "./types";

type DragMode = "move" | "resize-start" | "resize-end";

type DragState = {
  clipId: string;
  trackId: string;
  mode: DragMode;
  originX: number;
  initialStart: number;
  initialLength: number;
};

type EditorState = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
};

type EditorAction =
  | { type: "selectClip"; clipId: string; additive?: boolean }
  | { type: "clearSelection" }
  | { type: "startDrag"; dragState: DragState }
  | { type: "stopDrag" }
  | { type: "moveClip"; clipId: string; start: number }
  | { type: "resizeClip"; clipId: string; start: number; length: number };

type EditorStateValue = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  selectClip: (clipId: string, additive?: boolean) => void;
  clearSelection: () => void;
  startDrag: (dragState: DragState) => void;
  stopDrag: () => void;
  moveClip: (clipId: string, start: number) => void;
  resizeClip: (clipId: string, start: number, length: number) => void;
  getClipById: (clipId: string) => { clip: Clip; trackId: string } | undefined;
};

const EditorStateContext = createContext<EditorStateValue | null>(null);

function cloneSession(session: ProjectSession): ProjectSession {
  return {
    ...session,
    tracks: session.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => ({ ...clip })),
    })),
    comments: session.comments.map((comment) => ({ ...comment })),
  };
}

function updateClip(
  session: ProjectSession,
  clipId: string,
  updater: (clip: Clip) => Clip,
): ProjectSession {
  return {
    ...session,
    tracks: session.tracks.map((track) => ({
      ...track,
      clips: track.clips.map((clip) => (clip.id === clipId ? updater(clip) : clip)),
    })),
  };
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "selectClip": {
      const selectedClipIds = action.additive
        ? Array.from(new Set([...state.selectedClipIds, action.clipId]))
        : [action.clipId];

      return { ...state, selectedClipIds };
    }
    case "clearSelection":
      return { ...state, selectedClipIds: [] };
    case "startDrag":
      return { ...state, dragState: action.dragState };
    case "stopDrag":
      return { ...state, dragState: null };
    case "moveClip":
      return {
        ...state,
        session: updateClip(state.session, action.clipId, (clip) => ({
          ...clip,
          start: Math.max(0, action.start),
        })),
      };
    case "resizeClip":
      return {
        ...state,
        session: updateClip(state.session, action.clipId, (clip) => ({
          ...clip,
          start: Math.max(0, action.start),
          length: Math.max(0.5, action.length),
        })),
      };
    default:
      return state;
  }
}

export function EditorStateProvider({
  children,
  session,
}: PropsWithChildren<{ session: ProjectSession }>) {
  const [state, dispatch] = useReducer(editorReducer, {
    session: cloneSession(session),
    selectedClipIds: [],
    dragState: null,
  });

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

  const moveClip = useCallback((clipId: string, start: number) => {
    dispatch({ type: "moveClip", clipId, start });
  }, []);

  const resizeClip = useCallback((clipId: string, start: number, length: number) => {
    dispatch({ type: "resizeClip", clipId, start, length });
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
      selectClip,
      clearSelection,
      startDrag,
      stopDrag,
      moveClip,
      resizeClip,
      getClipById,
    }),
    [
      getClipById,
      moveClip,
      resizeClip,
      selectClip,
      clearSelection,
      startDrag,
      stopDrag,
      state,
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
