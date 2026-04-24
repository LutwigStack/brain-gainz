import type { NodeCreatePayload } from '../types/app-shell';

interface BuildMapNodeCreatePayloadInput {
  skillId: number;
  existingNodeCount: number;
  position: {
    x: number;
    y: number;
  };
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

export const buildMapNodeCreatePayload = ({
  skillId,
  existingNodeCount,
  position,
  createdAt = new Date().toISOString(),
  nonce,
}: BuildMapNodeCreatePayloadInput): NodeCreatePayload => {
  const ordinal = Math.max(1, existingNodeCount + 1);

  return {
    skill_id: skillId,
    type: 'task',
    status: 'active',
    title: buildDefaultMapNodeTitle(existingNodeCount),
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
