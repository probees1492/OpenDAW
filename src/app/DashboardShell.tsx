import { useNavigate } from "react-router-dom";
import type { ProjectSummary } from "../state/types";

type DashboardShellProps = {
  projects: ProjectSummary[];
};

export function DashboardShell({ projects }: DashboardShellProps) {
  const navigate = useNavigate();

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
          <button className="primary-button">New project</button>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="hero-kicker">Web-first DAW MVP</p>
          <h2>From blank project to shared song draft.</h2>
          <p className="muted">
            This scaffold maps the documentation into a runnable dashboard and
            editor shell. It is the starting point for the real product build.
          </p>
        </div>
        <div className="hero-metrics">
          <article>
            <span>Scope</span>
            <strong>Dashboard</strong>
          </article>
          <article>
            <span>Editor</span>
            <strong>Timeline shell</strong>
          </article>
          <article>
            <span>Mode</span>
            <strong>Prototype</strong>
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
