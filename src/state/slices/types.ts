import type { ProjectSession, TrackType, TransportState, Track, Clip, CommentThread } from "../types";

// ============================================================================
// Drag State
// ============================================================================

export type DragMode = "move" | "resize-start" | "resize-end";

export type DragState = {
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

// ============================================================================
// History State
// ============================================================================

export type HistoryState = {
  past: ProjectSession[];
  future: ProjectSession[];
};

// ============================================================================
// Editor State
// ============================================================================

export type EditorState = {
  session: ProjectSession;
  selectedClipIds: string[];
  dragState: DragState | null;
  saveState: "saved" | "dirty" | "saving";
  history: HistoryState;
};

// ============================================================================
// Clip Actions
// ============================================================================

export type ClipAction =
  // Selection
  | { type: "selectClip"; clipId: string; additive?: boolean }
  | { type: "selectMultipleClips"; clipIds: string[] }
  | { type: "clearSelection" }
  // Drag
  | { type: "startDrag"; dragState: DragState }
  | { type: "stopDrag" }
  // CRUD
  | { type: "createClip"; trackId: string; clip: Omit<Clip, "id">; tempId?: string }
  | { type: "insertClip"; trackId: string; clip: Clip }
  | { type: "updateClip"; clipId: string; updates: Partial<Clip> }
  | { type: "moveSelectedClips"; delta: number }
  | { type: "resizeClip"; clipId: string; start: number; length: number }
  | { type: "deleteSelectedClips" }
  | { type: "deleteClip"; clipId: string }
  | { type: "duplicateSelectedClips" };

// ============================================================================
// Track Actions
// ============================================================================

export type TrackAction =
  // CRUD
  | { type: "createTrack"; trackType: TrackType; name?: string; tempId?: string }
  | { type: "insertTrack"; track: Track; index?: number }
  | { type: "updateTrack"; trackId: string; updates: Partial<Track> }
  | { type: "deleteTrack"; trackId: string }
  | { type: "reorderTracks"; trackIds: string[] }
  // Legacy
  | { type: "addTrack"; trackType: TrackType }
  | { type: "toggleTrackMute"; trackId: string }
  | { type: "toggleTrackSolo"; trackId: string };

// ============================================================================
// Transport Actions
// ============================================================================

export type TransportAction =
  | { type: "setPlayheadBar"; bar: number }
  | { type: "setTransportState"; transport: TransportState }
  | { type: "toggleLoopEnabled" }
  | { type: "setLoopRange"; start: number; end: number };

// ============================================================================
// Comment Actions
// ============================================================================

export type CommentAction =
  | { type: "createComment"; comment: Omit<CommentThread, "id">; tempId?: string }
  | { type: "insertComment"; comment: CommentThread }
  | { type: "updateComment"; commentId: string; updates: Partial<CommentThread> }
  | { type: "deleteComment"; commentId: string }
  // Legacy
  | { type: "addComment"; body: string }
  | { type: "toggleCommentResolved"; commentId: string };

// ============================================================================
// History Actions
// ============================================================================

export type HistoryAction =
  | { type: "undo" }
  | { type: "redo" }
  | { type: "setSaveState"; saveState: EditorState["saveState"] };

// ============================================================================
// Combined Action Type
// ============================================================================

export type EditorAction =
  | ClipAction
  | TrackAction
  | TransportAction
  | CommentAction
  | HistoryAction;
