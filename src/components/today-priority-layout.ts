export type QuietDailyTasksInput = {
  isDailyRunActive: boolean;
  isDailyRunFinished: boolean;
  dailyTaskCount: number;
};

export type WeakPanelInput = {
  recoveryIsBestNextAction: boolean;
  weakItemCount: number;
};

export const shouldOpenQuietDailyTasks = ({
  isDailyRunActive,
  isDailyRunFinished,
  dailyTaskCount,
}: QuietDailyTasksInput) => isDailyRunActive || isDailyRunFinished || dailyTaskCount === 0;

export const shouldShowQuietWeakPanel = ({ recoveryIsBestNextAction, weakItemCount }: WeakPanelInput) =>
  recoveryIsBestNextAction && weakItemCount > 0;
