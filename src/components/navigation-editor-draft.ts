import type {
  NodeDuplicatePayload,
  NodeFocusSnapshot,
  NodeUpdatePayload,
} from '../types/app-shell';

export interface NodeEditorDraft {
  nodeId: number;
  theme: string;
  title: string;
  summary: string;
  type: string;
  status: string;
  completionCriteria: string;
  nextStep: string;
  links: string;
  reward: string;
  isArchived: boolean;
  updatedAt: string;
}

const normalizeTextValue = (value: string | null | undefined) => value?.trim() || '';

const normalizeStatus = (status: string) => {
  if (status === 'doing') {
    return 'active';
  }

  if (status === 'completed') {
    return 'done';
  }

  return status;
};

const buildLinksSuggestion = (focus: NodeFocusSnapshot) => {
  const dependencyLines = focus.dependencies.map((item) => `Depends on: ${item.title}`);
  const dependentLines = focus.dependents.map((item) => `Unlocks: ${item.title}`);

  return [...dependencyLines, ...dependentLines].join('\n');
};

const buildCompletionCriteriaSuggestion = (focus: NodeFocusSnapshot) => {
  const openActions = focus.actions.filter((action) => action.status !== 'done');

  if (openActions.length === 0) {
    return focus.selectedAction?.title ?? 'Node is complete when all open steps are closed.';
  }

  return openActions.map((action) => `- ${action.title}`).join('\n');
};

const buildRewardSuggestion = (focus: NodeFocusSnapshot) => {
  if (focus.dependents.length > 0) {
    return `Unlocks next: ${focus.dependents.map((item) => item.title).join(', ')}`;
  }

  if (focus.reviewState?.current_risk) {
    return `Reduces risk: ${focus.reviewState.current_risk}`;
  }

  return '';
};

export const getNodeEditorCompletionCriteriaPreview = (
  focus: NodeFocusSnapshot,
  draft: Pick<NodeEditorDraft, 'completionCriteria'> | null = null,
) =>
  normalizeTextValue(draft?.completionCriteria) ||
  normalizeTextValue(focus.node.completion_criteria) ||
  buildCompletionCriteriaSuggestion(focus);

export const getNodeEditorLinksPreview = (
  focus: NodeFocusSnapshot,
  draft: Pick<NodeEditorDraft, 'links'> | null = null,
) =>
  normalizeTextValue(draft?.links) ||
  normalizeTextValue(focus.node.links) ||
  buildLinksSuggestion(focus);

export const getNodeEditorRewardPreview = (
  focus: NodeFocusSnapshot,
  draft: Pick<NodeEditorDraft, 'reward'> | null = null,
) =>
  normalizeTextValue(draft?.reward) ||
  normalizeTextValue(focus.node.reward) ||
  buildRewardSuggestion(focus);

export const createNodeEditorDraft = (focus: NodeFocusSnapshot): NodeEditorDraft => ({
  nodeId: focus.node.id,
  theme: `${focus.node.sphere_name} / ${focus.node.direction_name} / ${focus.node.skill_name}`,
  title: focus.node.title,
  summary: focus.node.summary ?? '',
  type: focus.node.type,
  status: normalizeStatus(focus.node.status),
  completionCriteria: normalizeTextValue(focus.node.completion_criteria),
  nextStep:
    focus.selectedAction?.title ??
    focus.actions.find((action) => action.status !== 'done')?.title ??
    '',
  links: normalizeTextValue(focus.node.links),
  reward: normalizeTextValue(focus.node.reward),
  isArchived: focus.node.status === 'archived',
  updatedAt: new Date().toISOString(),
});

export const hasNodeEditorPersistedChanges = (
  focus: NodeFocusSnapshot,
  draft: NodeEditorDraft,
) =>
  draft.title.trim() !== focus.node.title ||
  normalizeTextValue(draft.summary) !== normalizeTextValue(focus.node.summary) ||
  normalizeTextValue(draft.completionCriteria) !== normalizeTextValue(focus.node.completion_criteria) ||
  normalizeTextValue(draft.links) !== normalizeTextValue(focus.node.links) ||
  normalizeTextValue(draft.reward) !== normalizeTextValue(focus.node.reward) ||
  draft.type !== focus.node.type ||
  normalizeStatus(draft.status) !== normalizeStatus(focus.node.status) ||
  draft.isArchived !== (focus.node.status === 'archived');

export const buildNodeEditorUpdatePayload = (
  focus: NodeFocusSnapshot,
  draft: NodeEditorDraft,
): NodeUpdatePayload => ({
  title: draft.title.trim() || focus.node.title,
  summary: normalizeTextValue(draft.summary) || null,
  completion_criteria: normalizeTextValue(draft.completionCriteria) || null,
  links: normalizeTextValue(draft.links) || null,
  reward: normalizeTextValue(draft.reward) || null,
  type: draft.type,
  status: draft.isArchived ? 'archived' : draft.status,
});

export const buildNodeEditorDuplicatePayload = (
  draft: NodeEditorDraft,
): NodeDuplicatePayload => ({
  title: `${draft.title.trim() || 'Untitled node'} (copy)`,
  summary: normalizeTextValue(draft.summary) || null,
  completion_criteria: normalizeTextValue(draft.completionCriteria) || null,
  links: normalizeTextValue(draft.links) || null,
  reward: normalizeTextValue(draft.reward) || null,
});

export const canDuplicateNodeEditorDraft = (
  focus: NodeFocusSnapshot,
  draft: NodeEditorDraft,
) =>
  draft.type === focus.node.type &&
  normalizeStatus(draft.status) === normalizeStatus(focus.node.status) &&
  draft.isArchived === (focus.node.status === 'archived');
