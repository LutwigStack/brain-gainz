import type { CampaignSummary } from '../types/app-shell';

const normalizeTemplateKey = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLocaleLowerCase('ru-RU');

export const isPersonalCopyOfTemplate = (campaign: CampaignSummary, template: CampaignSummary) => {
  if (campaign.type !== 'user' || template.type !== 'template') {
    return false;
  }

  if (campaign.source_template_id != null) {
    return Number(campaign.source_template_id) === Number(template.id);
  }

  return normalizeTemplateKey(campaign.name) === normalizeTemplateKey(template.name);
};

export const findTemplateForPersonalCopy = (campaign: CampaignSummary, templates: CampaignSummary[]) =>
  templates.find((template) => isPersonalCopyOfTemplate(campaign, template)) ?? null;

export const getTemplateUpgradeForCampaign = (campaign: CampaignSummary, templates: CampaignSummary[]) => {
  const template = findTemplateForPersonalCopy(campaign, templates);
  if (!template) {
    return null;
  }

  const campaignNodeCount = Number(campaign.node_count ?? 0);
  const templateNodeCount = Number(template.node_count ?? 0);
  if (templateNodeCount <= campaignNodeCount) {
    return null;
  }

  return {
    campaign,
    template,
    reason: campaign.source_template_id == null ? 'legacy-copy' : 'newer-template',
  } as const;
};

export const splitTemplateCampaignsForMenu = ({
  templates,
  activeUserCampaigns,
  archivedCampaigns,
}: {
  templates: CampaignSummary[];
  activeUserCampaigns: CampaignSummary[];
  archivedCampaigns: CampaignSummary[];
}) => {
  const availableTemplates: CampaignSummary[] = [];
  const archivedTemplateCopies: Array<{ template: CampaignSummary; campaign: CampaignSummary }> = [];
  const upgradeableTemplateCopies: Array<{
    template: CampaignSummary;
    campaign: CampaignSummary;
    reason: 'legacy-copy' | 'newer-template';
  }> = [];

  for (const template of templates) {
    const activeCopy = activeUserCampaigns.find((campaign) => isPersonalCopyOfTemplate(campaign, template));
    if (activeCopy) {
      const upgrade = getTemplateUpgradeForCampaign(activeCopy, [template]);
      if (upgrade) {
        upgradeableTemplateCopies.push(upgrade);
      }
      continue;
    }

    const archivedCopy = archivedCampaigns.find((campaign) => isPersonalCopyOfTemplate(campaign, template));
    if (archivedCopy) {
      archivedTemplateCopies.push({ template, campaign: archivedCopy });
      continue;
    }

    availableTemplates.push(template);
  }

  return { availableTemplates, archivedTemplateCopies, upgradeableTemplateCopies };
};
