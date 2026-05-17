export type AssessmentCheckMethod = 'strict' | 'llm_assisted';

export type AssessmentChecklistItem = {
  id: string;
  label: string;
  required: boolean;
};

type CheckTypeInput = {
  strictCheckType?: string | null;
  resolvedCheckMethod: AssessmentCheckMethod;
};

type ExpectationInput = CheckTypeInput & {
  isChecklistCheck: boolean;
  checklistItems: AssessmentChecklistItem[];
  expectedSummary?: string | null;
  requiredTerms?: string[];
};

type AnswerInputCopy = {
  label: string;
  placeholder: string;
  helperText: string;
};

type AttemptResultCopyInput = {
  passed: boolean;
  targetMasteryLabel: string;
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
};

export const getAssessmentCheckTypeLabel = ({ strictCheckType, resolvedCheckMethod }: CheckTypeInput) => {
  if (strictCheckType === 'exact') return 'Точный ответ';
  if (strictCheckType === 'number') return 'Число';
  if (strictCheckType === 'contains') return 'Текст с обязательными терминами';
  if (strictCheckType === 'checklist') return 'Чек-лист';
  if (resolvedCheckMethod === 'strict') return 'Ручная строгая проверка';
  return 'ИИ-проверка';
};

export const getAssessmentExpectedInputText = ({
  isChecklistCheck,
  checklistItems,
  strictCheckType,
  expectedSummary,
  requiredTerms = [],
  resolvedCheckMethod,
}: ExpectationInput) => {
  if (isChecklistCheck) {
    const requiredCount = checklistItems.filter((item) => item.required).length;
    return `Отметьте выполненные пункты: обязательно ${requiredCount}/${checklistItems.length}.`;
  }

  if (strictCheckType === 'exact') {
    return `Введите ответ, который должен совпасть${expectedSummary ? `: ${expectedSummary}` : '.'}`;
  }

  if (strictCheckType === 'number') {
    return `Введите число${expectedSummary ? `: ${expectedSummary}` : ''}.`;
  }

  if (strictCheckType === 'contains') {
    return `Введите ответ с обязательными элементами: ${requiredTerms.join(', ') || 'элементы не заданы'}.`;
  }

  if (resolvedCheckMethod === 'strict') {
    return 'Приложите результат внешней проверки, который подтверждает, что критерии пройдены.';
  }

  return 'Приложите результат ИИ-проверки или краткое обоснование, почему ответ засчитан.';
};

export const getAssessmentAnswerInputCopy = ({
  strictCheckType,
  resolvedCheckMethod,
}: CheckTypeInput): AnswerInputCopy => {
  if (strictCheckType === 'exact') {
    return {
      label: 'Ответ для точной проверки',
      placeholder: 'Введите один ответ так, как он должен быть зачтен',
      helperText: 'Проверка сравнит ответ с ожидаемым значением.',
    };
  }

  if (strictCheckType === 'number') {
    return {
      label: 'Число для проверки',
      placeholder: 'Введите число без лишнего текста',
      helperText: 'Проверка учтет допустимую погрешность, если она задана.',
    };
  }

  if (strictCheckType === 'contains') {
    return {
      label: 'Ответ с обязательными терминами',
      placeholder: 'Напишите ответ так, чтобы в нем были все обязательные термины',
      helperText: 'Проверка ищет обязательные элементы в тексте ответа.',
    };
  }

  if (resolvedCheckMethod === 'strict') {
    return {
      label: 'Ответ или артефакт',
      placeholder: 'Коротко: ссылка, решение, формула или результат внешней проверки',
      helperText: 'Зачет появится после подтверждения проверки.',
    };
  }

  return {
    label: 'Ответ или объяснение',
    placeholder: 'Коротко: ответ, ход решения или ссылка на работу',
    helperText: 'Зачет появится после вывода ИИ-проверки или вашего подтверждения.',
  };
};

export const getAssessmentEvidenceHint = ({
  hasVisibleEvidence,
  hasTechnicalResultId,
}: {
  hasVisibleEvidence: boolean;
  hasTechnicalResultId: boolean;
}) => {
  if (hasVisibleEvidence) {
    return 'Подтверждение заполнено. Попытку можно засчитать.';
  }

  if (hasTechnicalResultId) {
    return 'Технические детали заполнены. Попытку можно засчитать; видимое подтверждение можно оставить пустым.';
  }

  return 'Для зачета добавьте подтверждение проверки. Технические детали можно оставить пустыми.';
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
}: ValidationInput) => {
  if (pendingAssessment) {
    return {
      tone: 'accent' as const,
      ready: false,
      message: 'Проверка выполняется. Дождитесь сохранения попытки.',
    };
  }

  if (pendingSelfMark) {
    return {
      tone: 'accent' as const,
      ready: false,
      message: 'Сначала дождитесь сохранения самооценки, затем можно сохранить проверенную попытку.',
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
        message: 'Готово: ответ будет проверен сразу. Если он пройдет критерий, прогресс и XP обновятся.',
      };
    }

    return {
      tone: 'accent' as const,
      ready: false,
      message: isChecklistCheck
        ? 'Отметьте хотя бы один пункт чек-листа, чтобы сохранить попытку проверки.'
        : `Заполните поле ответа рядом с действием: ${checkTypeLabel.toLocaleLowerCase()}.`,
    };
  }

  if (hasVerifierEvidence) {
    return {
      tone: 'success' as const,
      ready: true,
      message: 'Готово: подтверждение проверки заполнено. После сохранения обновятся прогресс и XP.',
    };
  }

  return {
    tone: 'accent' as const,
    ready: false,
    message: hasAnswer
      ? 'Ответ сохранен как контекст. Для зачета добавьте подтверждение проверки.'
      : resolvedCheckMethod === 'strict'
        ? 'Добавьте ответ или подтверждение внешней проверки рядом с действием.'
        : 'Добавьте ответ или подтверждение ИИ-проверки рядом с действием.',
  };
};

export const getAssessmentAttemptResultCopy = ({ passed, targetMasteryLabel }: AttemptResultCopyInput) => ({
  status: passed ? 'Зачтено' : 'Пока не зачтено',
  message: passed
    ? `Подтвержденный прогресс обновлен до «${targetMasteryLabel}». XP зависит от настройки основной характеристики ветки.`
    : 'Попытка сохранена для разбора. Прогресс и XP не изменились; можно попробовать снова.',
});

export const getAssessmentResultIdLabel = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'ID результата проверки' : 'ID результата ИИ';

export const getAssessmentResultIdPlaceholder = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'strict_result_id / checker_run_id' : 'llm_result_id';
