export type MapCameraCommandType = 'focus-node' | 'fit-graph' | 'fit-overview' | 'center-layer' | 'reset-camera';

export interface MapCameraCommand {
  id: number;
  type: MapCameraCommandType;
}

export const isUnhandledMapCameraCommand = (
  command: MapCameraCommand | null | undefined,
  lastHandledCommandId: number | null,
) => command != null && command.id !== lastHandledCommandId;
