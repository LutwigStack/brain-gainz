import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getMobileNavigationPriorityClass } from '../src/components/mobile-navigation-priority.ts';

test('mobile navigation marks active primary and secondary items for compact labels', () => {
  assert.equal(
    getMobileNavigationPriorityClass({
      active: true,
      secondary: true,
    }),
    'app-nav-button--mobile-current',
  );
  assert.equal(
    getMobileNavigationPriorityClass({
      active: false,
      secondary: false,
    }),
    'app-nav-button--mobile-primary',
  );
  assert.equal(
    getMobileNavigationPriorityClass({
      active: false,
      secondary: true,
    }),
    'app-nav-button--mobile-secondary',
  );
});
