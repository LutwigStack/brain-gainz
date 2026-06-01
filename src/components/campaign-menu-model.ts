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

  for (const template of templates) {
    const activeCopy = activeUserCampaigns.find((campaign) => isPersonalCopyOfTemplate(campaign, template));
    if (activeCopy) {
      continue;
    }

    const archivedCopy = archivedCampaigns.find((campaign) => isPersonalCopyOfTemplate(campaign, template));
    if (archivedCopy) {
      archivedTemplateCopies.push({ template, campaign: archivedCopy });
      continue;
    }

    availableTemplates.push(template);
  }

  return { availableTemplates, archivedTemplateCopies };
};
