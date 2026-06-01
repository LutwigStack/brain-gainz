export type QuietDailyTasksInput = {
  isDailyRunActive: boolean;
  isDailyRunFinished: boolean;
  dailyTaskCount: number;
  resolvedRunTaskCount?: number;
};

export type WeakPanelInput = {
  recoveryIsBestNextAction: boolean;
  weakItemCount: number;
};

export type DailyRunQueueOutcome = 'completed' | 'failed' | 'skipped' | 'deferred';

export type QuietDailyTaskSummaryInput = {
  isDailyRunActive: boolean;
  isDailyRunFinished: boolean;
  dailyTaskCount: number;
  activeDailyTaskCount: number;
  resolvedRunTaskCount: number;
  canFinishDailyRun: boolean;
};

export type DailyRunSummaryStatusInput = {
  state: string;
  completedCount: number;
  totalTaskCount: number;
};

export type DailyRunSummaryStatus = {
  label: string;
  tone: 'success' | 'warning' | 'textMuted';
};

export type DailyRunQueueAction = {
  outcome: Exclude<DailyRunQueueOutcome, 'completed'>;
  label: string;
  description: string;
};

export const dailyRunQueueManagementActions: DailyRunQueueAction[] = [
  {
    outcome: 'failed',
    label: 'Повторить позже',
    description: 'Оставить задачу в повторении без зачета и XP.',
  },
  {
    outcome: 'deferred',
    label: 'Отложить',
    description: 'Перенести задачу на другой подход.',
  },
  {
    outcome: 'skipped',
    label: 'Убрать из набора',
    description: 'Не учитывать задачу в текущем наборе.',
  },
];

export const getDailyRunOutcomeLabel = (outcome: string) => {
  if (outcome === 'completed') return 'занятие закрыто';
  if (outcome === 'failed') return 'повторить позже';
  if (outcome === 'skipped') return 'убрано из набора';
  if (outcome === 'deferred') return 'отложено';
  return outcome;
};

export const getDailyRunRetryActionLabel = (outcome: string) =>
  outcome === 'completed' ? 'Добавить снова' : 'Вернуть в набор';

export const getDailyRunSummaryStatus = ({
  state,
  completedCount,
  totalTaskCount,
}: DailyRunSummaryStatusInput): DailyRunSummaryStatus => {
  if (state === 'abandoned') {
    return { label: 'Набор сброшен', tone: 'warning' };
  }

  if (totalTaskCount > 0 && completedCount >= totalTaskCount) {
    return { label: 'Все занятия закрыты', tone: 'success' };
  }

  if (completedCount > 0) {
    return { label: 'Есть закрытые занятия', tone: 'success' };
  }

  return { label: 'Нужно повторить', tone: 'warning' };
};

export const shouldOpenQuietDailyTasks = ({
  isDailyRunActive,
  isDailyRunFinished,
  dailyTaskCount,
  resolvedRunTaskCount = 0,
}: QuietDailyTasksInput) => (isDailyRunActive && resolvedRunTaskCount === 0) || isDailyRunFinished || dailyTaskCount === 0;

export const getQuietDailyTaskSummary = ({
  isDailyRunActive,
  isDailyRunFinished,
  dailyTaskCount,
  activeDailyTaskCount,
  resolvedRunTaskCount,
  canFinishDailyRun,
}: QuietDailyTaskSummaryInput) => {
  if (isDailyRunActive && dailyTaskCount > 0) {
    if (canFinishDailyRun) return 'можно завершить';
    return `${resolvedRunTaskCount}/${dailyTaskCount} разобрано`;
  }

  if (isDailyRunFinished) return 'сводка';

  return `${activeDailyTaskCount} активных`;
};

export const shouldShowQuietWeakPanel = ({ recoveryIsBestNextAction, weakItemCount }: WeakPanelInput) =>
  recoveryIsBestNextAction && weakItemCount > 0;
