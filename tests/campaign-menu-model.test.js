import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findTemplateForPersonalCopy,
  getTemplateUpgradeForCampaign,
  splitTemplateCampaignsForMenu,
} from '../src/components/campaign-menu-model.ts';

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

test('legacy shorter personal copies keep template hidden but expose update metadata', () => {
  const nlhTemplate = {
    id: 30,
    type: 'template',
    slug: 'template-nlh-cash',
    name: 'NLH cash',
    node_count: 42,
    is_archived: 0,
  };
  const legacyCopy = {
    id: 31,
    type: 'user',
    slug: 'nlh-cash-short',
    name: 'NLH cash',
    source_template_id: undefined,
    node_count: 5,
    is_archived: 0,
  };

  const result = splitTemplateCampaignsForMenu({
    templates: [nlhTemplate],
    activeUserCampaigns: [legacyCopy],
    archivedCampaigns: [],
  });

  assert.deepEqual(result.availableTemplates, []);
  assert.equal(result.upgradeableTemplateCopies.length, 1);
  assert.equal(result.upgradeableTemplateCopies[0].campaign.id, legacyCopy.id);
  assert.equal(result.upgradeableTemplateCopies[0].template.id, nlhTemplate.id);
  assert.equal(result.upgradeableTemplateCopies[0].reason, 'legacy-copy');
});

test('fresh personal copies do not expose update metadata', () => {
  const freshCopy = { ...personalCopy, node_count: 86 };
  const currentTemplate = { ...template, node_count: 86 };

  assert.equal(findTemplateForPersonalCopy(freshCopy, [currentTemplate])?.id, currentTemplate.id);
  assert.equal(getTemplateUpgradeForCampaign(freshCopy, [currentTemplate]), null);
});
