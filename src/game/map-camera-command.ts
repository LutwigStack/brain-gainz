/**
 * Map camera command union — Epic 36 introduced the original five
 * variants (focus-node, fit-graph, fit-overview, center-layer,
 * reset-camera). Epic 46 added `center-on-point` for the galaxy holo
 * minimap click: a tap on the minimap asks the canvas to center on a
 * specific world point (the inverse of the minimap coordinate
 * transform). The optional `point` field is required for
 * `center-on-point` and ignored by the other variants — the switch
 * in `GameMapCanvas` is exhaustive over `command.type`, so a missing
 * `point` is a hard no-op rather than a silent fallback.
 */
export type MapCameraCommandType =
  | 'focus-node'
  | 'fit-graph'
  | 'fit-overview'
  | 'center-layer'
  | 'reset-camera'
  | 'center-on-point';

export interface MapCameraCommand {
  id: number;
  type: MapCameraCommandType;
  /**
   * World-space point for `center-on-point`. Required when
   * `type === 'center-on-point'`; ignored by every other variant.
   * Lives in the same coordinate system as `scene.centerOnPoint`
   * (i.e. the world coords produced by `skill-atlas-layout.ts` and
   * `create-game-view-model.ts`).
   */
  point?: { x: number; y: number };
}

export const isUnhandledMapCameraCommand = (
  command: MapCameraCommand | null | undefined,
  lastHandledCommandId: number | null,
) => command != null && command.id !== lastHandledCommandId;
