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
  checkMetadata: CheckMetadataDraft;
  isArchived: boolean;
  updatedAt: string;
}

export type CheckMetadataKind =
  | 'none'
  | 'exact'
  | 'number'
  | 'contains'
  | 'checklist'
  | 'manual_strict'
  | 'llm_assisted'
  | 'raw';

export interface CheckMetadataChecklistItemDraft {
  id: string;
  label: string;
  required: boolean;
}

export interface CheckMetadataDraft {
  kind: CheckMetadataKind;
  taskId: string;
  prompt: string;
  expectedAnswer: string;
  caseSensitive: boolean;
  expectedNumber: string;
  tolerance: string;
  requiredTerms: string;
  checklistItems: CheckMetadataChecklistItemDraft[];
  expectedSummary: string;
  rubric: string;
  raw: string;
  invalidRaw: boolean;
  unsupportedRaw: boolean;
}

const normalizeTextValue = (value: string | null | undefined) => value?.trim() || '';

const defaultAssessmentTaskId = (focus: NodeFocusSnapshot) =>
  focus.mastery?.check?.taskId ?? `node:${focus.node.id}:assessment`;

export const emptyCheckMetadataDraft = (taskId: string): CheckMetadataDraft => ({
  kind: 'none',
  taskId,
  prompt: '',
  expectedAnswer: '',
  caseSensitive: false,
  expectedNumber: '',
  tolerance: '',
  requiredTerms: '',
  checklistItems: [],
  expectedSummary: '',
  rubric: '',
  raw: '',
  invalidRaw: false,
  unsupportedRaw: false,
});

const slugKey = (value: string, fallback: string) => {
  const slug = value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
};

const parseJsonObject = (value: string | null | undefined) => {
  if (!normalizeTextValue(value)) {
    return null;
  }

  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return undefined;
  }
};

const parseFiniteNumber = (value: string | null | undefined) => {
  const normalized = normalizeTextValue(value);
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const pickTaskFromMetadata = (metadata: Record<string, unknown>, taskId: string) => {
  const tasks = metadata.tasks ?? metadata.assessments;
  if (tasks && typeof tasks === 'object' && !Array.isArray(tasks)) {
    const task = (tasks as Record<string, unknown>)[taskId];
    return task && typeof task === 'object' && !Array.isArray(task)
      ? (task as Record<string, unknown>)
      : null;
  }

  return metadata;
};

const metadataTaskContainerKey = (metadata: Record<string, unknown>) => {
  if (metadata.tasks && typeof metadata.tasks === 'object' && !Array.isArray(metadata.tasks)) {
    return 'tasks';
  }
  if (metadata.assessments && typeof metadata.assessments === 'object' && !Array.isArray(metadata.assessments)) {
    return 'assessments';
  }
  return 'tasks';
};

export const parseCheckMetadataDraft = (
  rawMetadata: string | null | undefined,
  taskId: string,
): CheckMetadataDraft => {
  const base = emptyCheckMetadataDraft(taskId);
  const raw = normalizeTextValue(rawMetadata);
  if (!raw) {
    return base;
  }

  const parsed = parseJsonObject(raw);
  if (parsed === undefined || parsed === null) {
    return { ...base, kind: 'raw', raw, invalidRaw: true };
  }

  const task = pickTaskFromMetadata(parsed as Record<string, unknown>, taskId);
  if (!task) {
    return { ...base, kind: 'raw', raw, unsupportedRaw: true };
  }

  const strictType = String(task.strict_check_type ?? task.strictCheckType ?? '');
  const checkMethod = String(task.check_method ?? task.checkMethod ?? '');
  const prompt = normalizeTextValue(String(task.prompt ?? task.question ?? task.title ?? ''));
  const common = { ...base, prompt, raw };

  if (strictType === 'exact') {
    return {
      ...common,
      kind: 'exact',
      expectedAnswer: normalizeTextValue(String(task.expected_answer ?? task.expectedAnswer ?? '')),
      caseSensitive: Boolean(task.case_sensitive ?? task.caseSensitive),
    };
  }
  if (strictType === 'number') {
    return {
      ...common,
      kind: 'number',
      expectedNumber: normalizeTextValue(String(task.expected_number ?? task.expectedNumber ?? task.expected_answer ?? '')),
      tolerance: normalizeTextValue(String(task.tolerance ?? '')),
    };
  }
  if (strictType === 'contains') {
    const terms = ([] as unknown[])
      .concat((task.required_terms ?? task.requiredTerms ?? task.terms ?? []) as unknown[])
      .filter((item) => item != null && String(item).trim() !== '')
      .map(String);
    return { ...common, kind: 'contains', requiredTerms: terms.join('\n') };
  }
  if (strictType === 'checklist') {
    const items = Array.isArray(task.items) ? task.items : [];
    return {
      ...common,
      kind: 'checklist',
      checklistItems: items.map((item, index) => {
        const source = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
        const label = normalizeTextValue(String(source.label ?? source.title ?? source.id ?? source.key ?? `Item ${index + 1}`));
        return {
          id: normalizeTextValue(String(source.id ?? source.key ?? '')) || slugKey(label, String(index)),
          label,
          required: source.required !== false,
        };
      }),
    };
  }
  if (strictType === 'manual_strict') {
    return {
      ...common,
      kind: 'manual_strict',
      expectedSummary: normalizeTextValue(String(task.expected_summary ?? task.expectedSummary ?? task.expected_answer ?? '')),
    };
  }
  if (checkMethod === 'llm_assisted') {
    return {
      ...common,
      kind: 'llm_assisted',
      rubric: normalizeTextValue(String(task.rubric ?? task.expected_summary ?? task.expectedSummary ?? '')),
    };
  }

  return { ...base, kind: 'raw', raw, unsupportedRaw: true };
};

const serializeTask = (draft: CheckMetadataDraft) => {
  const prompt = normalizeTextValue(draft.prompt);
  if (draft.kind === 'exact') {
    const expectedAnswer = normalizeTextValue(draft.expectedAnswer);
    if (!expectedAnswer) {
      return null;
    }
    return {
      strict_check_type: 'exact',
      ...(prompt ? { prompt } : {}),
      expected_answer: expectedAnswer,
      ...(draft.caseSensitive ? { case_sensitive: true } : {}),
    };
  }
  if (draft.kind === 'number') {
    const expectedNumber = parseFiniteNumber(draft.expectedNumber);
    const tolerance = parseFiniteNumber(draft.tolerance);
    if (expectedNumber == null) {
      return null;
    }
    return {
      strict_check_type: 'number',
      ...(prompt ? { prompt } : {}),
      ...(expectedNumber != null ? { expected_number: expectedNumber } : {}),
      ...(tolerance != null ? { tolerance } : {}),
    };
  }
  if (draft.kind === 'contains') {
    const requiredTerms = draft.requiredTerms
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (requiredTerms.length === 0) {
      return null;
    }
    return {
      strict_check_type: 'contains',
      ...(prompt ? { prompt } : {}),
      required_terms: requiredTerms,
    };
  }
  if (draft.kind === 'checklist') {
    const items = draft.checklistItems
      .map((item, index) => {
        const label = normalizeTextValue(item.label);
        return {
          id: normalizeTextValue(item.id) || slugKey(label, String(index)),
          label,
          required: item.required !== false,
        };
      })
      .filter((item) => item.label);
    if (!items.some((item) => item.required)) {
      return null;
    }
    return {
      strict_check_type: 'checklist',
      ...(prompt ? { prompt } : {}),
      items,
    };
  }
  if (draft.kind === 'manual_strict') {
    return {
      strict_check_type: 'manual_strict',
      ...(prompt ? { prompt } : {}),
      expected_summary: normalizeTextValue(draft.expectedSummary),
    };
  }
  if (draft.kind === 'llm_assisted') {
    return {
      check_method: 'llm_assisted',
      ...(prompt ? { prompt } : {}),
      rubric: normalizeTextValue(draft.rubric),
    };
  }
  return null;
};

const serializeRawMetadataWithoutTask = (draft: CheckMetadataDraft) => {
  const parsed = parseJsonObject(draft.raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const root = { ...(parsed as Record<string, unknown>) };
  const containerKey = metadataTaskContainerKey(root);
  const existingTasks = root[containerKey];
  if (!existingTasks || typeof existingTasks !== 'object' || Array.isArray(existingTasks)) {
    return null;
  }

  const tasks = { ...(existingTasks as Record<string, unknown>) };
  delete tasks[draft.taskId];
  if (Object.keys(tasks).length === 0) {
    return null;
  }

  root[containerKey] = tasks;
  return root;
};

const mergeSerializedTaskIntoRawMetadata = (draft: CheckMetadataDraft, task: Record<string, unknown>) => {
  const parsed = parseJsonObject(draft.raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      tasks: {
        [draft.taskId]: task,
      },
    };
  }

  const root = { ...(parsed as Record<string, unknown>) };
  const containerKey = metadataTaskContainerKey(root);
  const existingTasks = root[containerKey];
  if (existingTasks && typeof existingTasks === 'object' && !Array.isArray(existingTasks)) {
    root[containerKey] = {
      ...(existingTasks as Record<string, unknown>),
      [draft.taskId]: task,
    };
    return root;
  }

  return {
    tasks: {
      [draft.taskId]: task,
    },
  };
};

export const serializeCheckMetadataDraft = (draft: CheckMetadataDraft): string | null => {
  if (draft.kind === 'none') {
    return null;
  }
  if (draft.kind === 'raw') {
    return normalizeTextValue(draft.raw) || null;
  }

  const task = serializeTask(draft);
  if (!task) {
    const rawWithoutTask = serializeRawMetadataWithoutTask(draft);
    return rawWithoutTask ? JSON.stringify(rawWithoutTask) : null;
  }

  return JSON.stringify(mergeSerializedTaskIntoRawMetadata(draft, task));
};

export const getCheckMetadataPreview = (draft: CheckMetadataDraft) => {
  if (draft.kind === 'none') return 'Проверка не задана.';
  if (draft.kind === 'raw') {
    return draft.invalidRaw ? 'Исходный JSON: ошибка разбора.' : 'Исходный JSON: сохранится без изменений.';
  }
  if (draft.kind === 'exact') return `Точный ответ: ${draft.expectedAnswer || 'не задан'}`;
  if (draft.kind === 'number') return `Число: ${draft.expectedNumber || 'не задано'} ± ${draft.tolerance || '0'}`;
  if (draft.kind === 'contains') return `Термины: ${draft.requiredTerms.split(/\n|,/).filter((item) => item.trim()).length}`;
  if (draft.kind === 'checklist') return `Чек-лист: ${draft.checklistItems.length}`;
  if (draft.kind === 'manual_strict') return `Ручная строгая: ${draft.expectedSummary || 'критерий не задан'}`;
  return `ИИ-проверка: ${draft.rubric || 'критерии не заданы'}`;
};

export const getCheckMetadataValidationMessage = (draft: CheckMetadataDraft) => {
  if (draft.kind === 'exact' && !normalizeTextValue(draft.expectedAnswer)) {
    return 'Добавьте ожидаемый точный ответ, иначе точная проверка не сможет зачесть попытку.';
  }
  if (draft.kind === 'number' && parseFiniteNumber(draft.expectedNumber) == null) {
    return 'Добавьте ожидаемое число, иначе числовая проверка не сможет зачесть попытку.';
  }
  if (
    draft.kind === 'contains' &&
    draft.requiredTerms
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean).length === 0
  ) {
    return 'Добавьте хотя бы один обязательный термин, иначе проверка по терминам не сможет зачесть попытку.';
  }
  if (
    draft.kind === 'checklist' &&
    !draft.checklistItems
      .map((item, index) => ({
        id: normalizeTextValue(item.id) || slugKey(normalizeTextValue(item.label), String(index)),
        label: normalizeTextValue(item.label),
        required: item.required !== false,
      }))
      .filter((item) => item.label)
      .some((item) => item.required)
  ) {
    return 'Добавьте хотя бы один обязательный пункт чек-листа, иначе проверка по чек-листу не сможет зачесть попытку.';
  }
  return null;
};

export const getCheckMetadataCriterionLabel = (draft: CheckMetadataDraft) => {
  if (draft.kind === 'exact') return 'Ожидаемый точный ответ';
  if (draft.kind === 'number') return 'Ожидаемое число и допуск';
  if (draft.kind === 'contains') return 'Обязательные элементы ответа';
  if (draft.kind === 'checklist') return 'Пункты чек-листа';
  if (draft.kind === 'manual_strict') return 'Критерий внешней проверки';
  if (draft.kind === 'llm_assisted') return 'Критерии для ИИ-проверки';
  return 'Критерий';
};

export const getCheckMetadataCriterionHint = (draft: CheckMetadataDraft) => {
  if (draft.kind === 'exact') return 'Пользователь вводит ответ, который должен совпасть с этим значением.';
  if (draft.kind === 'number') return 'Пользователь вводит число; проверка принимает значение в пределах допуска.';
  if (draft.kind === 'contains') return 'Пользователь вводит текст, где должны присутствовать все перечисленные термины.';
  if (draft.kind === 'checklist') return 'Пользователь отмечает выполненные пункты; обязательные пункты нужны для зачета.';
  if (draft.kind === 'manual_strict') return 'Зачет требует подтверждения внешней строгой проверки; служебные значения можно хранить в технических деталях попытки.';
  if (draft.kind === 'llm_assisted') return 'Зачет требует результата ИИ-проверки; служебные значения можно хранить в технических деталях попытки.';
  return 'Выберите тип проверки, чтобы задать критерий.';
};

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
  checkMetadata: parseCheckMetadataDraft(focus.node.check_metadata, defaultAssessmentTaskId(focus)),
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
  normalizeTextValue(serializeCheckMetadataDraft(draft.checkMetadata)) !== normalizeTextValue(focus.node.check_metadata) ||
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
  check_metadata: serializeCheckMetadataDraft(draft.checkMetadata),
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
  check_metadata: serializeCheckMetadataDraft(draft.checkMetadata),
});

export const canDuplicateNodeEditorDraft = (
  focus: NodeFocusSnapshot,
  draft: NodeEditorDraft,
) =>
  draft.type === focus.node.type &&
  normalizeStatus(draft.status) === normalizeStatus(focus.node.status) &&
  draft.isArchived === (focus.node.status === 'archived');
