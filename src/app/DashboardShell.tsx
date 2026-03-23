import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateProvider";
import type { ProjectSummary } from "../state/types";

type DashboardShellProps = {
  projects: ProjectSummary[];
};

export function DashboardShell({ projects }: DashboardShellProps) {
  const navigate = useNavigate();
  const { createProject } = useAppState();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const projectId = await createProject();
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="screen dashboard-screen">
      <header className="dashboard-topbar">
        <div>
          <p className="eyebrow">OpenDAW</p>
          <h1>Project dashboard</h1>
        </div>
        <div className="topbar-actions">
          <button className="secondary-button" onClick={() => navigate("/auth")}>
            Auth preview
          </button>
          <button
            className="primary-button"
            onClick={handleCreateProject}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "New project"}
          </button>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="hero-kicker">Web-first DAW MVP</p>
          <h2>From blank project to shareable song draft.</h2>
          <p className="muted">
            The app now supports URL-based navigation, local autosave, project
            creation, and timeline clip editing directly inside the browser.
          </p>
        </div>
        <div className="hero-metrics">
          <article>
            <span>Scope</span>
            <strong>Live routes</strong>
          </article>
          <article>
            <span>Editor</span>
            <strong>Interactive timeline</strong>
          </article>
          <article>
            <span>Mode</span>
            <strong>Autosave local</strong>
          </article>
        </div>
      </section>

      <section className="project-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className="project-card-header">
              <span className={`status-pill ${project.status.toLowerCase()}`}>
                {project.status}
              </span>
              <span className="muted">{project.updatedAt}</span>
            </div>
            <h3>{project.name}</h3>
            <p className="muted">{project.summary}</p>
            <dl className="project-meta">
              <div>
                <dt>Owner</dt>
                <dd>{project.owner}</dd>
              </div>
              <div>
                <dt>Collaborators</dt>
                <dd>{project.collaborators}</dd>
              </div>
            </dl>
            <button
              className="primary-button"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              Open editor
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
