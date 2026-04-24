import test from 'node:test';
import assert from 'node:assert/strict';

import {
  centerCameraOnPoint,
  fitCameraToBounds,
  getViewportWorldBounds,
  panCameraByScreenDelta,
  screenToWorld,
  worldToScreen,
  zoomCameraAtScreenPoint,
} from '../src/game/viewport.ts';

test('screen/world conversion stays reversible for the same camera', () => {
  const camera = { x: 320, y: 180, zoom: 1.5 };
  const worldPoint = { x: 40, y: -25 };
  const screenPoint = worldToScreen(worldPoint, camera);

  assert.deepEqual(screenToWorld(screenPoint, camera), worldPoint);
});

test('zoom anchored at cursor keeps the same world point under the pointer', () => {
  const camera = { x: 300, y: 200, zoom: 1 };
  const screenPoint = { x: 640, y: 360 };
  const worldPointBefore = screenToWorld(screenPoint, camera);
  const zoomedCamera = zoomCameraAtScreenPoint(camera, screenPoint, 1.2);
  const worldPointAfter = screenToWorld(screenPoint, zoomedCamera);

  assert.deepEqual(worldPointAfter, worldPointBefore);
  assert.ok(zoomedCamera.zoom > camera.zoom);
});

test('fit camera centers graph bounds inside viewport', () => {
  const bounds = {
    minX: -200,
    minY: -120,
    maxX: 220,
    maxY: 180,
    width: 420,
    height: 300,
    center: { x: 10, y: 30 },
  };

  const camera = fitCameraToBounds(bounds, { width: 1280, height: 720 });
  const centered = worldToScreen(bounds.center, camera);

  assert.equal(Math.round(centered.x), 640);
  assert.equal(Math.round(centered.y), 360);
  assert.ok(camera.zoom > 0);
});

test('fit camera may zoom below interactive minimum to keep very large graphs in frame', () => {
  const bounds = {
    minX: -4000,
    minY: -3000,
    maxX: 4200,
    maxY: 3100,
    width: 8200,
    height: 6100,
    center: { x: 100, y: 50 },
  };

  const camera = fitCameraToBounds(bounds, { width: 1280, height: 720 });

  assert.ok(camera.zoom < 0.42);
});

test('camera pan and reset helpers preserve expected center math', () => {
  const centered = centerCameraOnPoint({ x: 100, y: 40 }, { width: 1000, height: 800 }, 1);
  const panned = panCameraByScreenDelta(centered, { x: -120, y: 45 });

  assert.deepEqual(worldToScreen({ x: 100, y: 40 }, centered), { x: 500, y: 400 });
  assert.deepEqual(worldToScreen({ x: 100, y: 40 }, panned), { x: 380, y: 445 });
});

test('centerCameraOnPoint can preserve fitted overview zoom when clamp is disabled', () => {
  const centered = centerCameraOnPoint({ x: 100, y: 40 }, { width: 1000, height: 800 }, 0.18, {
    clamp: false,
  });

  assert.equal(centered.zoom, 0.18);
  assert.deepEqual(worldToScreen({ x: 100, y: 40 }, centered), { x: 500, y: 400 });
});

test('viewport world bounds resolve the visible world rect for the current camera', () => {
  const camera = { x: 320, y: 180, zoom: 2 };
  const bounds = getViewportWorldBounds(camera, { width: 1280, height: 720 });

  assert.deepEqual(bounds, {
    minX: -160,
    minY: -90,
    maxX: 480,
    maxY: 270,
    width: 640,
    height: 360,
    center: { x: 160, y: 90 },
  });
});
