# OpenDAW Comment System UX Details

## 1. Objective

This document defines the MVP user experience for the OpenDAW comment system. It covers how comments are created, anchored, displayed, navigated, resolved, and managed inside the editor.

The comment system exists to support asynchronous review without breaking the flow of music editing.

## 2. Product Role of Comments

In the MVP, comments should help collaborators:

- point to a precise musical moment
- explain feedback in context
- track whether feedback has been addressed
- review a shared project without needing realtime co-editing

Comments are not a general chat system. They are timeline-anchored review artifacts.

## 3. Design Principles

- Keep comments attached to musical context, not detached discussion threads.
- Make comment location obvious in the timeline.
- Keep creation and resolution lightweight.
- Avoid overwhelming the editing surface with comment UI noise.
- Distinguish open feedback from resolved feedback clearly.

## 4. User Roles and Permissions

### Owner

- can create comments
- can reply to comments
- can resolve and reopen comments
- can delete own comments
- can delete or moderate comments if product policy allows

### Editor

- can create comments
- can reply to comments
- can resolve comments if product policy allows editors to do so
- can edit or delete own comments

### Viewer

- can create comments
- can reply to comments
- can edit or delete own comments within product rules
- cannot change project content

The MVP should prioritize simple, understandable rules over fine-grained moderation complexity.

## 5. Comment Creation Entry Points

The user should be able to create a comment from at least these entry points:

- clicking a comment button in the top bar or contextual UI
- invoking a timeline comment action at the current playhead
- creating a comment from a selected time range
- creating a comment from an existing comment marker cluster area if supported

The MVP should avoid requiring deep menus to leave feedback.

## 6. Anchor Model

Each comment thread should be anchored to one of these forms:

- a single timeline position
- a selected time range

The anchor should store:

- project id
- timeline start position
- optional timeline end position
- optional related track id if a track-specific anchor is supported
- creation timestamp
- author

The initial MVP should not depend on clip ids as the primary anchor because clips may move. The anchor should remain meaningful even if arrangement edits happen later.

## 7. Comment Creation Flow

Recommended flow:

1. User positions playhead or selects a time range.
2. User triggers comment creation.
3. The editor shows a composer in the side panel or bottom panel with anchor summary.
4. The user enters comment text.
5. The user submits the comment.
6. The comment marker appears in the timeline and the thread becomes visible in the panel.

The creation flow should confirm location before submission, but it should not force the user through a heavy modal workflow.

## 8. Composer UX

The composer should show:

- comment input field
- anchor summary such as bar, beat, or time range
- submit action
- cancel action

The composer should support:

- multiline text
- keyboard submit if sensible
- escape to cancel when text is empty or with clear behavior

The MVP does not need mentions, attachments, or emoji reactions.

## 9. Timeline Marker UX

Timeline markers should visually indicate:

- comment presence
- open versus resolved state
- single-thread versus multiple-thread density if clustering is needed

Marker design requirements:

- visible enough to notice during review
- subtle enough not to dominate arrangement editing
- clickable to focus the associated thread

If multiple comments exist near the same time position, the timeline may show a cluster marker rather than overlapping individual markers.

## 10. Comment Panel UX

The primary comment reading experience should happen in a panel rather than floating overlays.

The panel should show:

- thread author names
- timestamps
- anchor summary
- thread messages in order
- reply composer
- resolve or reopen action

The panel should support:

- opening from a timeline marker
- opening from a comments mode or list
- preserving focus on the linked timeline region

## 11. Navigation Behavior

When the user selects a comment thread:

- the timeline should scroll or focus to the anchor if needed
- the anchor region should be visually emphasized
- the thread should open in the comments panel

When the user selects a timeline marker:

- the associated thread should open
- the linked time region should be highlighted
- current editing selection should not be destructively reset unless necessary

Comment navigation should feel connected to the arrangement, not like switching to another tool.

## 12. Resolve and Reopen Flow

Open and resolved comments need clear lifecycle behavior.

### Resolve action

When a comment is resolved:

- the thread remains available in history
- the timeline marker changes to a resolved state
- the thread is visually de-emphasized

### Reopen action

When a resolved comment is reopened:

- it returns to the open comments state
- the timeline marker regains active emphasis

The MVP should default to showing open comments first and reducing clutter from resolved ones.

## 13. Open and Resolved Views

The comment panel should support at least:

- open comments view
- resolved comments view or toggle
- thread detail view

Default behavior:

- open comments are shown by default
- resolved comments are collapsed, filtered, or visually secondary

## 14. Editing and Deletion Rules

The MVP should support simple author-driven editing rules:

- users can edit their own recent comments if product policy allows
- users can delete their own comments if product policy allows
- deleting the first comment of a thread should either delete the thread or be disallowed by a simple product rule

The system should avoid ambiguous partial-thread deletion behavior in MVP.

## 15. Empty States

### No comments yet

The panel should show:

- a short explanation that comments are tied to timeline positions
- a clear action to add the first comment

### No open comments

The panel should show:

- a confirmation that all comments are resolved
- an optional way to reveal resolved comments

## 16. Notification and Awareness

The MVP can keep notifications lightweight.

Useful signals include:

- new comment added
- new reply added
- comment resolved
- comment reopened

Inside the editor, these signals can appear as:

- panel updates
- small non-blocking toasts
- refreshed marker states

The MVP does not require a full notification center.

## 17. Error Handling

Comment UX should handle these errors clearly:

- failed comment submission
- failed reply submission
- permission denied
- anchor no longer available in the exact original context

Expected behavior:

- preserve the draft when submission fails
- explain the error briefly
- allow retry

## 18. Keyboard Behavior

Recommended MVP keyboard rules:

- `Escape` closes a transient comment composer before clearing broader editor state
- `Mod + Enter` submits a comment if focus is inside the composer and text is valid
- comment text fields block global editor shortcuts while focused

The keyboard system should protect writing over shortcut convenience.

## 19. Responsive Behavior

On reduced widths:

- the comment panel should become an overlay or drawer
- timeline markers remain visible in the editor
- thread reading and reply composition should stay usable without hiding the full project context more than necessary

The MVP should still optimize for desktop review and editing.

## 20. Accessibility Requirements

- markers need accessible names indicating comment state and location
- thread items need semantic ordering
- open and resolved state should not rely on color alone
- keyboard users must be able to move from marker to thread and back

## 21. Acceptance Criteria

The comment system UX is acceptable for MVP if:

- a viewer can add a comment tied to a timeline position or range
- an owner can open the thread directly from the timeline marker
- users can reply without losing timeline context
- resolved comments are still accessible without cluttering the main view
- failed submissions preserve the comment draft

## 22. Open Questions

- Should editors be allowed to resolve comments, or should that be owner-only in MVP?
- Should comment anchors support track association in MVP or only time positions and ranges?
- Should resolved comments stay visible in the timeline by default or only when a filter is enabled?
- Should guest review links exist later, and if so, how should comment permissions differ?
