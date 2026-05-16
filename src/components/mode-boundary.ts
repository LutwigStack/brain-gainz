export type WorkspaceMode = 'learner' | 'author';

export const workspaceModeLabels: Record<WorkspaceMode, { title: string; description: string }> = {
  learner: {
    title: 'Learner view',
    description: 'Today, Daily Run, attempts, progress, and map overview',
  },
  author: {
    title: 'Author tools',
    description: 'Edit nodes, checks, routes, graph links, and templates',
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

