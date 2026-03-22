export type ProjectStatus = "Draft" | "Review";
export type TrackType = "Audio" | "MIDI";
export type TransportState = "stopped" | "playing" | "paused";

export type ProjectSummary = {
  id: string;
  name: string;
  owner: string;
  collaborators: string;
  updatedAt: string;
  status: ProjectStatus;
  summary: string;
};

export type Clip = {
  id: string;
  name: string;
  start: number;
  length: number;
  color: string;
};

export type Track = {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  muted: boolean;
  solo: boolean;
  clips: Clip[];
};

export type CommentThread = {
  id: string;
  author: string;
  body: string;
  anchorLabel: string;
  resolved: boolean;
};

export type ProjectSession = {
  projectId: string;
  tempo: number;
  timeSignature: string;
  playhead: string;
  playheadBar: number;
  transport: TransportState;
  loopRange: {
    start: number;
    end: number;
    enabled: boolean;
  };
  tracks: Track[];
  comments: CommentThread[];
};
