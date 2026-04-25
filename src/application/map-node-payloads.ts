import type { NodeCreatePayload } from '../types/app-shell';

interface BuildMapNodeCreatePayloadInput {
  skillId: number;
  existingNodeCount: number;
  position: {
    x: number;
    y: number;
  };
  title?: string;
  createdAt?: string;
  nonce?: string;
}

const buildTimestampSuffix = (createdAt: string) => {
  const compact = createdAt.replace(/\D/g, '');
  return compact.slice(0, 17) || 'seed';
};

const buildSlugNonce = (nonce?: string) => {
  if (nonce) {
    return nonce;
  }

  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }

  return Math.random().toString(36).slice(2, 10) || 'fallback';
};

const roundWorldPosition = (value: number) => Math.round(value);

export const buildDefaultMapNodeTitle = (existingNodeCount: number) =>
  `Новый узел ${Math.max(1, existingNodeCount + 1)}`;

const normalizeNodeTitle = (title: string | undefined, existingNodeCount: number) => {
  const trimmed = title?.trim();
  return trimmed || buildDefaultMapNodeTitle(existingNodeCount);
};

export const buildMapNodeCreatePayload = ({
  skillId,
  existingNodeCount,
  position,
  title,
  createdAt = new Date().toISOString(),
  nonce,
}: BuildMapNodeCreatePayloadInput): NodeCreatePayload => {
  const ordinal = Math.max(1, existingNodeCount + 1);
  const resolvedTitle = normalizeNodeTitle(title, existingNodeCount);

  return {
    skill_id: skillId,
    type: 'task',
    status: 'active',
    title: resolvedTitle,
    slug: `node-${skillId}-${ordinal}-${buildTimestampSuffix(createdAt)}-${buildSlugNonce(nonce)}`,
    summary: undefined,
    completion_criteria: null,
    links: null,
    reward: null,
    x: roundWorldPosition(position.x),
    y: roundWorldPosition(position.y),
    importance: 'medium',
  };
};
