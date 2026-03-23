import type { EditorState } from "./types";
import type { TrackAction } from "./types";
import { withSession } from "./utils";

export function trackReducer(
  state: EditorState,
  action: TrackAction,
): EditorState {
  switch (action.type) {
    // =======================================================================
    // Create Track
    // =======================================================================
    case "createTrack":
    case "addTrack": {
      const trackType = action.trackType;
      const trackIndex = state.session.tracks.length + 1;
      const idBase = `${state.session.projectId}-track-${trackType.toLowerCase()}-${Date.now().toString(36)}`;
      const color = trackType === "Audio" ? "amber" : "cyan";

      const newTrack = {
        id: (action as any).tempId ?? idBase,
        name: (action as any).name ?? `${trackType} Track ${trackIndex}`,
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
      };

      const session = {
        ...state.session,
        tracks: [...state.session.tracks, newTrack],
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Insert Track (for optimistic updates)
    // =======================================================================
    case "insertTrack": {
      const index = action.index ?? state.session.tracks.length;
      const tracks = [...state.session.tracks];
      tracks.splice(index, 0, action.track);

      const session = {
        ...state.session,
        tracks,
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Update Track
    // =======================================================================
    case "updateTrack": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId
            ? { ...track, ...action.updates }
            : track,
        ),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Toggle Mute (legacy support)
    // =======================================================================
    case "toggleTrackMute": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId ? { ...track, muted: !track.muted } : track,
        ),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Toggle Solo (legacy support)
    // =======================================================================
    case "toggleTrackSolo": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId ? { ...track, solo: !track.solo } : track,
        ),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Delete Track
    // =======================================================================
    case "deleteTrack": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.filter((track) => track.id !== action.trackId),
      };

      return withSession(state, session, state.selectedClipIds);
    }

    // =======================================================================
    // Reorder Tracks
    // =======================================================================
    case "reorderTracks": {
      const trackMap = new Map(state.session.tracks.map((t) => [t.id, t]));
      const reordered = [];

      for (const id of action.trackIds) {
        const track = trackMap.get(id);
        if (track) {
          reordered.push(track);
          trackMap.delete(id);
        }
      }

      // Add any remaining tracks at the end
      reordered.push(...trackMap.values());

      const session = {
        ...state.session,
        tracks: reordered,
      };

      return withSession(state, session);
    }

    default:
      return state;
  }
}

export function isTrackAction(action: { type: string }): action is TrackAction {
  return [
    "createTrack",
    "addTrack",
    "insertTrack",
    "updateTrack",
    "toggleTrackMute",
    "toggleTrackSolo",
    "deleteTrack",
    "reorderTracks",
  ].includes(action.type);
}
