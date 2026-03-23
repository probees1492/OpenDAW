import type { EditorState, EditorAction } from "./types";
import { clipReducer, isClipAction } from "./clipSlice";
import { trackReducer, isTrackAction } from "./trackSlice";
import { transportReducer, isTransportAction } from "./transportSlice";
import { commentReducer, isCommentAction } from "./commentSlice";
import { historyReducer, isHistoryAction } from "./historySlice";

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  if (isClipAction(action)) {
    return clipReducer(state, action);
  }

  if (isTrackAction(action)) {
    return trackReducer(state, action);
  }

  if (isTransportAction(action)) {
    return transportReducer(state, action);
  }

  if (isCommentAction(action)) {
    return commentReducer(state, action);
  }

  if (isHistoryAction(action)) {
    return historyReducer(state, action);
  }

  return state;
}

export * from "./types";
export * from "./utils";
