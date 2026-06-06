import {
  Archive,
  BookOpen,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import {
  PixelButton,
  PixelInput,
  PixelSurface,
  PixelText,
} from './pixel';
import { ReferenceAssetImage } from '../assets/ReferenceAssetImage';
import {
  csBachelorReferenceAssets,
  isCsBachelorCampaign,
  resolveCampaignCardAsset,
} from '../assets/referenceStyleAssets';
import type { CampaignListSnapshot, CampaignSummary } from '../types/app-shell';
import { findTemplateForPersonalCopy, splitTemplateCampaignsForMenu } from './campaign-menu-model';

interface CampaignMenuNotice {
  message: string;
  actionLabel?: string;
  campaign?: CampaignSummary;
}

interface CampaignMenuProps {
  campaigns: CampaignListSnapshot | null;
  isLoading: boolean;
  isMutating: boolean;
  newCampaignName: string;
  error: string | null;
  notice: CampaignMenuNotice | null;
  onNewCampaignNameChange: (value: string) => void;
  onOpenCampaign: (campaign: CampaignSummary) => void;
  onForkTemplate: (campaign: CampaignSummary) => void;
  onUpdateCampaignFromTemplate: (campaign: CampaignSummary, template: CampaignSummary) => void;
  onCreateCampaign: () => void;
  onCreateCampaignDetailed: () => void;
  onArchiveCampaign: (campaign: CampaignSummary) => void;
  onRestoreCampaign: (campaign: CampaignSummary) => void;
}

type CampaignCourseItem =
  | { kind: 'available'; campaign: CampaignSummary }
  | { kind: 'restore'; campaign: CampaignSummary; template: CampaignSummary };

const templateCampaignOrder = [
  'template-cs-bachelor',
  'template-materials-science',
  'template-nlh-cash',
  'template-biology',
  'template-applied-math',
  'template-ml-ai',
];

const sortTemplateCampaigns = (campaigns: CampaignSummary[]) =>
  [...campaigns].sort((left, right) => {
    const leftIndex = templateCampaignOrder.indexOf(left.slug ?? '');
    const rightIndex = templateCampaignOrder.indexOf(right.slug ?? '');
    const leftRank = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const rightRank = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
    return leftRank - rightRank || String(left.name).localeCompare(String(right.name), 'ru-RU');
  });

const presetCampaignNames = ['Моя программа', 'Подготовка к собеседованию', 'План на семестр'];

const modeLabel = (campaign: CampaignSummary) => (campaign.mode === 'career' ? 'Маршрут' : 'Свободный режим');
const campaignStateLabel = (campaign: CampaignSummary) =>
  campaign.career_status === 'victory' ? 'Маршрут пройден' : campaign.is_archived ? 'В архиве' : 'Активна';
const campaignStatsLabel = (campaign: CampaignSummary) =>
  `${Number(campaign.node_count ?? 0)} узл. · ${Number(campaign.total_xp ?? 0)} XP`;

const campaignProgressPercent = (campaign: CampaignSummary) => {
  const xp = Number(campaign.total_xp ?? 0);
  const nodes = Number(campaign.node_count ?? 0);

  if (xp <= 0) {
    return 0;
  }

  return Math.max(12, Math.min(100, Math.round((xp / Math.max(120, nodes * 3)) * 100)));
};

const courseDescription = (campaign: CampaignSummary) =>
  campaign.slug?.includes('materials-science')
    ? 'Структура материалов, свойства, лабораторное мышление и инженерный выбор.'
    : campaign.slug?.includes('nlh-cash')
      ? 'Учебная стратегия кэш-игры NLH: диапазоны, банк, позиция и разбор решений.'
      : campaign.slug?.includes('biology')
        ? 'Клетка, генетика, эволюция, экосистемы и базовая лабораторная логика.'
        : campaign.slug?.includes('applied-math')
          ? 'Модели, анализ, вероятность, оптимизация и прикладное решение задач.'
          : campaign.slug?.includes('ml-ai')
            ? 'Данные, модели, обучение, оценка качества и практический ИИ-пайплайн.'
            : isCsBachelorCampaign(campaign)
              ? 'Программирование, математика, структуры данных, алгоритмы и системы.'
              : 'Готовая учебная программа без ручной настройки.';

const courseTypeLabel = (campaign: CampaignSummary) =>
  campaign.slug?.includes('nlh-cash') ? 'Стратегия и практика' : 'Готовая программа';

type CampaignProgramTone = 'cs' | 'materials' | 'strategy' | 'biology' | 'math' | 'ml' | 'neutral';

const courseToneKey = (campaign: CampaignSummary): CampaignProgramTone => {
  const slug = campaign.slug ?? '';

  if (slug.includes('materials-science')) {
    return 'materials';
  }
  if (slug.includes('nlh-cash')) {
    return 'strategy';
  }
  if (slug.includes('biology')) {
    return 'biology';
  }
  if (slug.includes('applied-math')) {
    return 'math';
  }
  if (slug.includes('ml-ai')) {
    return 'ml';
  }
  if (slug.includes('cs-bachelor')) {
    return 'cs';
  }

  return 'neutral';
};

const courseToneClass = (campaign: CampaignSummary) => `campaign-course-card--${courseToneKey(campaign)}`;

const CampaignProgramEmblemGlyph = ({ tone }: { tone: CampaignProgramTone }) => (
  <svg viewBox="0 0 48 48" focusable="false">
    <rect className="campaign-program-emblem__frame" x="8" y="8" width="32" height="32" rx="6" />
    {tone === 'materials' ? (
      <>
        <path className="campaign-program-emblem__line" d="M15 24h18M24 15v18M17 17l14 14M31 17 17 31" />
        <path className="campaign-program-emblem__core" d="M24 13 35 24 24 35 13 24Z" />
        <circle className="campaign-program-emblem__dot" cx="24" cy="24" r="3.5" />
      </>
    ) : tone === 'strategy' ? (
      <>
        <path className="campaign-program-emblem__line" d="M15 32c5-10 12-16 21-18M14 18h10v14H14zM28 24h7v8h-7z" />
        <circle className="campaign-program-emblem__dot" cx="17" cy="21" r="1.6" />
        <circle className="campaign-program-emblem__dot" cx="21" cy="29" r="1.6" />
        <path className="campaign-program-emblem__core" d="M31 13 36 18 31 23 26 18Z" />
      </>
    ) : tone === 'biology' ? (
      <>
        <path className="campaign-program-emblem__line" d="M18 13c12 6 12 16 0 22M30 13c-12 6-12 16 0 22M19 18h10M17 24h14M19 30h10" />
        <path className="campaign-program-emblem__core" d="M24 16c7 5 7 11 0 16-7-5-7-11 0-16Z" />
        <circle className="campaign-program-emblem__dot" cx="24" cy="24" r="2.5" />
      </>
    ) : tone === 'math' ? (
      <>
        <path className="campaign-program-emblem__line" d="M13 32h22M16 35V15M16 29c4-10 8-13 12-8s6 4 8-4" />
        <path className="campaign-program-emblem__core" d="M15 30 22 23 27 27 35 17" />
        <circle className="campaign-program-emblem__dot" cx="22" cy="23" r="2" />
        <circle className="campaign-program-emblem__dot" cx="35" cy="17" r="2" />
      </>
    ) : tone === 'ml' ? (
      <>
        <path className="campaign-program-emblem__line" d="M16 17l8 7-8 7M32 17l-8 7 8 7M16 17h16M16 31h16" />
        <circle className="campaign-program-emblem__dot" cx="16" cy="17" r="3" />
        <circle className="campaign-program-emblem__dot" cx="16" cy="31" r="3" />
        <circle className="campaign-program-emblem__dot" cx="32" cy="17" r="3" />
        <circle className="campaign-program-emblem__dot" cx="32" cy="31" r="3" />
        <circle className="campaign-program-emblem__core" cx="24" cy="24" r="4" />
      </>
    ) : (
      <>
        <path className="campaign-program-emblem__line" d="M17 16h14M17 24h14M17 32h14M20 16v16M28 16v16" />
        <path className="campaign-program-emblem__core" d="M16 19 24 13 32 19v14H16Z" />
        <circle className="campaign-program-emblem__dot" cx="24" cy="24" r="2.5" />
      </>
    )}
  </svg>
);

const courseEmblemAsset = (tone: CampaignProgramTone) => {
  switch (tone) {
    case 'materials':
      return csBachelorReferenceAssets.programEmblem.materialsScience;
    case 'strategy':
      return csBachelorReferenceAssets.programEmblem.nlhCash;
    case 'biology':
      return csBachelorReferenceAssets.programEmblem.biology;
    case 'math':
      return csBachelorReferenceAssets.programEmblem.appliedMath;
    case 'ml':
      return csBachelorReferenceAssets.programEmblem.mlAi;
    case 'cs':
      return csBachelorReferenceAssets.programEmblem.csBachelor;
    default:
      return null;
  }
};

const CampaignProgramEmblem = ({
  tone,
  className = '',
}: {
  tone: CampaignProgramTone;
  className?: string;
}) => (
  <span className={`campaign-program-emblem campaign-program-emblem--${tone} ${className}`.trim()} aria-hidden="true">
    <ReferenceAssetImage
      asset={courseEmblemAsset(tone)}
      decorative
      className="campaign-program-emblem__image"
      fallback={<CampaignProgramEmblemGlyph tone={tone} />}
    />
  </span>
);

const CampaignSection = ({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={`campaign-intent-section ${className}`.trim()}>
    <div className="campaign-intent-heading">
      <div className="min-w-0">
        <PixelText as="h2" readable size="lg" className="campaign-intent-heading__title">
          {title}
        </PixelText>
      </div>
    </div>
    {children}
  </section>
);

const CampaignStatPill = ({ label }: { label: string }) => (
  <PixelText as="span" readable size="xs" color="textMuted" className="campaign-stat-pill">
    {label}
  </PixelText>
);

const CampaignMetricIcon = ({ type }: { type: 'nodes' | 'xp' | 'status' }) => (
  <span className={`campaign-save-slot__metric-art campaign-save-slot__metric-art--${type}`} aria-hidden="true">
    {type === 'nodes' ? (
      <svg viewBox="0 0 48 48" focusable="false">
        <path className="campaign-metric-icon__line" d="M14 15h20M14 33h20M15 15l18 18M33 15 15 33M24 10v28" />
        <circle className="campaign-metric-icon__node campaign-metric-icon__node--core" cx="24" cy="24" r="5" />
        <circle className="campaign-metric-icon__node" cx="14" cy="15" r="3.5" />
        <circle className="campaign-metric-icon__node" cx="34" cy="15" r="3.5" />
        <circle className="campaign-metric-icon__node" cx="14" cy="33" r="3.5" />
        <circle className="campaign-metric-icon__node" cx="34" cy="33" r="3.5" />
      </svg>
    ) : type === 'xp' ? (
      <svg viewBox="0 0 48 48" focusable="false">
        <path className="campaign-metric-icon__flame" d="M25 6c5 7-2 10 5 16 3 3 5 6 5 10 0 7-5 12-12 12S11 39 11 32c0-6 4-10 8-14 3-3 4-7 6-12Z" />
        <path className="campaign-metric-icon__crystal" d="M24 18 32 29 24 40 16 29Z" />
        <path className="campaign-metric-icon__spark" d="M10 16h6M13 13v6M35 13h5M37.5 10.5v5M36 36h6M39 33v6" />
      </svg>
    ) : (
      <svg viewBox="0 0 48 48" focusable="false">
        <circle className="campaign-metric-icon__ring" cx="24" cy="28" r="14" />
        <path className="campaign-metric-icon__compass" d="M24 41V13M24 13l15 7-15 7V13Z" />
        <path className="campaign-metric-icon__route" d="M11 29c5-5 10-5 13-1s8 4 13-1" />
        <circle className="campaign-metric-icon__beacon" cx="24" cy="13" r="3" />
      </svg>
    )}
  </span>
);

const CampaignSaveSlotMetric = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: 'nodes' | 'xp' | 'status';
}) => (
  <div className="campaign-save-slot__metric">
    <CampaignMetricIcon type={icon} />
    <span className="campaign-save-slot__metric-copy">
    <PixelText as="span" size="xs" color="textDim">
      {label}
    </PixelText>
    <PixelText as="strong" readable size="sm">
      {value}
    </PixelText>
    </span>
  </div>
);

const CampaignSaveSlot = ({
  campaign,
  identityCampaign = campaign,
  isMutating,
  onOpen,
  onUpdateFromTemplate,
  onArchive,
}: {
  campaign: CampaignSummary;
  identityCampaign?: CampaignSummary;
  isMutating: boolean;
  onOpen: () => void;
  onUpdateFromTemplate?: () => void;
  onArchive: () => void;
}) => {
  const progress = campaignProgressPercent(campaign);
  const nodeCount = Number(campaign.node_count ?? 0);
  const totalXp = Number(campaign.total_xp ?? 0);
  const tone = courseToneKey(identityCampaign);
  const usesDedicatedHeroAsset = isCsBachelorCampaign(identityCampaign);
  const heroAsset = usesDedicatedHeroAsset
    ? csBachelorReferenceAssets.city.coreCsCitadel
    : resolveCampaignCardAsset(identityCampaign);

  return (
    <PixelSurface
      frame="secondary"
      padding="lg"
      className={`campaign-save-slot ${courseToneClass(identityCampaign)} ${heroAsset ? 'campaign-save-slot--with-art' : ''} ${
        heroAsset && !usesDedicatedHeroAsset ? 'campaign-save-slot--mirrored-card-art' : ''
      }`.trim()}
    >
      <span className="campaign-save-slot__art" aria-hidden="true">
        {heroAsset ? (
          <ReferenceAssetImage
            asset={heroAsset}
            decorative
            className="campaign-save-slot__backdrop"
            fallback={<span className="campaign-save-slot__backdrop-fallback" />}
          />
        ) : (
          <span className="campaign-save-slot__backdrop-fallback" aria-hidden="true" />
        )}
        <span className="campaign-save-slot__shade" aria-hidden="true" />
      </span>

      <div className="campaign-save-slot__layout">
        <CampaignProgramEmblem tone={tone} className="campaign-program-emblem--hero" />

        <div className="campaign-save-slot__main min-w-0">
          <PixelText as="h3" readable size="xl" title={campaign.name} className="campaign-save-slot__title">
            {campaign.name}
          </PixelText>
          <div className="campaign-save-slot__state-row">
            <PixelText as="p" readable size="sm" color="textMuted" className="campaign-save-slot__status">
              {modeLabel(campaign)} активен
            </PixelText>
            <PixelText as="span" size="xs" color="accent" className="campaign-save-slot__state-badge">
              {campaignStateLabel(campaign)}
            </PixelText>
          </div>
          <div className="campaign-save-slot__progress" aria-label={`Прогресс программы ${progress}%`}>
            <div className="campaign-save-slot__progress-head">
              <PixelText as="span" readable className="campaign-save-slot__progress-value">
                {progress}%
              </PixelText>
              <PixelText as="span" size="xs" color="textMuted">
                Прогресс
              </PixelText>
            </div>
            <span className="campaign-save-slot__progress-track">
              <span style={{ width: `${progress}%` }} />
            </span>
          </div>
          <div className="campaign-save-slot__metrics" aria-label="Сводка программы">
            <CampaignSaveSlotMetric
              label="Узлы"
              value={`${nodeCount}`}
              icon="nodes"
            />
            <CampaignSaveSlotMetric
              label="XP"
              value={`${totalXp}`}
              icon="xp"
            />
            <CampaignSaveSlotMetric
              label="Статус"
              value={campaignStateLabel(campaign)}
              icon="status"
            />
          </div>
        </div>

        <div className="campaign-save-slot__actions">
          <PixelButton
            tone="accent"
            onClick={onOpen}
            disabled={isMutating}
            aria-label={`Продолжить: ${campaign.name}`}
            className="campaign-save-slot__primary"
            fullWidth
            style={{ display: 'flex', width: '100%', minHeight: 48, padding: '10px 16px', gap: 8 }}
          >
            <Play size={16} /> Продолжить
          </PixelButton>
          <details className="campaign-save-slot__more">
            <summary aria-label={`Еще действия для программы ${campaign.name}`}>
              <MoreHorizontal size={17} />
            </summary>
            <div className="campaign-save-slot__more-menu">
              {onUpdateFromTemplate ? (
                <PixelButton
                  tone="ghost"
                  onClick={onUpdateFromTemplate}
                  disabled={isMutating}
                  aria-label={`Обновить программу ${campaign.name} до новой версии`}
                  className="campaign-save-slot__update"
                  style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
                >
                  <RefreshCw size={14} /> Обновить программу
                </PixelButton>
              ) : null}
              <PixelButton
                tone="ghost"
                onClick={onArchive}
                disabled={isMutating}
                aria-label={`Скрыть программу ${campaign.name} в архив`}
                style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
              >
                <Archive size={14} /> Скрыть в архив
              </PixelButton>
            </div>
          </details>
        </div>
      </div>
    </PixelSurface>
  );
};

const CampaignMiniRow = ({
  campaign,
  isMutating,
  onSelect,
}: {
  campaign: CampaignSummary;
  isMutating: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    className="campaign-mini-row"
    onClick={onSelect}
    disabled={isMutating}
    aria-label={`Показать в продолжении: ${campaign.name}`}
  >
    <span className="campaign-mini-row__content min-w-0">
      <PixelText as="span" readable size="sm" title={campaign.name} className="campaign-card__title">
        {campaign.name}
      </PixelText>
      <PixelText as="span" size="xs" color="textDim">
        {campaignStatsLabel(campaign)}
      </PixelText>
    </span>
    <span className="campaign-mini-row__cue" aria-hidden="true" />
  </button>
);

const CampaignCourseCard = ({
  item,
  isMutating,
  onOpen,
  onFork,
  onRestore,
}: {
  item: CampaignCourseItem;
  isMutating: boolean;
  onOpen: (campaign: CampaignSummary) => void;
  onFork: (campaign: CampaignSummary) => void;
  onRestore: (campaign: CampaignSummary) => void;
}) => {
  const { campaign } = item;
  const isRestore = item.kind === 'restore';
  const cardAsset = resolveCampaignCardAsset(campaign);
  const tone = courseToneKey(campaign);
  const nodeCount = Number(campaign.node_count ?? 0);
  const totalXp = Number(campaign.total_xp ?? 0);

  return (
    <PixelSurface
      frame="secondary"
      padding="md"
      className={`campaign-course-card ${courseToneClass(campaign)} ${isRestore ? 'campaign-course-card--restore' : ''}`.trim()}
    >
      {cardAsset ? (
        <ReferenceAssetImage
          asset={cardAsset}
          decorative
          className="campaign-course-card__image"
          fallback={<span className="campaign-course-card__image-fallback" />}
        />
      ) : (
        <span className="campaign-course-card__image-fallback" aria-hidden="true" />
      )}
      <span className="campaign-course-card__shade" aria-hidden="true" />
      {!isRestore ? (
        <PixelButton
          tone="ghost"
          onClick={() => onOpen(campaign)}
          disabled={isMutating}
          aria-label={`Посмотреть карту программы ${campaign.name}`}
          className="campaign-course-card__map-action"
          style={{ minHeight: 28, padding: '5px 7px', gap: 5 }}
        >
          <BookOpen size={14} /> Карта
        </PixelButton>
      ) : null}
      <CampaignProgramEmblem tone={tone} className="campaign-program-emblem--course" />

      <div className="campaign-course-card__body min-w-0">
        <div className="campaign-course-card__copy-stack min-w-0">
          <PixelText as="p" size="xs" color={isRestore ? 'warning' : 'info'} className="campaign-course-card__type">
            {isRestore ? 'В архиве' : courseTypeLabel(campaign)}
          </PixelText>
          <PixelText as="h3" readable size="lg" title={campaign.name} className="campaign-course-card__title">
            {campaign.name}
          </PixelText>
          <PixelText as="p" readable size="sm" color="textMuted" className="campaign-course-card__copy">
            {courseDescription(campaign)}
          </PixelText>
          <div className="campaign-course-card__metrics">
            <CampaignStatPill label={`${nodeCount} узл.`} />
            {totalXp > 0 ? <CampaignStatPill label={`${totalXp} XP`} /> : null}
          </div>
        </div>
      </div>

      <div className="campaign-course-card__actions">
        {isRestore ? (
          <PixelButton
            tone="accent"
            onClick={() => onRestore(campaign)}
            disabled={isMutating}
            aria-label={`Восстановить программу ${campaign.name}`}
            className="campaign-course-card__primary"
            fullWidth
            style={{ minHeight: 38, padding: '8px 11px', gap: 6 }}
          >
            <RotateCcw size={15} /> Восстановить
          </PixelButton>
        ) : (
          <PixelButton
            tone="accent"
            onClick={() => onFork(campaign)}
            disabled={isMutating}
            aria-label={`Начать готовую программу ${campaign.name}`}
            className="campaign-course-card__primary campaign-course-card__primary--start"
            fullWidth
            style={{ minHeight: 38, padding: '8px 11px', gap: 6 }}
          >
            <Play size={15} /> Начать программу
          </PixelButton>
        )}
      </div>
    </PixelSurface>
  );
};

const CampaignReadyProgramEmptySlot = ({ slotCount }: { slotCount: number }) => (
  <div
    className="campaign-course-empty-slot"
    role="note"
    aria-label="Пустое место в сетке готовых программ: больше программ скоро появится"
    style={
      {
        '--campaign-ready-empty-slot-span': String(Math.max(1, Math.min(3, slotCount))),
      } as CSSProperties
    }
  >
    <span className="campaign-course-empty-slot__mark" aria-hidden="true" />
    <PixelText as="p" readable size="sm" color="textDim" className="campaign-course-empty-slot__copy">
      Больше программ скоро появится
    </PixelText>
  </div>
);

const CampaignCreateWorkshop = ({
  newCampaignName,
  isMutating,
  onNewCampaignNameChange,
  onCreateCampaign,
  onCreateCampaignDetailed,
}: {
  newCampaignName: string;
  isMutating: boolean;
  onNewCampaignNameChange: (value: string) => void;
  onCreateCampaign: () => void;
  onCreateCampaignDetailed: () => void;
}) => {
  const canCreate = !isMutating && newCampaignName.trim().length > 0;

  return (
    <PixelSurface frame="ghost" padding="md" className="campaign-create-workshop">
      <div className="campaign-create-workshop__intro">
        <span className="campaign-create-workshop__icon" aria-hidden="true">
          <Wrench size={17} />
        </span>
        <PixelText as="p" readable size="sm" className="campaign-create-workshop__title">
          С нуля
        </PixelText>
      </div>

      <div className="campaign-create-workshop__field">
        <PixelInput
          id="new-campaign-name"
          label="Название"
          value={newCampaignName}
          onChange={(event) => onNewCampaignNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onCreateCampaign();
            }
          }}
          placeholder="Например: Моя программа"
          style={{ minHeight: 36, padding: '6px 10px' }}
        />
        <div className="campaign-create-workshop__presets" aria-label="Быстрые варианты названия">
          <PixelText as="span" size="xs" color="textDim" className="campaign-create-workshop__presets-label">
            Варианты
          </PixelText>
          {presetCampaignNames.map((preset) => (
            <button
              key={preset}
              type="button"
              className="campaign-preset-chip"
              onClick={() => onNewCampaignNameChange(preset)}
              disabled={isMutating}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div className="campaign-create-strip__layout">
        <PixelButton
          tone="accent"
          onClick={onCreateCampaign}
          disabled={!canCreate}
          className="campaign-create-workshop__create"
          style={{ minHeight: 36, padding: '7px 11px', gap: 6 }}
        >
          <Plus size={15} /> Создать
        </PixelButton>
        <PixelButton
          tone="ghost"
          onClick={onCreateCampaignDetailed}
          disabled={!canCreate}
          className="campaign-create-workshop__settings"
          style={{ minHeight: 36, padding: '7px 11px', gap: 6 }}
        >
          <SlidersHorizontal size={15} /> Настроить
        </PixelButton>
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
  notice,
  onNewCampaignNameChange,
  onOpenCampaign,
  onForkTemplate,
  onUpdateCampaignFromTemplate,
  onCreateCampaign,
  onCreateCampaignDetailed,
  onArchiveCampaign,
  onRestoreCampaign,
}: CampaignMenuProps) => {
  const activeCampaigns = campaigns?.active ?? [];
  const archivedCampaigns = campaigns?.archived ?? [];
  const lastOpened = campaigns?.lastOpened?.type === 'user' ? campaigns.lastOpened : null;
  const userCampaigns = activeCampaigns.filter((campaign) => campaign.type === 'user');
  const [selectedPrimaryCampaignId, setSelectedPrimaryCampaignId] = useState<number | null>(null);
  const templateCampaigns = sortTemplateCampaigns(activeCampaigns.filter((campaign) => campaign.type === 'template'));
  const templateCampaignById = new Map(templateCampaigns.map((campaign) => [Number(campaign.id), campaign]));
  const { availableTemplates, archivedTemplateCopies, upgradeableTemplateCopies } = splitTemplateCampaignsForMenu({
    templates: templateCampaigns,
    activeUserCampaigns: userCampaigns,
    archivedCampaigns,
  });
  const upgradeTemplateByCampaignId = new Map(
    upgradeableTemplateCopies.map(({ campaign, template }) => [Number(campaign.id), template]),
  );
  const selectedPrimaryCampaign =
    selectedPrimaryCampaignId == null
      ? null
      : userCampaigns.find((campaign) => Number(campaign.id) === selectedPrimaryCampaignId) ?? null;
  const primaryCampaign = selectedPrimaryCampaign ?? lastOpened ?? userCampaigns[0] ?? null;
  const primaryCampaignIdentity =
    primaryCampaign?.source_template_id != null
      ? templateCampaignById.get(Number(primaryCampaign.source_template_id)) ?? primaryCampaign
      : primaryCampaign
        ? findTemplateForPersonalCopy(primaryCampaign, templateCampaigns) ?? primaryCampaign
        : primaryCampaign;
  const primaryCampaignUpgradeTemplate =
    primaryCampaign == null ? null : upgradeTemplateByCampaignId.get(Number(primaryCampaign.id)) ?? null;
  const secondaryUserCampaigns = primaryCampaign
    ? userCampaigns.filter((campaign) => campaign.id !== primaryCampaign.id)
    : userCampaigns;
  const courseItems: CampaignCourseItem[] = [
    ...availableTemplates.map((campaign) => ({ kind: 'available' as const, campaign })),
    ...archivedTemplateCopies.map(({ campaign, template }) => ({ kind: 'restore' as const, campaign, template })),
  ];
  const readyProgramEmptySlotCount = Math.max(
    0,
    templateCampaigns.length - availableTemplates.length - archivedTemplateCopies.length,
  );
  const showReadyProgramEmptySlot = !isLoading && courseItems.length > 0 && readyProgramEmptySlotCount > 0;
  const emptyPersonalCampaigns = !isLoading && userCampaigns.length === 0;
  const mutationDisabled = isMutating || isLoading;

  return (
    <div className="campaign-menu w-full min-w-0 flex-grow pt-3">
      <div className="campaign-board mx-auto w-full max-w-6xl">
        {error ? (
          <PixelSurface frame="destructive" padding="sm">
            <PixelText as="p" readable size="sm">
              {error}
            </PixelText>
          </PixelSurface>
        ) : null}

        {notice ? (
          <PixelSurface frame="selected" padding="sm" className="campaign-notice">
            <div className="campaign-notice__content">
              <PixelText as="p" readable size="sm">
                {notice.message}
              </PixelText>
              {notice.campaign && notice.actionLabel ? (
                <PixelButton
                  tone="ghost"
                  onClick={() => onRestoreCampaign(notice.campaign as CampaignSummary)}
                  disabled={mutationDisabled}
                  aria-label={`Восстановить программу ${notice.campaign.name}`}
                  style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
                >
                  <RotateCcw size={14} /> {notice.actionLabel}
                </PixelButton>
              ) : null}
            </div>
          </PixelSurface>
        ) : null}

        <CampaignSection title="Продолжить обучение" className="campaign-intent-section--continue">
          {primaryCampaign ? (
            <CampaignSaveSlot
              key={primaryCampaign.id}
              campaign={primaryCampaign}
              identityCampaign={primaryCampaignIdentity ?? primaryCampaign}
              isMutating={mutationDisabled}
              onOpen={() => onOpenCampaign(primaryCampaign)}
              onUpdateFromTemplate={
                primaryCampaignUpgradeTemplate
                  ? () => onUpdateCampaignFromTemplate(primaryCampaign, primaryCampaignUpgradeTemplate)
                  : undefined
              }
              onArchive={() => onArchiveCampaign(primaryCampaign)}
            />
          ) : null}

          {secondaryUserCampaigns.length > 0 ? (
            <details className="campaign-other-panel">
              <summary>Другие программы ({secondaryUserCampaigns.length})</summary>
              <div className="campaign-other-list">
                {secondaryUserCampaigns.map((campaign) => (
                  <CampaignMiniRow
                    key={campaign.id}
                    campaign={campaign}
                    isMutating={mutationDisabled}
                    onSelect={() => setSelectedPrimaryCampaignId(Number(campaign.id))}
                  />
                ))}
              </div>
            </details>
          ) : null}

          {emptyPersonalCampaigns ? (
            <PixelSurface frame="inset" padding="md" className="campaign-empty-state">
              <Sparkles size={17} />
              <PixelText as="p" readable size="sm" color="textMuted">
                Личных программ пока нет. Начните готовую программу или создайте свою.
              </PixelText>
            </PixelSurface>
          ) : null}
        </CampaignSection>

        <CampaignSection title="Начать готовую программу" className="campaign-intent-section--courses">
          {courseItems.length > 0 ? (
            <div className="campaign-course-grid">
              {courseItems.map((item) => (
                <CampaignCourseCard
                  key={`${item.kind}-${item.campaign.id}`}
                  item={item}
                  isMutating={mutationDisabled}
                  onOpen={onOpenCampaign}
                  onFork={onForkTemplate}
                  onRestore={onRestoreCampaign}
                />
              ))}
              {showReadyProgramEmptySlot ? (
                <CampaignReadyProgramEmptySlot slotCount={readyProgramEmptySlotCount} />
              ) : null}
            </div>
          ) : (
            <PixelSurface frame="inset" padding="md" className="campaign-empty-state campaign-empty-state--course">
              <BookOpen size={17} />
              <PixelText as="p" readable size="sm" color="textMuted">
                {templateCampaigns.length > 0 ? 'Все готовые программы уже в вашем списке.' : 'Готовые программы появятся здесь.'}
              </PixelText>
            </PixelSurface>
          )}
        </CampaignSection>

        <CampaignSection title="Создать свою программу" className="campaign-intent-section--create">
          <CampaignCreateWorkshop
            newCampaignName={newCampaignName}
            isMutating={mutationDisabled}
            onNewCampaignNameChange={onNewCampaignNameChange}
            onCreateCampaign={onCreateCampaign}
            onCreateCampaignDetailed={onCreateCampaignDetailed}
          />
        </CampaignSection>

        {archivedCampaigns.length > 0 ? (
          <details className="campaign-archive-panel">
            <summary>Архив программ ({archivedCampaigns.length})</summary>
            <div className="campaign-archive-list">
              {archivedCampaigns.map((campaign) => (
                <PixelSurface key={campaign.id} frame="inset" padding="sm" className="campaign-archive-item">
                  <div className="min-w-0">
                    <PixelText as="p" readable size="sm" title={campaign.name} className="truncate">
                      {campaign.name}
                    </PixelText>
                    <PixelText as="p" size="xs" color="textDim">
                      {campaignStatsLabel(campaign)}
                    </PixelText>
                  </div>
                  <PixelButton
                    tone="ghost"
                    onClick={() => onRestoreCampaign(campaign)}
                    disabled={isMutating}
                    aria-label={`Восстановить программу ${campaign.name}`}
                    style={{ minHeight: 32, padding: '6px 10px', gap: 6 }}
                  >
                    <RotateCcw size={14} /> Восстановить
                  </PixelButton>
                </PixelSurface>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </div>
  );
};
