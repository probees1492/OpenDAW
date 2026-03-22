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
import type { Clip, ProjectSession, TrackType, TransportState } from "./types";

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

type HistoryState = {
  past: ProjectSession[];
  future: ProjectSession[];
};

type EditorState = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  saveState: "saved" | "dirty" | "saving";
  history: HistoryState;
};

type EditorAction =
  | { type: "selectClip"; clipId: string; additive?: boolean }
  | { type: "selectMultipleClips"; clipIds: string[] }
  | { type: "clearSelection" }
  | { type: "startDrag"; dragState: DragState }
  | { type: "stopDrag" }
  | { type: "moveSelectedClips"; delta: number }
  | { type: "resizeClip"; clipId: string; start: number; length: number }
  | { type: "deleteSelectedClips" }
  | { type: "duplicateSelectedClips" }
  | { type: "setPlayheadBar"; bar: number }
  | { type: "setTransportState"; transport: TransportState }
  | { type: "toggleLoopEnabled" }
  | { type: "addTrack"; trackType: TrackType }
  | { type: "toggleTrackMute"; trackId: string }
  | { type: "toggleTrackSolo"; trackId: string }
  | { type: "addComment"; body: string }
  | { type: "toggleCommentResolved"; commentId: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "setSaveState"; saveState: EditorState["saveState"] };

type EditorStateValue = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  saveState: EditorState["saveState"];
  canUndo: boolean;
  canRedo: boolean;
  selectClip: (clipId: string, additive?: boolean) => void;
  selectMultipleClips: (clipIds: string[]) => void;
  clearSelection: () => void;
  startDrag: (dragState: DragState) => void;
  stopDrag: () => void;
  moveSelectedClips: (delta: number) => void;
  resizeClip: (clipId: string, start: number, length: number) => void;
  deleteSelectedClips: () => void;
  duplicateSelectedClips: () => void;
  setPlayheadBar: (bar: number) => void;
  setTransportState: (transport: TransportState) => void;
  toggleLoopEnabled: () => void;
  addTrack: (trackType: TrackType) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  addComment: (body: string) => void;
  toggleCommentResolved: (commentId: string) => void;
  undo: () => void;
  redo: () => void;
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

function pushHistory(state: EditorState): HistoryState {
  return {
    past: [...state.history.past, cloneSession(state.session)],
    future: [],
  };
}

function withSession(
  state: EditorState,
  session: ProjectSession,
  selectedClipIds = state.selectedClipIds,
): EditorState {
  return {
    ...state,
    session,
    selectedClipIds,
    saveState: "dirty",
    history: pushHistory(state),
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
    case "selectMultipleClips":
      return { ...state, selectedClipIds: action.clipIds };
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

      return { ...state, session, saveState: "dirty" };
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

      return { ...state, session, saveState: "dirty" };
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

      return withSession(state, session, []);
    }
    case "duplicateSelectedClips": {
      if (state.selectedClipIds.length === 0) {
        return state;
      }

      const duplicates: string[] = [];
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: [
            ...track.clips,
            ...track.clips
              .filter((clip) => state.selectedClipIds.includes(clip.id))
              .map((clip) => {
                const id = `${clip.id}-copy-${Math.random().toString(36).slice(2, 7)}`;
                duplicates.push(id);
                return {
                  ...clip,
                  id,
                  name: `${clip.name} Copy`,
                  start: clip.start + 0.5,
                };
              }),
          ],
        })),
      };

      return withSession(state, session, duplicates);
    }
    case "setPlayheadBar": {
      const boundedBar = Math.max(1, action.bar);
      return {
        ...state,
        session: {
          ...state.session,
          playheadBar: boundedBar,
          playhead: `${boundedBar}.1.000`,
        },
        saveState: "dirty",
      };
    }
    case "setTransportState":
      return {
        ...state,
        session: {
          ...state.session,
          transport: action.transport,
        },
      };
    case "toggleLoopEnabled":
      return withSession(state, {
        ...state.session,
        loopRange: {
          ...state.session.loopRange,
          enabled: !state.session.loopRange.enabled,
        },
      });
    case "addTrack": {
      const trackIndex = state.session.tracks.length + 1;
      const trackType = action.trackType;
      const idBase = `${state.session.projectId}-track-${trackType.toLowerCase()}-${trackIndex}`;
      const color = trackType === "Audio" ? "amber" : "cyan";
      const session = {
        ...state.session,
        tracks: [
          ...state.session.tracks,
          {
            id: idBase,
            name: `${trackType} Track ${trackIndex}`,
            type: trackType,
            color,
            muted: false,
            solo: false,
            clips: [
              {
                id: `${idBase}-clip`,
                name: trackType === "Audio" ? "New Audio Clip" : "New MIDI Clip",
                start: 0.5,
                length: 1.5,
                color: trackType === "Audio" ? "sun" : "cyan",
              },
            ],
          },
        ],
      };

      return withSession(state, session);
    }
    case "toggleTrackMute": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId ? { ...track, muted: !track.muted } : track,
        ),
      };

      return withSession(state, session);
    }
    case "toggleTrackSolo": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId ? { ...track, solo: !track.solo } : track,
        ),
      };

      return withSession(state, session);
    }
    case "addComment": {
      const trimmed = action.body.trim();
      if (!trimmed) {
        return state;
      }

      const session = {
        ...state.session,
        comments: [
          {
            id: `${state.session.projectId}-comment-${Math.random().toString(36).slice(2, 7)}`,
            author: "probees1492",
            body: trimmed,
            anchorLabel: `Bar ${state.session.playheadBar}`,
            resolved: false,
          },
          ...state.session.comments,
        ],
      };

      return withSession(state, session);
    }
    case "toggleCommentResolved": {
      const session = {
        ...state.session,
        comments: state.session.comments.map((comment) =>
          comment.id === action.commentId
            ? { ...comment, resolved: !comment.resolved }
            : comment,
        ),
      };

      return withSession(state, session);
    }
    case "undo": {
      const previous = state.history.past.at(-1);
      if (!previous) {
        return state;
      }

      return {
        ...state,
        session: previous,
        selectedClipIds: [],
        saveState: "dirty",
        history: {
          past: state.history.past.slice(0, -1),
          future: [cloneSession(state.session), ...state.history.future],
        },
      };
    }
    case "redo": {
      const [next, ...rest] = state.history.future;
      if (!next) {
        return state;
      }

      return {
        ...state,
        session: next,
        selectedClipIds: [],
        saveState: "dirty",
        history: {
          past: [...state.history.past, cloneSession(state.session)],
          future: rest,
        },
      };
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
    history: {
      past: [],
      future: [],
    },
  });
  const isFirstSync = useRef(true);
  const previousDragState = useRef<DragState | null>(null);

  useEffect(() => {
    if (previousDragState.current && !state.dragState) {
      dispatch({ type: "setSaveState", saveState: "dirty" });
    }

    previousDragState.current = state.dragState;
  }, [state.dragState]);

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

  const selectMultipleClips = useCallback((clipIds: string[]) => {
    dispatch({ type: "selectMultipleClips", clipIds });
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

  const setTransportState = useCallback((transport: TransportState) => {
    dispatch({ type: "setTransportState", transport });
  }, []);

  const toggleLoopEnabled = useCallback(() => {
    dispatch({ type: "toggleLoopEnabled" });
  }, []);

  const addTrack = useCallback((trackType: TrackType) => {
    dispatch({ type: "addTrack", trackType });
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    dispatch({ type: "toggleTrackMute", trackId });
  }, []);

  const toggleTrackSolo = useCallback((trackId: string) => {
    dispatch({ type: "toggleTrackSolo", trackId });
  }, []);

  const addComment = useCallback((body: string) => {
    dispatch({ type: "addComment", body });
  }, []);

  const toggleCommentResolved = useCallback((commentId: string) => {
    dispatch({ type: "toggleCommentResolved", commentId });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "undo" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "redo" });
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
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      selectClip,
      selectMultipleClips,
      clearSelection,
      startDrag,
      stopDrag,
      moveSelectedClips,
      resizeClip,
      deleteSelectedClips,
      duplicateSelectedClips,
      setPlayheadBar,
      setTransportState,
      toggleLoopEnabled,
      addTrack,
      toggleTrackMute,
      toggleTrackSolo,
      addComment,
      toggleCommentResolved,
      undo,
      redo,
      getClipById,
    }),
    [
      addComment,
      addTrack,
      clearSelection,
      deleteSelectedClips,
      duplicateSelectedClips,
      getClipById,
      moveSelectedClips,
      redo,
      resizeClip,
      selectClip,
      selectMultipleClips,
      setPlayheadBar,
      setTransportState,
      startDrag,
      state,
      stopDrag,
      toggleCommentResolved,
      toggleLoopEnabled,
      toggleTrackMute,
      toggleTrackSolo,
      undo,
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
