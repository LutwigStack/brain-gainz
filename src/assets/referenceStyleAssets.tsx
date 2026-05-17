import campaignCrest from '../../assets/game/reference-style-first-batch/campaign/bgz-ref-campaign-cs-bachelor-computer-science-bachelor-crest.webp';
import algorithmsLandmark from '../../assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-algorithms-landmark.webp';
import cityCard from '../../assets/game/reference-style-first-batch/city/bgz-ref-city-cs-bachelor-core-cs-citadel-card.webp';
import databaseSystemsLandmark from '../../assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-database-systems-landmark.svg';
import dataStructuresLandmark from '../../assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-data-structures-landmark.webp';
import discreteMathLandmark from '../../assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-discrete-math-landmark.webp';
import programmingFundamentalsLandmark from '../../assets/game/reference-style-first-batch/map/bgz-ref-map-cs-bachelor-programming-fundamentals-landmark.webp';
import masteryAppliedIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-applied-icon.png';
import masteryRememberedIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-remembered-icon.png';
import masteryRetainedIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-retained-icon.png';
import masterySeenIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-seen-icon.png';
import masteryUnderstoodIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-understood-icon.png';
import masteryVerifiedIcon from '../../assets/game/reference-style-first-batch/mastery/bgz-ref-mastery-cs-bachelor-verified-icon.png';
import opponentBanner from '../../assets/game/reference-style-first-batch/opponent/bgz-ref-opponent-cs-bachelor-corvus-ai-banner.webp';
import racePortrait from '../../assets/game/reference-style-first-batch/race/bgz-ref-race-cs-bachelor-raven-strategist-portrait.webp';
import specializationEmblem from '../../assets/game/reference-style-first-batch/specialization/bgz-ref-specialization-cs-bachelor-core-cs-foundations-emblem.webp';
import taskAssessmentIcon from '../../assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-assessment-icon.png';
import taskDeferredIcon from '../../assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-deferred-icon.png';
import taskPracticeIcon from '../../assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-practice-icon.png';
import taskRecoveryIcon from '../../assets/game/reference-style-first-batch/task/bgz-ref-task-cs-bachelor-recovery-icon.png';
import assetManifest from '../../assets/game/asset-manifest.json';
import type { DailyTaskCardViewModel } from '../components/today-dashboard-model';
import type { DailyRunTaskOutcome, MasteryLevel } from '../types/app-shell';

export interface ReferenceAsset {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  fallback: string;
  targetSlots: string[];
}

interface ReferenceAssetManifestEntry {
  asset_id: string;
  alt: string;
  target_width: number;
  target_height: number;
  fallback: string;
  target_slots?: string[];
}

const referenceManifestEntries = assetManifest.assets as ReferenceAssetManifestEntry[];
const manifestEntryById = new Map(referenceManifestEntries.map((entry) => [entry.asset_id, entry]));

const acceptedAsset = (assetId: string, src: string): ReferenceAsset => {
  const entry = manifestEntryById.get(assetId);

  if (!entry) {
    throw new Error(`Missing reference asset manifest entry: ${assetId}`);
  }

  return {
    id: entry.asset_id,
    src,
    alt: entry.alt,
    width: entry.target_width,
    height: entry.target_height,
    fallback: entry.fallback,
    targetSlots: entry.target_slots ?? [],
  };
};

export const csBachelorReferenceAssets = {
  campaign: {
    crest: acceptedAsset('campaign.cs-bachelor.computer-science-bachelor.crest', campaignCrest),
  },
  specialization: {
    coreCsFoundations: acceptedAsset('specialization.cs-bachelor.core-cs-foundations.emblem', specializationEmblem),
  },
  race: {
    ravenStrategist: acceptedAsset('race.cs-bachelor.raven-strategist.portrait', racePortrait),
  },
  city: {
    coreCsCitadel: acceptedAsset('city.cs-bachelor.core-cs-citadel.card', cityCard),
  },
  opponent: {
    corvusAi: acceptedAsset('opponent.cs-bachelor.corvus-ai.banner', opponentBanner),
  },
  task: {
    practice: acceptedAsset('task.cs-bachelor.practice.icon', taskPracticeIcon),
    assessment: acceptedAsset('task.cs-bachelor.assessment.icon', taskAssessmentIcon),
    recovery: acceptedAsset('task.cs-bachelor.recovery.icon', taskRecoveryIcon),
    deferred: acceptedAsset('task.cs-bachelor.deferred.icon', taskDeferredIcon),
  },
  mastery: {
    seen: acceptedAsset('mastery.cs-bachelor.seen.icon', masterySeenIcon),
    understood: acceptedAsset('mastery.cs-bachelor.understood.icon', masteryUnderstoodIcon),
    remembered: acceptedAsset('mastery.cs-bachelor.remembered.icon', masteryRememberedIcon),
    applied: acceptedAsset('mastery.cs-bachelor.applied.icon', masteryAppliedIcon),
    verified: acceptedAsset('mastery.cs-bachelor.verified.icon', masteryVerifiedIcon),
    retained: acceptedAsset('mastery.cs-bachelor.retained.icon', masteryRetainedIcon),
  },
  map: {
    programmingFundamentals: acceptedAsset(
      'map.cs-bachelor.programming-fundamentals.landmark',
      programmingFundamentalsLandmark,
    ),
    discreteMath: acceptedAsset('map.cs-bachelor.discrete-math.landmark', discreteMathLandmark),
    dataStructures: acceptedAsset('map.cs-bachelor.data-structures.landmark', dataStructuresLandmark),
    algorithms: acceptedAsset('map.cs-bachelor.algorithms.landmark', algorithmsLandmark),
    databaseSystems: acceptedAsset('map.cs-bachelor.database-systems.landmark', databaseSystemsLandmark),
  },
} as const satisfies Record<string, unknown>;

interface NamedEntity {
  key?: string | null;
  slug?: string | null;
  name?: string | null;
  title?: string | null;
}

const normalizedText = (value: unknown) => String(value ?? '').trim().toLowerCase();
const includesAny = (value: unknown, needles: string[]) => {
  const normalized = normalizedText(value);
  return needles.some((needle) => normalized.includes(needle));
};

export const isCsBachelorCampaign = (campaign: NamedEntity | null | undefined) =>
  includesAny(campaign?.slug, ['cs-bachelor']) ||
  includesAny(campaign?.key, ['cs-bachelor']) ||
  includesAny(campaign?.name, ['computer science bachelor']);

export const isCoreCsFoundations = (specialization: NamedEntity | null | undefined) =>
  includesAny(specialization?.key, ['core-cs-foundations']) ||
  includesAny(specialization?.slug, ['core-cs-foundations']) ||
  includesAny(specialization?.name, ['core cs foundations']);

export const resolveTaskAsset = (
  stateOrSource?: DailyTaskCardViewModel['state'] | string | null,
  outcome?: DailyRunTaskOutcome | null,
): ReferenceAsset => {
  if (outcome === 'deferred' || outcome === 'skipped') {
    return csBachelorReferenceAssets.task.deferred;
  }

  if (outcome === 'failed' || stateOrSource === 'recovery' || stateOrSource === 'weak_spot' || stateOrSource === 'recovery_retry') {
    return csBachelorReferenceAssets.task.recovery;
  }

  if (stateOrSource === 'locked' || stateOrSource === 'future') {
    return csBachelorReferenceAssets.task.deferred;
  }

  if (stateOrSource === 'due_check' || stateOrSource === 'ready_check' || stateOrSource === 'assessment') {
    return csBachelorReferenceAssets.task.assessment;
  }

  return csBachelorReferenceAssets.task.practice;
};

export const resolveMasteryAsset = (level: MasteryLevel | 'confirmed' | string): ReferenceAsset => {
  if (level === 'seen') {
    return csBachelorReferenceAssets.mastery.seen;
  }
  if (level === 'understood') {
    return csBachelorReferenceAssets.mastery.understood;
  }
  if (level === 'remembered') {
    return csBachelorReferenceAssets.mastery.remembered;
  }
  if (level === 'applied') {
    return csBachelorReferenceAssets.mastery.applied;
  }
  if (level === 'confirmed' || level === 'verified') {
    return csBachelorReferenceAssets.mastery.verified;
  }
  return csBachelorReferenceAssets.mastery.retained;
};

export const resolveRouteLandmarkAsset = (title?: string | null): ReferenceAsset | null => {
  const normalized = normalizedText(title);

  if (normalized.includes('programming')) {
    return csBachelorReferenceAssets.map.programmingFundamentals;
  }
  if (normalized.includes('discrete') || normalized.includes('math')) {
    return csBachelorReferenceAssets.map.discreteMath;
  }
  if (normalized.includes('data structures') || normalized.includes('structures')) {
    return csBachelorReferenceAssets.map.dataStructures;
  }
  if (normalized.includes('algorithms') || normalized.includes('algorithm')) {
    return csBachelorReferenceAssets.map.algorithms;
  }
  if (normalized.includes('database') || normalized.includes('databases') || normalized.includes('sql')) {
    return csBachelorReferenceAssets.map.databaseSystems;
  }

  return null;
};
