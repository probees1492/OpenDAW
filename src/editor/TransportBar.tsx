import { useEditorState } from "../state/EditorStateProvider";

export function TransportBar() {
  const { session, setTransportState, toggleLoopEnabled } = useEditorState();

  return (
    <section className="transport-bar">
      <div className="transport-controls">
        <button
          className={`transport-button ${session.transport === "playing" ? "active-transport" : ""}`}
          onClick={() => setTransportState("playing")}
        >
          Play
        </button>
        <button
          className={`transport-button ${session.transport === "paused" ? "active-transport" : ""}`}
          onClick={() => setTransportState("paused")}
        >
          Pause
        </button>
        <button
          className={`transport-button ${session.transport === "stopped" ? "active-transport" : ""}`}
          onClick={() => setTransportState("stopped")}
        >
          Stop
        </button>
        <button
          className={`transport-button ${session.loopRange.enabled ? "active-transport" : ""}`}
          onClick={toggleLoopEnabled}
        >
          Loop
        </button>
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
        <div>
          <span className="label">Transport</span>
          <strong>{session.transport}</strong>
        </div>
      </div>
    </section>
  );
}
