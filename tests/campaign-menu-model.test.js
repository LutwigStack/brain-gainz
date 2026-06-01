import assert from 'node:assert/strict';
import test from 'node:test';

import { splitTemplateCampaignsForMenu } from '../src/components/campaign-menu-model.ts';

const template = {
  id: 10,
  type: 'template',
  slug: 'template-cs-bachelor',
  name: 'Бакалавриат по информатике',
  is_archived: 0,
};

const personalCopy = {
  id: 20,
  type: 'user',
  slug: 'cs-bachelor-personal',
  name: 'Бакалавриат по информатике',
  source_template_id: template.id,
  is_archived: 0,
};

test('ready courses hide a template when an active personal copy exists', () => {
  const result = splitTemplateCampaignsForMenu({
    templates: [template],
    activeUserCampaigns: [personalCopy],
    archivedCampaigns: [],
  });

  assert.deepEqual(result.availableTemplates, []);
  assert.deepEqual(result.archivedTemplateCopies, []);
});

test('ready courses offer restore instead of start when only archived personal copy exists', () => {
  const archivedCopy = { ...personalCopy, is_archived: 1 };
  const result = splitTemplateCampaignsForMenu({
    templates: [template],
    activeUserCampaigns: [],
    archivedCampaigns: [archivedCopy],
  });

  assert.deepEqual(result.availableTemplates, []);
  assert.equal(result.archivedTemplateCopies.length, 1);
  assert.equal(result.archivedTemplateCopies[0].template.id, template.id);
  assert.equal(result.archivedTemplateCopies[0].campaign.id, archivedCopy.id);
});

test('legacy same-name template copies are treated as existing personal copies', () => {
  const legacyCopy = { ...personalCopy, source_template_id: undefined };
  const result = splitTemplateCampaignsForMenu({
    templates: [template],
    activeUserCampaigns: [legacyCopy],
    archivedCampaigns: [],
  });

  assert.deepEqual(result.availableTemplates, []);
});
