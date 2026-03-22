export function RightPanelHost() {
  return (
    <aside className="right-panel">
      <section className="panel-card">
        <p className="eyebrow">Comments</p>
        <h2>Review thread</h2>
        <ul className="thread-list">
          <li>
            <strong>probees1492</strong>
            <p>Hook vocal needs a cleaner transition into bar 17.</p>
          </li>
          <li>
            <strong>collaborator</strong>
            <p>Try muting the keys during the pickup to open more space.</p>
          </li>
        </ul>
      </section>

      <section className="panel-card">
        <p className="eyebrow">Session</p>
        <h2>Project status</h2>
        <ul className="detail-list">
          <li>Autosave healthy</li>
          <li>2 open comments</li>
          <li>Export preset: stereo mix</li>
        </ul>
      </section>
    </aside>
  );
}
