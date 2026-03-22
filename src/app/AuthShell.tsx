type AuthShellProps = {
  onContinue: () => void;
};

export function AuthShell({ onContinue }: AuthShellProps) {
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
          <button type="button" className="primary-button" onClick={onContinue}>
            Enter OpenDAW
          </button>
        </form>
      </section>
    </main>
  );
}
