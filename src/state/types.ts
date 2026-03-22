export type AppScreen = "auth" | "dashboard" | "editor";

export type ProjectSummary = {
  id: string;
  name: string;
  owner: string;
  collaborators: string;
  updatedAt: string;
  status: "Draft" | "Review";
  summary: string;
};
