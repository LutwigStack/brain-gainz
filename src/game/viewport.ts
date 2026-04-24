import type { GameBounds, GamePoint } from './types';

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportCamera {
  x: number;
  y: number;
  zoom: number;
}

export type ViewportWorldBounds = GameBounds;

export const MIN_ZOOM = 0.42;
export const MAX_ZOOM = 2.4;
export const DEFAULT_ZOOM = 1;
export const FIT_PADDING = 84;

export const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));

export const worldToScreen = (
  point: GamePoint,
  camera: ViewportCamera,
): GamePoint => ({
  x: point.x * camera.zoom + camera.x,
  y: point.y * camera.zoom + camera.y,
});

export const screenToWorld = (
  point: GamePoint,
  camera: ViewportCamera,
): GamePoint => ({
  x: (point.x - camera.x) / camera.zoom,
  y: (point.y - camera.y) / camera.zoom,
});

export const panCameraByScreenDelta = (
  camera: ViewportCamera,
  delta: GamePoint,
): ViewportCamera => ({
  ...camera,
  x: camera.x + delta.x,
  y: camera.y + delta.y,
});

export const zoomCameraAtScreenPoint = (
  camera: ViewportCamera,
  screenPoint: GamePoint,
  zoomDelta: number,
): ViewportCamera => {
  const nextZoom = clampZoom(camera.zoom * zoomDelta);
  if (nextZoom === camera.zoom) {
    return camera;
  }

  const worldPoint = screenToWorld(screenPoint, camera);
  return {
    zoom: nextZoom,
    x: screenPoint.x - worldPoint.x * nextZoom,
    y: screenPoint.y - worldPoint.y * nextZoom,
  };
};

export const centerCameraOnPoint = (
  point: GamePoint,
  size: ViewportSize,
  zoom = DEFAULT_ZOOM,
  options?: { clamp?: boolean },
): ViewportCamera => ({
  zoom: options?.clamp === false ? zoom : clampZoom(zoom),
  x: size.width / 2 - point.x * (options?.clamp === false ? zoom : clampZoom(zoom)),
  y: size.height / 2 - point.y * (options?.clamp === false ? zoom : clampZoom(zoom)),
});

export const fitCameraToBounds = (
  bounds: GameBounds,
  size: ViewportSize,
  padding = FIT_PADDING,
): ViewportCamera => {
  const availableWidth = Math.max(1, size.width - padding * 2);
  const availableHeight = Math.max(1, size.height - padding * 2);
  const fittedZoom = Math.min(
    MAX_ZOOM,
    Math.min(availableWidth / Math.max(bounds.width, 1), availableHeight / Math.max(bounds.height, 1)),
  );

  return {
    zoom: fittedZoom,
    x: size.width / 2 - bounds.center.x * fittedZoom,
    y: size.height / 2 - bounds.center.y * fittedZoom,
  };
};

export const getViewportWorldBounds = (
  camera: ViewportCamera,
  size: ViewportSize,
): ViewportWorldBounds => {
  const minX = (0 - camera.x) / camera.zoom;
  const minY = (0 - camera.y) / camera.zoom;
  const maxX = (size.width - camera.x) / camera.zoom;
  const maxY = (size.height - camera.y) / camera.zoom;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
    center: {
      x: minX + (maxX - minX) / 2,
      y: minY + (maxY - minY) / 2,
    },
  };
};
