import type { EditorState, HistoryState } from "./types";
import type { ProjectSession } from "../types";

export function cloneSession(session: ProjectSession): ProjectSession {
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

export function pushHistory(state: EditorState): HistoryState {
  return {
    past: [...state.history.past, cloneSession(state.session)],
    future: [],
  };
}

export function withSession(
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
