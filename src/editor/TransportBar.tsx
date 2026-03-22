import { useEditorState } from "../state/EditorStateProvider";

const transportButtons = ["Play", "Pause", "Stop", "Loop"];

export function TransportBar() {
  const { session } = useEditorState();

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
          <strong>{session.tempo} BPM</strong>
        </div>
        <div>
          <span className="label">Signature</span>
          <strong>{session.timeSignature}</strong>
        </div>
        <div>
          <span className="label">Playhead</span>
          <strong>{session.playhead}</strong>
        </div>
      </div>
    </section>
  );
}
