import type { EditorState } from "./types";
import type { CommentAction } from "./types";
import { withSession } from "./utils";
import type { CommentThread } from "../types";

export function commentReducer(
  state: EditorState,
  action: CommentAction,
): EditorState {
  switch (action.type) {
    // =======================================================================
    // Legacy: Add Comment (backward compatibility)
    // =======================================================================
    case "addComment": {
      const trimmed = (action as any).body.trim();
      if (!trimmed) {
        return state;
      }

      const commentId = `${state.session.projectId}-comment-${Math.random().toString(36).slice(2, 7)}`;
      const newComment: CommentThread = {
        id: commentId,
        author: "probees1492",
        body: trimmed,
        anchorLabel: `Bar ${state.session.playheadBar}`,
        resolved: false,
      };

      const session = {
        ...state.session,
        comments: [newComment, ...state.session.comments],
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Create Comment
    // =======================================================================
    case "createComment": {
      const commentId = action.tempId ?? `comment-${Date.now().toString(36)}`;
      const newComment: CommentThread = {
        id: commentId,
        ...action.comment,
      };

      const session = {
        ...state.session,
        comments: [newComment, ...state.session.comments],
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Insert Comment (for optimistic updates)
    // =======================================================================
    case "insertComment": {
      const session = {
        ...state.session,
        comments: [action.comment, ...state.session.comments],
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Update Comment
    // =======================================================================
    case "updateComment": {
      const session = {
        ...state.session,
        comments: state.session.comments.map((comment) =>
          comment.id === action.commentId
            ? { ...comment, ...action.updates }
            : comment,
        ),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Toggle Resolved (legacy)
    // =======================================================================
    case "toggleCommentResolved": {
      const commentId = (action as any).commentId;
      const session = {
        ...state.session,
        comments: state.session.comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, resolved: !comment.resolved }
            : comment,
        ),
      };

      return withSession(state, session);
    }

    // =======================================================================
    // Delete Comment
    // =======================================================================
    case "deleteComment": {
      const session = {
        ...state.session,
        comments: state.session.comments.filter(
          (comment) => comment.id !== action.commentId,
        ),
      };

      return withSession(state, session);
    }

    default:
      return state;
  }
}

export function isCommentAction(
  action: { type: string },
): action is CommentAction {
  return [
    "addComment",
    "createComment",
    "insertComment",
    "updateComment",
    "toggleCommentResolved",
    "deleteComment",
  ].includes(action.type);
}
