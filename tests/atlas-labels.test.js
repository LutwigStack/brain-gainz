import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAtlasLabelBand, selectAtlasContextLabels } from '../src/game/atlas-labels.ts';

const bounds = (minX, minY, maxX, maxY) => ({
  minX,
  minY,
  maxX,
  maxY,
  width: maxX - minX,
  height: maxY - minY,
  center: { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 },
});

const node = (id, type, x, y, title = `node-${id}`) => ({
  id,
  title,
  subtitle: '',
  state: 'active',
  position: { x, y },
  biomeId: 1,
  atlasNodeType: type,
  atlasSphereTokenKey: 'code',
});

test('atlas context labels exclude atomic and assessment-like leaf nodes', () => {
  const result = selectAtlasContextLabels(
    [
      node(1, 'domain_hub', 0, 0),
      node(2, 'atomic_node', 80, 0),
      node(3, 'practice_node', 120, 0),
      node(4, 'review_node', 160, 0),
      node(5, 'boss_node', 200, 0),
    ],
    [
      { id: 1, fromNodeId: 1, toNodeId: 2, type: 'requires', atlasEdgeRole: 'local_cluster' },
      { id: 2, fromNodeId: 1, toNodeId: 3, type: 'requires', atlasEdgeRole: 'local_cluster' },
      { id: 3, fromNodeId: 1, toNodeId: 4, type: 'requires', atlasEdgeRole: 'local_cluster' },
    ],
    { viewportBounds: bounds(-300, -200, 300, 200) },
  );

  assert.deepEqual(result, [{ nodeId: 1, tier: 'primary', band: 'mid' }]);
});

test('atlas context labels use overview band for root and direct domains', () => {
  const result = selectAtlasContextLabels(
    [
      node(1, 'root', 0, 0),
      node(2, 'domain_hub', 80, 0),
      node(3, 'domain_hub', -80, 0),
      node(4, 'course_hub', 130, 0),
    ],
    [
      { id: 1, fromNodeId: 1, toNodeId: 2, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 2, fromNodeId: 1, toNodeId: 3, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 3, fromNodeId: 2, toNodeId: 4, type: 'requires', atlasEdgeRole: 'structure_branch' },
    ],
    { viewportBounds: bounds(-300, -200, 300, 200), zoom: 0.42 },
  );

  assert.deepEqual(result, [
    { nodeId: 1, tier: 'primary', band: 'overview' },
    { nodeId: 2, tier: 'child', band: 'overview' },
    { nodeId: 3, tier: 'child', band: 'overview' },
  ]);
});

test('atlas context labels use mid band for domains and direct courses', () => {
  const result = selectAtlasContextLabels(
    [
      node(1, 'root', 0, 0),
      node(2, 'domain_hub', 80, 0),
      node(3, 'course_hub', 140, 0),
      node(4, 'topic_node', 190, 0),
    ],
    [
      { id: 1, fromNodeId: 1, toNodeId: 2, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 2, fromNodeId: 2, toNodeId: 3, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 3, fromNodeId: 3, toNodeId: 4, type: 'requires', atlasEdgeRole: 'structure_branch' },
    ],
    { viewportBounds: bounds(-300, -200, 300, 200), zoom: 0.8 },
  );

  assert.deepEqual(result, [
    { nodeId: 1, tier: 'primary', band: 'mid' },
    { nodeId: 2, tier: 'primary', band: 'mid' },
    { nodeId: 3, tier: 'child', band: 'mid' },
  ]);
});

test('atlas context labels use detail band for courses and direct topics', () => {
  const result = selectAtlasContextLabels(
    [
      node(1, 'domain_hub', 0, 0),
      node(2, 'course_hub', 80, 0),
      node(3, 'topic_node', 140, 0),
      node(4, 'atomic_node', 190, 0),
    ],
    [
      { id: 1, fromNodeId: 1, toNodeId: 2, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 2, fromNodeId: 2, toNodeId: 3, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 3, fromNodeId: 3, toNodeId: 4, type: 'requires', atlasEdgeRole: 'local_cluster' },
    ],
    { viewportBounds: bounds(-300, -200, 300, 200), zoom: 1.3 },
  );

  assert.deepEqual(result, [
    { nodeId: 1, tier: 'primary', band: 'detail' },
    { nodeId: 2, tier: 'primary', band: 'detail' },
    { nodeId: 3, tier: 'child', band: 'detail' },
  ]);
});

test('atlas context label band uses hysteresis around zoom thresholds', () => {
  assert.equal(resolveAtlasLabelBand(0.6, 'overview'), 'overview');
  assert.equal(resolveAtlasLabelBand(0.6, 'mid'), 'mid');
  assert.equal(resolveAtlasLabelBand(1.05, 'mid'), 'mid');
  assert.equal(resolveAtlasLabelBand(1.05, 'detail'), 'detail');
});

test('atlas context labels ignore route overlay edges and apply deterministic caps', () => {
  const nodes = [
    node(1, 'domain_hub', 0, 0),
    node(2, 'domain_hub', 40, 0),
    node(3, 'domain_hub', -40, 0),
    node(4, 'course_hub', 90, 0),
    node(5, 'course_hub', -90, 0),
    node(6, 'course_hub', 0, 90),
  ];
  const result = selectAtlasContextLabels(
    nodes,
    [
      { id: 1, fromNodeId: 1, toNodeId: 4, type: 'requires', atlasEdgeRole: 'structure_branch' },
      { id: 2, fromNodeId: 2, toNodeId: 5, type: 'requires', atlasEdgeRole: 'route_overlay' },
      { id: 3, fromNodeId: 3, toNodeId: 6, type: 'requires', atlasEdgeRole: 'structure_branch' },
    ],
    {
      viewportBounds: bounds(-300, -200, 300, 200),
      zoom: 0.8,
    },
  );

  assert.deepEqual(result, [
    { nodeId: 1, tier: 'primary', band: 'mid' },
    { nodeId: 2, tier: 'primary', band: 'mid' },
    { nodeId: 3, tier: 'primary', band: 'mid' },
    { nodeId: 4, tier: 'child', band: 'mid' },
    { nodeId: 5, tier: 'child', band: 'mid' },
    { nodeId: 6, tier: 'child', band: 'mid' },
  ]);
});
