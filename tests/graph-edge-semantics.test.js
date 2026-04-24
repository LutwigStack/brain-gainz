import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getGraphEdgeDirectionalCopy,
  getGraphEdgeLineTitle,
  getGraphEdgeSemantics,
  graphEdgeTypeOrder,
} from '../src/application/graph-edge-semantics.ts';

test('graph edge semantics matrix stays ordered and complete for all supported edge types', () => {
  assert.deepEqual(graphEdgeTypeOrder, ['requires', 'supports', 'relates_to']);

  for (const type of graphEdgeTypeOrder) {
    const semantics = getGraphEdgeSemantics(type);
    assert.equal(semantics.type, type);
    assert.ok(semantics.label.length > 0);
    assert.ok(semantics.arrowMeaning.length > 0);
    assert.ok(semantics.railSummary.length > 0);
  }
});

test('graph edge directional copy preserves the intended meaning for incoming and outgoing requires', () => {
  assert.equal(
    getGraphEdgeDirectionalCopy('requires', 'outgoing'),
    'Этот узел зависит от цели',
  );
  assert.equal(
    getGraphEdgeDirectionalCopy('requires', 'incoming'),
    'Этот узел нужен источнику',
  );
});

test('graph edge line titles stay consistent between outgoing and incoming rail groups', () => {
  assert.equal(
    getGraphEdgeLineTitle('supports', 'outgoing', 'Подготовка релиза'),
    'Поддерживает → Подготовка релиза',
  );
  assert.equal(
    getGraphEdgeLineTitle('relates_to', 'incoming', 'Исследование рынка'),
    'Исследование рынка → Связано',
  );
});

test('relates_to stays associative for users even though the stored edge is directed', () => {
  const semantics = getGraphEdgeSemantics('relates_to');

  assert.equal(semantics.userReading, 'associative');
  assert.match(semantics.arrowMeaning, /ассоциатив/i);
});
