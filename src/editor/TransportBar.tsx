const transportButtons = ["Play", "Pause", "Stop", "Loop"];

export function TransportBar() {
  return (
    <section className="transport-bar">
      <div className="transport-controls">
        {transportButtons.map((label) => (
          <button key={label} className="transport-button">
            {label}
          </button>
        ))}
      </div>

      <div className="transport-readouts">
        <div>
          <span className="label">Tempo</span>
          <strong>128 BPM</strong>
        </div>
        <div>
          <span className="label">Signature</span>
          <strong>4/4</strong>
        </div>
        <div>
          <span className="label">Playhead</span>
          <strong>17.2.120</strong>
        </div>
      </div>
    </section>
  );
}
