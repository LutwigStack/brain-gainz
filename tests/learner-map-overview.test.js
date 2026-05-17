import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldAutoDisableRouteFilter } from '../src/application/learner-map-overview.ts';

test('learner route overview keeps route intent while route nodes load asynchronously', () => {
  assert.equal(
    shouldAutoDisableRouteFilter({
      canUseAuthorTools: false,
      isRouteFilterEnabled: true,
      routeNodeCount: 0,
    }),
    false,
  );
});

test('author map controls still drop empty route filters', () => {
  assert.equal(
    shouldAutoDisableRouteFilter({
      canUseAuthorTools: true,
      isRouteFilterEnabled: true,
      routeNodeCount: 0,
    }),
    true,
  );
  assert.equal(
    shouldAutoDisableRouteFilter({
      canUseAuthorTools: true,
      isRouteFilterEnabled: true,
      routeNodeCount: 2,
    }),
    false,
  );
});
