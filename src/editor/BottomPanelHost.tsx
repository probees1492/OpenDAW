export function BottomPanelHost() {
  return (
    <section className="bottom-panel">
      <div className="bottom-panel-header">
        <p className="eyebrow">Bottom panel</p>
        <h2>Piano roll / clip detail region</h2>
      </div>
      <div className="piano-roll-grid">
        {Array.from({ length: 6 }, (_, row) => (
          <div key={row} className="piano-roll-row">
            <span className="note-label">C{6 - row}</span>
            <div className="note-cells">
              {Array.from({ length: 12 }, (_, cell) => (
                <span key={cell} className={cell % 3 === 0 ? "active-cell" : ""} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
