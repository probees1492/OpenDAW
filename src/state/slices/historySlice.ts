import type { EditorState } from "./types";
import type { HistoryAction } from "./types";
import { cloneSession } from "./utils";

export function historyReducer(
  state: EditorState,
  action: HistoryAction,
): EditorState {
  switch (action.type) {
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

export function isHistoryAction(
  action: { type: string },
): action is HistoryAction {
  return ["undo", "redo", "setSaveState"].includes(action.type);
}
