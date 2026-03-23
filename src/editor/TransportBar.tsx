import { useCallback } from "react";
import { useEditorState } from "../state/EditorStateProvider";
import { useAudioEngineContext } from "../audio/AudioEngineContext";
import { ZoomSlider } from "./ZoomSlider";

export function TransportBar() {
  const { session, toggleLoopEnabled } = useEditorState();
  const {
    isInitialized,
    isInitializing,
    initialize,
    play,
    pause,
    stop,
  } = useAudioEngineContext();

  const handlePlay = useCallback(async () => {
    if (!isInitialized && !isInitializing) {
      await initialize();
    }
    play();
  }, [isInitialized, isInitializing, initialize, play]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  return (
    <section className="transport-bar">
      <div className="transport-controls">
        <button
          className={`transport-button ${
            session.transport === "playing" ? "active-transport" : ""
          }`}
          onClick={handlePlay}
          disabled={isInitializing}
        >
          {isInitializing ? "..." : "Play"}
        </button>
        <button
          className={`transport-button ${
            session.transport === "paused" ? "active-transport" : ""
          }`}
          onClick={handlePause}
        >
          Pause
        </button>
        <button
          className={`transport-button ${
            session.transport === "stopped" ? "active-transport" : ""
          }`}
          onClick={handleStop}
        >
          Stop
        </button>
        <button
          className={`transport-button ${
            session.loopRange.enabled ? "active-transport" : ""
          }`}
          onClick={toggleLoopEnabled}
        >
          Loop
        </button>
      </div>

      <ZoomSlider />

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
