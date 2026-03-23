import type { EditorState } from "./types";
import type { TransportAction } from "./types";
import { withSession } from "./utils";

export function transportReducer(
  state: EditorState,
  action: TransportAction,
): EditorState {
  switch (action.type) {
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

    default:
      return state;
  }
}

export function isTransportAction(
  action: { type: string },
): action is TransportAction {
  return ["setPlayheadBar", "setTransportState", "toggleLoopEnabled"].includes(
    action.type,
  );
}
