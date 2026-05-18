export type FocusedLearnerLessonScreenInput = {
  canUseAuthorTools: boolean;
  inspectorMode: string;
  hasFocusedNode: boolean;
};

export type NavigationLessonLayoutInput = {
  isFocusedLearnerLessonScreen: boolean;
  isInspectorCollapsed: boolean;
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
}: NavigationLessonLayoutInput) =>
  isFocusedLearnerLessonScreen || isInspectorCollapsed ? singleColumnMapShellClassName : splitMapShellClassName;

export const shouldShowNavigationInspectorRail = ({
  isFocusedLearnerLessonScreen,
  isInspectorCollapsed,
}: NavigationLessonLayoutInput) => !isFocusedLearnerLessonScreen && !isInspectorCollapsed;
