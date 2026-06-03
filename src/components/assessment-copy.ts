export type AssessmentCheckMethod = 'strict' | 'llm_assisted';

export type AssessmentChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

type AssessmentCopyAudience = 'learner' | 'author';

type CheckTypeInput = {
  strictCheckType?: string | null;
  resolvedCheckMethod: AssessmentCheckMethod;
};

type ExpectationInput = CheckTypeInput & {
  isChecklistCheck: boolean;
  checklistItems: AssessmentChecklistItem[];
  expectedSummary?: string | null;
  requiredTerms?: string[];
  audience?: AssessmentCopyAudience;
};

type AnswerInputCopy = {
  label: string;
  placeholder: string;
  helperText: string;
};

type AnswerInputCopyInput = CheckTypeInput & {
  audience?: AssessmentCopyAudience;
};

type AttemptResultCopyInput = {
  passed: boolean;
  targetMasteryLabel: string;
};

type FeedbackSummaryInput = CheckTypeInput & {
  passed: boolean;
  feedbackSummary?: string | null;
  audience?: AssessmentCopyAudience;
};

type PrimaryActionCopyInput = {
  pendingAssessment: boolean;
  isAutoStrictCheck: boolean;
};

type FailedAttemptStateInput = {
  isAutoStrictCheck: boolean;
  isChecklistCheck?: boolean;
  hasChecklistSelection?: boolean;
  pendingAssessment: boolean;
  pendingSelfMark?: boolean;
  isEditorArchived?: boolean;
  hasAnswer: boolean;
  hasVerifierEvidence: boolean;
  resolvedCheckMethod: AssessmentCheckMethod;
};

type ValidationInput = {
  pendingAssessment: boolean;
  pendingSelfMark?: boolean;
  isEditorArchived?: boolean;
  isAutoStrictCheck: boolean;
  isChecklistCheck: boolean;
  canSubmitAssessmentPass: boolean;
  checkTypeLabel: string;
  hasAnswer: boolean;
  hasVerifierEvidence: boolean;
  resolvedCheckMethod: AssessmentCheckMethod;
  requiredChecklistItemsCount?: number;
  completedRequiredChecklistItemsCount?: number;
};

const pluralizeRussianCount = (count: number, forms: [string, string, string]) => {
  const absoluteCount = Math.abs(count);
  const lastTwoDigits = absoluteCount % 100;
  const lastDigit = absoluteCount % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return forms[2];
  if (lastDigit === 1) return forms[0];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[1];
  return forms[2];
};

export const getAssessmentCheckTypeLabel = ({ strictCheckType, resolvedCheckMethod }: CheckTypeInput) => {
  if (strictCheckType === 'exact') return 'Точный ответ';
  if (strictCheckType === 'number') return 'Число';
  if (strictCheckType === 'contains') return 'Текст с обязательными терминами';
  if (strictCheckType === 'checklist') return 'Список пунктов';
  if (resolvedCheckMethod === 'strict') return 'Подтверждение результата';
  return 'ИИ-проверка';
};

export const getAssessmentExpectedInputText = ({
  isChecklistCheck,
  checklistItems,
  strictCheckType,
  expectedSummary,
  requiredTerms = [],
  resolvedCheckMethod,
  audience = 'learner',
}: ExpectationInput) => {
  if (isChecklistCheck) {
    const requiredCount = checklistItems.filter((item) => item.required).length;
    return `Отметьте пункты, которые уже получились. Нужно ${requiredCount} из ${checklistItems.length}.`;
  }

  if (strictCheckType === 'exact') {
    if (audience === 'learner') return 'Введите ответ без подсказки.';
    return `Введите ответ, который должен совпасть${expectedSummary ? `: ${expectedSummary}` : '.'}`;
  }

  if (strictCheckType === 'number') {
    if (audience === 'learner') return 'Введите число без лишнего текста.';
    return `Введите число${expectedSummary ? `: ${expectedSummary}` : ''}.`;
  }

  if (strictCheckType === 'contains') {
    if (audience === 'learner') return 'Напишите ответ своими словами.';
    return `Введите ответ с обязательными элементами: ${requiredTerms.join(', ') || 'элементы не заданы'}.`;
  }

  if (resolvedCheckMethod === 'strict') {
    return 'Добавьте результат, по которому видно, что работа готова.';
  }

  return 'Добавьте ответ или коротко объясните, почему работа готова.';
};

export const getAssessmentAnswerInputCopy = ({
  strictCheckType,
  resolvedCheckMethod,
  audience = 'learner',
}: AnswerInputCopyInput): AnswerInputCopy => {
  if (strictCheckType === 'exact') {
    if (audience === 'learner') {
      return {
        label: 'Ваш ответ',
        placeholder: 'Введите один итоговый ответ',
        helperText: 'Без вариантов и пояснений.',
      };
    }

    return {
      label: 'Ответ для точной проверки',
      placeholder: 'Введите один ответ так, как он должен быть зачтен',
      helperText: 'Проверка сравнит ответ с ожидаемым значением.',
    };
  }

  if (strictCheckType === 'number') {
    if (audience === 'learner') {
      return {
        label: 'Число',
        placeholder: 'Введите только число',
        helperText: 'Без единиц измерения и лишнего текста.',
      };
    }

    return {
      label: 'Число для проверки',
      placeholder: 'Введите число без лишнего текста',
      helperText: 'Проверка учтет допустимую погрешность, если она задана.',
    };
  }

  if (strictCheckType === 'contains') {
    if (audience === 'learner') {
      return {
        label: 'Ответ',
        placeholder: 'Напишите ответ целиком',
        helperText: 'Сформулируйте своими словами.',
      };
    }

    return {
      label: 'Ответ с обязательными терминами',
      placeholder: 'Напишите ответ так, чтобы в нем были все обязательные термины',
      helperText: 'Проверка ищет обязательные элементы в тексте ответа.',
    };
  }

  if (resolvedCheckMethod === 'strict') {
    return {
      label: 'Ответ или артефакт',
      placeholder: 'Коротко: ссылка, решение, формула или результат работы',
      helperText: 'Когда все готово, сохраните результат.',
    };
  }

  return {
    label: 'Ответ или объяснение',
    placeholder: 'Коротко: ответ, ход решения или ссылка на работу',
    helperText: 'Когда ответ готов, сохраните результат.',
  };
};

export const getAssessmentEvidenceHint = ({
  hasVisibleEvidence,
  hasTechnicalResultId,
  audience = 'learner',
}: {
  hasVisibleEvidence: boolean;
  hasTechnicalResultId: boolean;
  audience?: 'learner' | 'author';
}) => {
  if (hasVisibleEvidence) {
    return audience === 'author'
      ? 'Подтверждение заполнено. Попытку можно засчитать.'
      : 'Объяснение добавлено. Теперь можно сохранить результат.';
  }

  if (hasTechnicalResultId) {
    return audience === 'author'
      ? 'Служебное подтверждение заполнено. Попытку можно засчитать; объяснение можно оставить пустым.'
      : 'Можно сохранить результат. Короткое объяснение поможет понять его позже.';
  }

  return audience === 'author'
    ? 'Для зачета добавьте короткое объяснение. Служебные детали можно оставить пустыми.'
    : 'Коротко напишите, что получилось и почему этого достаточно.';
};

export const getAssessmentFeedbackSummary = ({
  strictCheckType,
  resolvedCheckMethod,
  passed,
  feedbackSummary,
  audience = 'learner',
}: FeedbackSummaryInput) => {
  const trimmedFeedback = feedbackSummary?.trim() ?? '';

  if (audience === 'author') return trimmedFeedback;

  if (strictCheckType === 'contains' && resolvedCheckMethod === 'strict') {
    return passed ? 'Ответ зачтен.' : 'Ответ пока не зачтен. Попробуйте дополнить формулировку.';
  }

  return trimmedFeedback;
};

export const getAssessmentValidationState = ({
  pendingAssessment,
  pendingSelfMark = false,
  isEditorArchived = false,
  isAutoStrictCheck,
  isChecklistCheck,
  canSubmitAssessmentPass,
  checkTypeLabel,
  hasAnswer,
  hasVerifierEvidence,
  resolvedCheckMethod,
  requiredChecklistItemsCount = 0,
  completedRequiredChecklistItemsCount = 0,
}: ValidationInput) => {
  if (pendingAssessment) {
    return {
      tone: 'accent' as const,
      ready: false,
      message: 'Сохраняю попытку…',
    };
  }

  if (pendingSelfMark) {
    return {
      tone: 'accent' as const,
      ready: false,
      message: 'Сначала дождитесь самооценки.',
    };
  }

  if (isEditorArchived) {
    return {
      tone: 'accent' as const,
      ready: false,
      message: 'Узел в архиве. Восстановите его, чтобы сохранить попытку.',
    };
  }

  if (isAutoStrictCheck) {
    if (canSubmitAssessmentPass) {
      return {
        tone: 'success' as const,
        ready: true,
        message: 'Готово. Нажмите «Проверить ответ».',
      };
    }

    return {
      tone: 'accent' as const,
      ready: false,
      message: isChecklistCheck
        ? requiredChecklistItemsCount > 0
          ? `Осталось отметить ${Math.max(0, requiredChecklistItemsCount - completedRequiredChecklistItemsCount)} ${pluralizeRussianCount(
              Math.max(0, requiredChecklistItemsCount - completedRequiredChecklistItemsCount),
              ['пункт', 'пункта', 'пунктов'],
            )}.`
          : 'Отметьте хотя бы один пункт.'
        : `Введите ответ: ${checkTypeLabel.toLocaleLowerCase()}.`,
    };
  }

  if (hasVerifierEvidence) {
    return {
      tone: 'success' as const,
      ready: true,
      message: 'Готово. Можно сохранить результат.',
    };
  }

  return {
    tone: 'accent' as const,
    ready: false,
    message: hasAnswer
      ? 'Добавьте короткое объяснение, чтобы сохранить результат.'
      : resolvedCheckMethod === 'strict'
        ? 'Добавьте ответ или результат работы.'
        : 'Добавьте ответ или результат работы.',
  };
};

export const getAssessmentAttemptResultCopy = ({ passed, targetMasteryLabel }: AttemptResultCopyInput) => ({
  status: passed ? 'Зачтено' : 'Не зачтено',
  message: passed
    ? `Прогресс обновлен до «${targetMasteryLabel}».`
    : 'Попытка сохранена. Прогресс и XP не изменились.',
});

export const getAssessmentPrimaryActionLabel = ({
  pendingAssessment,
  isAutoStrictCheck,
}: PrimaryActionCopyInput) => {
  if (pendingAssessment) return 'Проверяю…';
  return isAutoStrictCheck ? 'Проверить ответ' : 'Сохранить результат';
};

export const getAssessmentFailedAttemptState = ({
  isAutoStrictCheck,
  isChecklistCheck = false,
  hasChecklistSelection = false,
  pendingAssessment,
  pendingSelfMark = false,
  isEditorArchived = false,
  hasAnswer,
  hasVerifierEvidence,
}: FailedAttemptStateInput) => {
  if (isAutoStrictCheck && !isChecklistCheck) {
    return {
      visible: false,
      disabled: true,
      message: 'Неверный ответ сохранится как попытка.',
    };
  }

  if (isEditorArchived) {
    return {
      visible: true,
      disabled: true,
      message: 'Узел в архиве. Восстановите его, чтобы сохранить попытку.',
    };
  }

  if (pendingAssessment || pendingSelfMark) {
    return {
      visible: true,
      disabled: true,
      message: 'Сохраняю текущее действие…',
    };
  }

  if (isAutoStrictCheck && isChecklistCheck) {
    return {
      visible: true,
      disabled: false,
      message: hasChecklistSelection
        ? 'Сохранить как не зачтено. Отмеченные пункты останутся в попытке, XP не изменится.'
        : 'Сохранить как не зачтено. Отмеченных пунктов нет, XP не изменится.',
    };
  }

  if (!hasAnswer && !hasVerifierEvidence) {
    return {
      visible: true,
      disabled: true,
      message: 'Добавьте ответ или результат работы.',
    };
  }

  return {
    visible: true,
    disabled: false,
    message: 'Сохранить без зачета. XP не изменится.',
  };
};

export const getAssessmentResultIdLabel = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'ID результата проверки' : 'ID результата ИИ';

export const getAssessmentResultIdPlaceholder = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'strict_result_id / checker_run_id' : 'llm_result_id';
