export type FocusedLearnerLessonScreenInput = {
  canUseAuthorTools: boolean;
  inspectorMode: string;
  hasFocusedNode: boolean;
};

export type NavigationLessonLayoutInput = {
  isFocusedLearnerLessonScreen: boolean;
  isInspectorCollapsed: boolean;
  isMapFirstWorkspace?: boolean;
};

export type PassedAssessmentResultStateInput = {
  targetMasteryLabel: string;
};

export type FailedAssessmentResultStateInput = {
  feedbackSummary?: string | null;
};

export type CompactAssessmentResultLayoutInput = {
  hasPassedAttempt: boolean;
  hasFailedAttempt: boolean;
  isRetryingFailedAttempt: boolean;
};

export type FailedAttemptHistoryInput = {
  hasFailedAttempt: boolean;
  showFailedResultState: boolean;
  isRetryingFailedAttempt: boolean;
};

const singleColumnMapShellClassName = 'navigation-map-shell grid min-w-0 items-start gap-3 xl:grid-cols-1';

const splitMapShellClassName =
  'navigation-map-shell grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]';

export const shouldUseFocusedLearnerLessonScreen = ({
  canUseAuthorTools,
  inspectorMode,
  hasFocusedNode,
}: FocusedLearnerLessonScreenInput) =>
  !canUseAuthorTools && inspectorMode === 'assessment' && hasFocusedNode;

export const getNavigationMapShellClassName = ({
  isFocusedLearnerLessonScreen,
  isInspectorCollapsed,
  isMapFirstWorkspace = false,
}: NavigationLessonLayoutInput) =>
  isFocusedLearnerLessonScreen || isInspectorCollapsed || isMapFirstWorkspace
    ? singleColumnMapShellClassName
    : splitMapShellClassName;

export const shouldShowNavigationInspectorRail = ({
  isFocusedLearnerLessonScreen,
  isInspectorCollapsed,
  isMapFirstWorkspace = false,
}: NavigationLessonLayoutInput) => !isFocusedLearnerLessonScreen && !isInspectorCollapsed && !isMapFirstWorkspace;

export const getPassedAssessmentResultState = ({
  targetMasteryLabel,
}: PassedAssessmentResultStateInput) => ({
  statusLabel: 'Зачтено',
  progressLabel: 'Контроль закреплен',
  progressValue: targetMasteryLabel,
  xpLabel: 'XP обновлены',
  xpValue: 'XP обновлены',
  primaryActionLabel: 'Следующий шаг',
});
export const getFailedAssessmentResultState = ({
  feedbackSummary,
}: FailedAssessmentResultStateInput) => ({
  statusLabel: 'Не зачтено',
  message: 'Участок оспаривается. Прогресс и XP не изменились.',
  reasonLabel: 'Что вернуть под контроль',
  reasonValue: feedbackSummary?.trim() || 'Пока не все пункты готовы.',
  primaryActionLabel: 'Попробовать еще раз',
  secondaryActionLabel: 'Отметить для себя',
});
export const getSelfMarkedAssessmentCopy = () => ({
  primaryActionLabel: 'Отметить для себя',
  helperText: 'Без зачета и XP.',
  resultMessage: 'Сохранено как личная отметка.',
  noticeText: 'Сохранено как личная отметка. Без зачета и XP.',
});

export const shouldUseCompactAssessmentResultLayout = ({
  hasPassedAttempt,
  hasFailedAttempt,
  isRetryingFailedAttempt,
}: CompactAssessmentResultLayoutInput) => hasPassedAttempt || (hasFailedAttempt && !isRetryingFailedAttempt);

export const shouldShowFailedAttemptHistory = ({
  hasFailedAttempt,
  showFailedResultState,
  isRetryingFailedAttempt,
}: FailedAttemptHistoryInput) => hasFailedAttempt && !showFailedResultState && !isRetryingFailedAttempt;
