export type WorkspaceMode = 'learner' | 'author';

export const workspaceModeLabels: Record<WorkspaceMode, { title: string; description: string }> = {
  learner: {
    title: 'Режим ученика',
    description: 'Сегодня, задачи дня, попытки, прогресс и карта',
  },
  author: {
    title: 'Инструменты автора',
    description: 'Редактирование узлов, проверок, маршрутов, связей и шаблонов',
  },
};

export const learnerEntryPoints = ['today', 'daily-run', 'assessment-attempts', 'progress', 'map-overview'] as const;
export const authorEntryPoints = [
  'node-editing',
  'check-metadata',
  'route-authoring',
  'graph-editing',
  'template-maintenance',
] as const;

export const isAuthorMode = (mode: WorkspaceMode) => mode === 'author';

export const canShowAuthorSurface = (mode: WorkspaceMode, surface: (typeof authorEntryPoints)[number]) =>
  isAuthorMode(mode) && authorEntryPoints.includes(surface);
