import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildDefaultMapNodeTitle,
  buildMapNodeCreatePayload,
} from '../src/application/map-node-payloads.ts';

test('map node payload uses deterministic default title policy', () => {
  assert.equal(buildDefaultMapNodeTitle(0), 'Новый узел 1');
  assert.equal(buildDefaultMapNodeTitle(3), 'Новый узел 4');
});

test('map node payload builds persisted create contract from skill context and world position', () => {
  const payload = buildMapNodeCreatePayload({
    skillId: 42,
    existingNodeCount: 3,
    position: { x: 118.6, y: -44.3 },
    createdAt: '2026-04-24T12:34:56.789Z',
    nonce: 'seed1234',
  });

  assert.equal(payload.skill_id, 42);
  assert.equal(payload.title, 'Новый узел 4');
  assert.equal(payload.slug, 'node-42-4-20260424123456789-seed1234');
  assert.equal(payload.type, 'task');
  assert.equal(payload.status, 'active');
  assert.equal(payload.x, 119);
  assert.equal(payload.y, -44);
});
