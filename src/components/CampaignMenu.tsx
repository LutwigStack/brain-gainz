import { Archive, Brain, Play, Plus, RotateCcw } from 'lucide-react';

import {
  PixelButton,
  PixelInput,
  PixelMeter,
  PixelPanelHeader,
  PixelStack,
  PixelSurface,
  PixelText,
} from './pixel';
import type { CampaignListSnapshot, CampaignSummary } from '../types/app-shell';

interface CampaignMenuProps {
  campaigns: CampaignListSnapshot | null;
  isLoading: boolean;
  isMutating: boolean;
  newCampaignName: string;
  error: string | null;
  onNewCampaignNameChange: (value: string) => void;
  onOpenCampaign: (campaign: CampaignSummary) => void;
  onCreateCampaign: () => void;
  onArchiveCampaign: (campaign: CampaignSummary) => void;
  onRestoreCampaign: (campaign: CampaignSummary) => void;
}

const campaignProgress = (campaign: CampaignSummary) => {
  const xp = Number(campaign.total_xp ?? 0);
  return Math.min(100, Math.round((xp / 700) * 100));
};

const CampaignCard = ({
  campaign,
  isMutating,
  onOpen,
  onArchive,
}: {
  campaign: CampaignSummary;
  isMutating: boolean;
  onOpen: () => void;
  onArchive: () => void;
}) => (
  <PixelSurface frame="panel" padding="md" className="min-w-0">
    <div className="grid min-w-0 gap-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <PixelText as="p" size="xs" color="textMuted" uppercase>
            {campaign.type === 'developer_main' ? 'developer_main' : 'campaign'}
          </PixelText>
          <PixelText as="h3" readable size="lg" style={{ marginTop: 4, fontWeight: 800 }}>
            {campaign.name}
          </PixelText>
        </div>
        <div
          aria-hidden
          className="grid h-10 w-10 flex-shrink-0 place-items-center border border-[var(--pixel-border-bright)]"
          style={{ background: `${campaign.color ?? '#58d6ff'}22`, color: campaign.color ?? 'var(--pixel-accent)' }}
        >
          <Brain size={18} />
        </div>
      </div>

      <PixelMeter value={campaignProgress(campaign)} />
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <PixelText as="span" size="xs" color="textMuted" uppercase>
          {Number(campaign.node_count ?? 0)} узл.
        </PixelText>
        <PixelText as="span" size="xs" color="textMuted" uppercase>
          {Number(campaign.total_xp ?? 0)} XP
        </PixelText>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <PixelButton tone="accent" onClick={onOpen} disabled={isMutating}>
          <Play size={15} /> Открыть
        </PixelButton>
        {campaign.type !== 'developer_main' ? (
          <PixelButton tone="ghost" onClick={onArchive} disabled={isMutating} aria-label="Архивировать кампанию">
            <Archive size={15} />
          </PixelButton>
        ) : null}
      </div>
    </div>
  </PixelSurface>
);

export const CampaignMenu = ({
  campaigns,
  isLoading,
  isMutating,
  newCampaignName,
  error,
  onNewCampaignNameChange,
  onOpenCampaign,
  onCreateCampaign,
  onArchiveCampaign,
  onRestoreCampaign,
}: CampaignMenuProps) => {
  const activeCampaigns = campaigns?.active ?? [];
  const archivedCampaigns = campaigns?.archived ?? [];
  const lastOpened = campaigns?.lastOpened ?? null;

  return (
    <div className="w-full min-w-0 flex-grow pt-3">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <PixelSurface frame="panel" padding="xl">
          <PixelStack gap="lg">
            <PixelPanelHeader
              eyebrow="Кампании"
              title="BrainGainz"
              description="Выберите мир обучения."
              aside={
                lastOpened ? (
                  <PixelButton tone="accent" onClick={() => onOpenCampaign(lastOpened)} disabled={isMutating || isLoading}>
                    <Play size={16} /> Продолжить
                  </PixelButton>
                ) : null
              }
            />

            {error ? (
              <PixelSurface frame="accent" padding="sm">
                <PixelText as="p" readable size="sm">
                  {error}
                </PixelText>
              </PixelSurface>
            ) : null}

            <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
              <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    isMutating={isMutating || isLoading}
                    onOpen={() => onOpenCampaign(campaign)}
                    onArchive={() => onArchiveCampaign(campaign)}
                  />
                ))}
              </div>

              <PixelSurface frame="ghost" padding="md">
                <PixelStack gap="md">
                  <PixelInput
                    id="new-campaign-name"
                    label="Новая кампания"
                    value={newCampaignName}
                    onChange={(event) => onNewCampaignNameChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        onCreateCampaign();
                      }
                    }}
                    placeholder="Например: English Foundations"
                  />
                  <PixelButton tone="accent" onClick={onCreateCampaign} disabled={isMutating || !newCampaignName.trim()}>
                    <Plus size={16} /> Создать
                  </PixelButton>

                  {archivedCampaigns.length > 0 ? (
                    <div className="grid gap-2">
                      <PixelText as="p" size="xs" color="textMuted" uppercase>
                        Архив
                      </PixelText>
                      {archivedCampaigns.map((campaign) => (
                        <PixelButton
                          key={campaign.id}
                          tone="ghost"
                          onClick={() => onRestoreCampaign(campaign)}
                          disabled={isMutating}
                          style={{ justifyContent: 'space-between' }}
                        >
                          <span className="truncate">{campaign.name}</span>
                          <RotateCcw size={14} />
                        </PixelButton>
                      ))}
                    </div>
                  ) : null}
                </PixelStack>
              </PixelSurface>
            </div>
          </PixelStack>
        </PixelSurface>
      </div>
    </div>
  );
};
