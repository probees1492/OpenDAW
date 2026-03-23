import { memo, useCallback } from "react";
import type { ProjectSession, TransportState } from "../state/types";
import { AudioEngineProvider } from "./AudioEngineContext";
import { ZoomProvider } from "../editor/ZoomContext";
import { ScrollSyncProvider } from "../editor/ScrollSyncContext";
import { TransportBar } from "../editor/TransportBar";
import { EditorWorkspace } from "../editor/EditorWorkspace";
import { BottomPanelHost } from "../editor/BottomPanelHost";

type AudioEngineConnectorProps = {
  session: ProjectSession;
  onPlayheadChange: (bar: number) => void;
  onTransportChange: (state: TransportState) => void;
};

export const AudioEngineConnector = memo(function AudioEngineConnector({
  session,
  onPlayheadChange,
  onTransportChange,
}: AudioEngineConnectorProps) {
  const handlePlayheadChange = useCallback(
    (bar: number) => {
      onPlayheadChange(Math.floor(bar * 10) / 10);
    },
    [onPlayheadChange],
  );

  return (
    <AudioEngineProvider
      session={session}
      onPlayheadChange={handlePlayheadChange}
      onTransportChange={onTransportChange}
    >
      <ZoomProvider>
        <TransportBar />
        <ScrollSyncProvider>
          <EditorWorkspace />
        </ScrollSyncProvider>
      </ZoomProvider>
      <BottomPanelHost />
    </AudioEngineProvider>
  );
});
