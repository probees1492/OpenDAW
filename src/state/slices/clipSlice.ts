import type { EditorState } from "./types";
import type { ClipAction } from "./types";
import { withSession } from "./utils";
import type { Clip } from "../types";

export function clipReducer(
  state: EditorState,
  action: ClipAction,
): EditorState {
  switch (action.type) {
    // =======================================================================
    // Selection
    // =======================================================================
    case "selectClip": {
      const selectedClipIds = action.additive
        ? state.selectedClipIds.includes(action.clipId)
          ? state.selectedClipIds.filter((id) => id !== action.clipId)
          : [...state.selectedClipIds, action.clipId]
        : [action.clipId];

      return { ...state, selectedClipIds };
    }

    case "selectMultipleClips":
      return { ...state, selectedClipIds: action.clipIds };

    case "clearSelection":
      return { ...state, selectedClipIds: [] };

    // =======================================================================
    // Drag
    // =======================================================================
    case "startDrag":
      return { ...state, dragState: action.dragState };

    case "stopDrag":
      return { ...state, dragState: null };

    // =======================================================================
    // Create Clip
    // =======================================================================
    case "createClip": {
      const clipId = action.tempId ?? `clip-${Date.now().toString(36)}`;
      const newClip: Clip = {
        id: clipId,
        ...action.clip,
      };

      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId
            ? { ...track, clips: [...track.clips, newClip] }
            : track,
        ),
      };

      return withSession(state, session, [clipId]);
    }

    case "insertClip": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) =>
          track.id === action.trackId
            ? { ...track, clips: [...track.clips, action.clip] }
            : track,
        ),
      };

      return withSession(state, session, [action.clip.id]);
    }

    // =======================================================================
    // Update Clip
    // =======================================================================
    case "updateClip": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) =>
            clip.id === action.clipId
              ? { ...clip, ...action.updates }
              : clip,
          ),
        })),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Move Selected Clips
    // =======================================================================
    case "moveSelectedClips": {
      const initialPositions = state.dragState?.initialPositions ?? [];
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.map((clip) => {
            const initial = initialPositions.find(
              (item) => item.clipId === clip.id,
            );
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

    // =======================================================================
    // Resize Clip
    // =======================================================================
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

    // =======================================================================
    // Delete Selected Clips
    // =======================================================================
    case "deleteSelectedClips": {
      if (state.selectedClipIds.length === 0) {
        return state;
      }

      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter(
            (clip) => !state.selectedClipIds.includes(clip.id),
          ),
        })),
      };

      return withSession(state, session, []);
    }

    // =======================================================================
    // Delete Single Clip
    // =======================================================================
    case "deleteClip": {
      const session = {
        ...state.session,
        tracks: state.session.tracks.map((track) => ({
          ...track,
          clips: track.clips.filter((clip) => clip.id !== action.clipId),
        })),
      };

      const selectedClipIds = state.selectedClipIds.filter(
        (id) => id !== action.clipId,
      );

      return withSession(state, session, selectedClipIds);
    }

    // =======================================================================
    // Duplicate Selected Clips
    // =======================================================================
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

    default:
      return state;
  }
}

export function isClipAction(action: { type: string }): action is ClipAction {
  return [
    "selectClip",
    "selectMultipleClips",
    "clearSelection",
    "startDrag",
    "stopDrag",
    "createClip",
    "insertClip",
    "updateClip",
    "moveSelectedClips",
    "resizeClip",
    "deleteSelectedClips",
    "deleteClip",
    "duplicateSelectedClips",
  ].includes(action.type);
}
