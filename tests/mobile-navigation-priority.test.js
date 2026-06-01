import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getMobileNavigationPriorityClass,
  getMobileNavigationSections,
} from '../src/components/mobile-navigation-priority.ts';

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

test('mobile navigation keeps one primary row plus overflow', () => {
  const sections = getMobileNavigationSections([
    { key: 'campaigns', active: false, secondary: true },
    { key: 'today', active: false, mobilePrimary: true },
    { key: 'map', active: true, mobilePrimary: true },
    { key: 'assessment', active: false, mobilePrimary: true },
    { key: 'wind', active: false, secondary: true },
    { key: 'settings', active: false, secondary: true },
  ]);

  assert.deepEqual(
    sections.primaryItems.map((item) => item.key),
    ['map', 'today', 'assessment'],
  );
  assert.deepEqual(
    sections.overflowItems.map((item) => item.key),
    ['campaigns', 'wind', 'settings'],
  );
});

test('mobile navigation promotes active overflow destinations', () => {
  const sections = getMobileNavigationSections([
    { key: 'today', active: false, mobilePrimary: true },
    { key: 'map', active: false, mobilePrimary: true },
    { key: 'assessment', active: false, mobilePrimary: true },
    { key: 'wind', active: true, secondary: true },
    { key: 'settings', active: false, secondary: true },
  ]);

  assert.deepEqual(
    sections.primaryItems.map((item) => item.key),
    ['wind', 'today', 'map', 'assessment'],
  );
  assert.deepEqual(
    sections.overflowItems.map((item) => item.key),
    ['settings'],
  );
});
