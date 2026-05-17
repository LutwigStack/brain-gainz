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
        message: 'Готово: ответ будет проверен локально, попытка сохранится автоматически.',
      };
    }

    return {
      tone: 'accent' as const,
      ready: false,
      message: isChecklistCheck
        ? 'Отметьте выполненные пункты чек-листа, чтобы сохранить проверенную попытку.'
        : `Заполните ответ для проверки: ${checkTypeLabel.toLocaleLowerCase()}.`,
    };
  }

  if (hasVerifierEvidence) {
    return {
      tone: 'success' as const,
      ready: true,
      message: 'Готово: есть подтверждение проверки, можно сохранить проверенный прогресс.',
    };
  }

  return {
    tone: 'accent' as const,
    ready: false,
    message: hasAnswer
      ? 'Ответ заполнен как контекст. Для проверенного прогресса добавьте подтверждение проверки.'
      : resolvedCheckMethod === 'strict'
        ? 'Добавьте ответ или подтверждение внешней проверки рядом с действием.'
        : 'Добавьте ответ или подтверждение ИИ-проверки рядом с действием.',
  };
};

export const getAssessmentResultIdLabel = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'ID результата проверки' : 'ID результата ИИ';

export const getAssessmentResultIdPlaceholder = (resolvedCheckMethod: AssessmentCheckMethod) =>
  resolvedCheckMethod === 'strict' ? 'strict_result_id / checker_run_id' : 'llm_result_id';
