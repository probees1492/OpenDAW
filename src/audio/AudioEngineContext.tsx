import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { AudioEngineActor } from "./AudioEngineActor";
import type { ProjectSession } from "../state/types";
import type { TransportState } from "../state/types";

interface AudioEngineContextValue {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (bar: number) => void;
  getCurrentBar: () => number;
  setMasterVolume: (volume: number) => void;
  /** Subscribe to high-frequency playhead updates (for animation) */
  subscribeToPlayhead: (callback: (bar: number) => void) => () => void;
}

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null);

export function AudioEngineProvider({
  children,
  session,
  onPlayheadChange,
  onTransportChange,
}: PropsWithChildren<{
  session: ProjectSession;
  onPlayheadChange?: (bar: number) => void;
  onTransportChange?: (state: TransportState) => void;
}>) {
  const engineRef = useRef<AudioEngineActor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Subscribers for high-frequency playhead updates
  const playheadSubscribersRef = useRef<Set<(bar: number) => void>>(new Set());

  // Create engine instance on mount
  useEffect(() => {
    engineRef.current = new AudioEngineActor();

    return () => {
      if (engineRef.current) {
        engineRef.current.send({ type: "DISPOSE" });
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  // Set up callbacks with subscriber notification
  useEffect(() => {
    if (!engineRef.current) return;

    engineRef.current.send({
      type: "SET_ON_PLAYHEAD_CHANGE",
      callback: (bar: number) => {
        // Notify high-frequency subscribers (for animation)
        playheadSubscribersRef.current.forEach((callback) => callback(bar));

        // Also call the original callback (for React state updates)
        if (onPlayheadChange) {
          onPlayheadChange(bar);
        }
      },
    });

    engineRef.current.send({
      type: "SET_ON_TRANSPORT_CHANGE",
      callback: onTransportChange ?? null,
    });

    return () => {
      if (engineRef.current) {
        engineRef.current.send({
          type: "SET_ON_PLAYHEAD_CHANGE",
          callback: null,
        });
        engineRef.current.send({
          type: "SET_ON_TRANSPORT_CHANGE",
          callback: null,
        });
      }
    };
  }, [onPlayheadChange, onTransportChange]);

  // Sync session changes to engine
  useEffect(() => {
    if (engineRef.current && isInitialized) {
      engineRef.current.send({ type: "UPDATE_SESSION", session });
    }
  }, [session, isInitialized]);

  const initialize = useCallback(async () => {
    if (!engineRef.current || isInitialized || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        engineRef.current!.send({
          type: "INITIALIZE",
          respondTo: (success) => {
            if (success) {
              resolve();
            } else {
              reject(new Error("Failed to initialize audio engine"));
            }
          },
        });
      });

      engineRef.current.send({ type: "UPDATE_SESSION", session });
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsInitializing(false);
    }
  }, [session, isInitialized, isInitializing]);

  const play = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.send({ type: "PLAY" });
    }
  }, []);

  const pause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.send({ type: "PAUSE" });
    }
  }, []);

  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.send({ type: "STOP" });
    }
  }, []);

  const seek = useCallback((bar: number) => {
    if (engineRef.current) {
      engineRef.current.send({ type: "SEEK", bar });
    }
  }, []);

  const getCurrentBar = useCallback(() => {
    return engineRef.current?.getCurrentBarSync() ?? 1;
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    if (engineRef.current) {
      engineRef.current.send({ type: "SET_MASTER_VOLUME", volume });
    }
  }, []);

  const subscribeToPlayhead = useCallback((callback: (bar: number) => void) => {
    playheadSubscribersRef.current.add(callback);
    return () => {
      playheadSubscribersRef.current.delete(callback);
    };
  }, []);

  const value: AudioEngineContextValue = {
    isInitialized,
    isInitializing,
    error,
    initialize,
    play,
    pause,
    stop,
    seek,
    getCurrentBar,
    setMasterVolume,
    subscribeToPlayhead,
  };

  return (
    <AudioEngineContext.Provider value={value}>
      {children}
    </AudioEngineContext.Provider>
  );
}

export function useAudioEngineContext(): AudioEngineContextValue {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error("useAudioEngineContext must be used within AudioEngineProvider");
  }
  return context;
}
