import { Archive, Play, Plus, RotateCcw } from 'lucide-react';

import {
  PixelButton,
  PixelInput,
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
  const openLabel = isSystem ? 'Открыть шаблон' : 'Открыть';

  return (
    <PixelSurface
      frame="secondary"
      padding={isSystem ? 'sm' : 'md'}
      className={`campaign-card min-w-0 ${isSystem ? 'campaign-card--system' : 'campaign-card--user'}`}
      style={
        isSystem
          ? {
              background: 'rgba(148, 163, 184, 0.035)',
              borderColor: 'var(--pixel-line-soft)',
            }
          : undefined
      }
    >
      <div className={isSystem ? 'grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]' : 'grid min-w-0 gap-3'}>
        <div className="min-w-0">
          {!isSystem ? (
            <PixelText
              as="h3"
              readable
              size="lg"
              title={campaign.name}
              className="campaign-card__title"
              style={{ fontWeight: 800 }}
            >
              {campaign.name}
            </PixelText>
          ) : (
            <PixelText
              as="h3"
              readable
              size="sm"
              title={campaign.name}
              className="campaign-card__title"
              style={{ fontWeight: 700 }}
            >
              {campaign.name}
            </PixelText>
          )}
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <PixelText as="span" readable size="xs" color={isSystem ? 'textDim' : 'textMuted'}>
              {isSystem ? 'Системный шаблон' : modeLabel(campaign)}
            </PixelText>
            <PixelText as="span" readable size="xs" color="textDim">
              {campaignStateLabel(campaign)}
            </PixelText>
            <PixelText as="span" size="xs" color="textDim" uppercase>
              {nodeCount} узл. · {totalXp} XP
            </PixelText>
          </div>
        </div>

        <div className={isSystem ? 'flex min-w-0 items-center justify-end' : 'grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]'}>
          <PixelButton
            tone={isSystem ? 'ghost' : 'accent'}
            onClick={onOpen}
            disabled={isMutating}
            aria-label={`${openLabel}: ${campaign.name}`}
            style={isSystem ? { minHeight: 32, padding: '6px 10px', gap: 6 } : undefined}
          >
            <Play size={15} /> {openLabel}
          </PixelButton>
          {!isSystem ? (
            <PixelButton
              tone="danger"
              onClick={onArchive}
              disabled={isMutating}
              aria-label={`Архивировать кампанию ${campaign.name}`}
            >
              <Archive size={15} /> В архив
            </PixelButton>
          ) : (
            null
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
  const emptyPersonalCampaigns = !isLoading && userCampaigns.length === 0;

  return (
    <div className="campaign-menu w-full min-w-0 flex-grow pt-3">
      <div className="mx-auto grid w-full max-w-6xl gap-4">
        <PixelSurface frame="secondary" padding="xl">
          <PixelStack gap="lg">
            <PixelPanelHeader
              eyebrow="Кампании"
              title="Личные кампании"
              description="Выберите свой рабочий мир или создайте новый."
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
              <PixelSurface frame="destructive" padding="sm">
                <PixelText as="p" readable size="sm">
                  {error}
                </PixelText>
              </PixelSurface>
            ) : null}

            <PixelSurface frame="ghost" padding="sm" className="campaign-create-strip">
              <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <PixelInput
                  id="new-campaign-name"
                  label="Новая личная кампания"
                  value={newCampaignName}
                  onChange={(event) => onNewCampaignNameChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      onCreateCampaign();
                    }
                  }}
                  placeholder="Например: English Foundations"
                  style={{ minHeight: 36, padding: '6px 10px' }}
                />
                <PixelButton
                  tone="ghost"
                  onClick={onCreateCampaign}
                  disabled={isMutating || !newCampaignName.trim()}
                  style={{ minHeight: 36, padding: '7px 10px', gap: 6 }}
                >
                  <Plus size={15} /> Создать
                </PixelButton>
              </div>
            </PixelSurface>

            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
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

                {emptyPersonalCampaigns ? (
                  <PixelSurface frame="inset" padding="md">
                    <PixelText as="p" readable size="sm" color="textMuted">
                      Личных кампаний пока нет. Введите название выше, чтобы начать со своего набора.
                    </PixelText>
                  </PixelSurface>
                ) : null}

                {systemCampaigns.length > 0 ? (
                  <div className="campaign-system-section grid min-w-0 gap-2">
                    <PixelText as="p" size="xs" color="textMuted" uppercase>
                      Системный шаблон
                    </PixelText>
                    <div className="grid min-w-0 gap-2">
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

              <PixelSurface frame="ghost" padding="md" className="campaign-archive-panel">
                <PixelStack gap="md">
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
                  ) : (
                    <PixelText as="p" readable size="sm" color="textDim">
                      Архив пуст.
                    </PixelText>
                  )}
                </PixelStack>
              </PixelSurface>
            </div>
          </PixelStack>
        </PixelSurface>
      </div>
    </div>
  );
};
