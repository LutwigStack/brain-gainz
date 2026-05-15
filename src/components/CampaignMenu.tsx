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

const modeLabel = (campaign: CampaignSummary) => (campaign.mode === 'career' ? 'Career' : 'Free mode');
const campaignStateLabel = (campaign: CampaignSummary) =>
  campaign.career_status === 'victory' ? 'Completed route' : campaign.is_archived ? 'Archived' : 'Active';

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
}) => {
  const isSystem = campaign.type === 'developer_main';
  const nodeCount = Number(campaign.node_count ?? 0);
  const totalXp = Number(campaign.total_xp ?? 0);
  const openLabel = isSystem ? 'Открыть систему' : 'Открыть';

  return (
    <PixelSurface
      frame={isSystem ? 'ghost' : 'panel'}
      padding="md"
      className={`campaign-card min-w-0 ${isSystem ? 'campaign-card--system' : 'campaign-card--user'}`}
      style={
        isSystem
          ? {
              background: 'rgba(148, 163, 184, 0.08)',
              borderColor: 'var(--pixel-line-soft)',
            }
          : undefined
      }
    >
      <div className="grid min-w-0 gap-3">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <PixelText as="p" size="xs" color="textMuted" uppercase>
              {isSystem ? 'Системная область' : 'Личная кампания'}
            </PixelText>
            <PixelText
              as="h3"
              readable
              size="lg"
              title={campaign.name}
              className="campaign-card__title"
              style={{ marginTop: 4, fontWeight: 800 }}
            >
              {campaign.name}
            </PixelText>
            <PixelText as="p" readable size="xs" color="textMuted" style={{ marginTop: 6 }}>
              {isSystem ? 'Системный шаблон' : modeLabel(campaign)} · {campaignStateLabel(campaign)}
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
        <PixelText as="p" size="xs" color="textDim" uppercase>
          {nodeCount} узл. · {totalXp} XP
        </PixelText>

        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <PixelButton tone="accent" onClick={onOpen} disabled={isMutating} aria-label={`${openLabel}: ${campaign.name}`}>
            <Play size={15} /> {openLabel}
          </PixelButton>
          {!isSystem ? (
            <PixelButton
              tone="ghost"
              onClick={onArchive}
              disabled={isMutating}
              aria-label={`Архивировать кампанию ${campaign.name}`}
            >
              <Archive size={15} /> В архив
            </PixelButton>
          ) : (
            <PixelText as="p" readable size="xs" color="textMuted" style={{ alignSelf: 'center' }}>
              Системный шаблон
            </PixelText>
          )}
        </div>
      </div>
    </PixelSurface>
  );
};

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
  const userCampaigns = activeCampaigns.filter((campaign) => campaign.type !== 'developer_main');
  const systemCampaigns = activeCampaigns.filter((campaign) => campaign.type === 'developer_main');

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
                  <PixelButton
                    tone="accent"
                    onClick={() => onOpenCampaign(lastOpened)}
                    disabled={isMutating || isLoading}
                    aria-label={`Продолжить кампанию ${lastOpened.name}`}
                    style={{ maxWidth: 300, justifyContent: 'flex-start' }}
                  >
                    <Play size={16} />
                    <span className="min-w-0 truncate">Продолжить: {lastOpened.name}</span>
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
              <div className="grid min-w-0 gap-3">
                {userCampaigns.length > 0 ? (
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {userCampaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        isMutating={isMutating || isLoading}
                        onOpen={() => onOpenCampaign(campaign)}
                        onArchive={() => onArchiveCampaign(campaign)}
                      />
                    ))}
                  </div>
                ) : null}

                {systemCampaigns.length > 0 ? (
                  <div className="grid min-w-0 gap-2">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Системные данные
                    </PixelText>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {systemCampaigns.map((campaign) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          isMutating={isMutating || isLoading}
                          onOpen={() => onOpenCampaign(campaign)}
                          onArchive={() => onArchiveCampaign(campaign)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
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
                        <PixelSurface key={campaign.id} frame="inset" padding="sm" className="min-w-0">
                          <div className="grid min-w-0 gap-2">
                            <PixelText as="p" readable size="sm" title={campaign.name} className="truncate">
                              {campaign.name}
                            </PixelText>
                            <PixelButton
                              tone="ghost"
                              onClick={() => onRestoreCampaign(campaign)}
                              disabled={isMutating}
                              aria-label={`Восстановить кампанию ${campaign.name}`}
                              fullWidth
                              style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
                            >
                              <RotateCcw size={14} /> Восстановить
                            </PixelButton>
                          </div>
                        </PixelSurface>
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
