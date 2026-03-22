import { Link, useNavigate } from "react-router-dom";

export function AuthShell() {
  const navigate = useNavigate();

  return (
    <main className="screen auth-screen">
      <section className="auth-panel">
        <p className="eyebrow">OpenDAW</p>
        <h1>Music creation without heavy setup.</h1>
        <p className="muted">
          Browser-first sessions, timeline review, and a path toward collaborative
          production.
        </p>

        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="probees1492@gmail.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/")}
          >
            Enter OpenDAW
          </button>
        </form>

        <p className="muted auth-footer">
          Prototype auth only. <Link to="/">Return to dashboard</Link>
        </p>
      </section>
    </main>
  );
}
