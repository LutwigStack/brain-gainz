import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGraphEdgeCreatePayload } from '../src/application/map-edge-payloads.ts';

test('graph edge payload preserves directed source-target mapping for map connect flow', () => {
  const payload = buildGraphEdgeCreatePayload({
    sourceNodeId: 11,
    targetNodeId: 27,
    edgeType: 'requires',
    createdAt: '2026-04-24T20:15:10.000Z',
  });

  assert.deepEqual(payload, {
    blocked_node_id: 11,
    blocking_node_id: 27,
    dependency_type: 'requires',
    created_at: '2026-04-24T20:15:10.000Z',
  });
});
