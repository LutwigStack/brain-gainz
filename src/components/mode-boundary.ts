export type WorkspaceMode = 'learner' | 'author';

export type ShellContextCard = 'campaign' | 'specialization' | 'race' | 'mode';

export type LearnerEntryPoint =
  | 'today'
  | 'daily-run'
  | 'assessment-attempts'
  | 'progress'
  | 'map-overview';

export type AuthorEntryPoint =
  | 'node-editing'
  | 'check-metadata'
  | 'route-authoring'
  | 'graph-editing'
  | 'template-maintenance';

export type AuthorAction =
  | 'create-node'
  | 'rename-node'
  | 'move-node'
  | 'duplicate-node'
  | 'archive-node'
  | 'restore-node'
  | 'create-edge'
  | 'delete-edge'
  | 'edit-route'
  | 'edit-check'
  | 'archive-campaign'
  | 'restore-campaign'
  | 'create-campaign'
  | 'fork-template';

export interface WorkspaceModeCopy {
  title: string;
  description: string;
  switchLabel: string;
  switchDescription: string;
  mapLabel: string;
  mapDescription: string;
  assessmentLabel: string;
  assessmentDescription: string;
}

export interface AuthorActionPolicy {
  surface: AuthorEntryPoint;
  destructive: boolean;
  requiresConfirmation: boolean;
}

export const workspaceModeLabels: Record<WorkspaceMode, WorkspaceModeCopy> = {
  learner: {
    title: 'Режим ученика',
    description: 'Сегодня, задачи дня, проверки, прогресс и карта',
    switchLabel: 'Учусь',
    switchDescription: 'Показывает ежедневный учебный путь без редактора.',
    mapLabel: 'Обзор карты',
    mapDescription: 'Карта прогресса',
    assessmentLabel: 'Проверка',
    assessmentDescription: 'Ход проверки',
  },
  author: {
    title: 'Инструменты автора',
    description: 'Редактирование узлов, проверок, маршрутов, связей и шаблонов',
    switchLabel: 'Настраиваю',
    switchDescription: 'Открывает редакторские инструменты и опасные действия.',
    mapLabel: 'Карта автора',
    mapDescription: 'Узлы, маршруты, граф',
    assessmentLabel: 'Проверки',
    assessmentDescription: 'Настройка проверок и попытки',
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

export const authorActionPolicies: Record<AuthorAction, AuthorActionPolicy> = {
  'create-node': {
    surface: 'node-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'rename-node': {
    surface: 'node-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'move-node': {
    surface: 'node-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'duplicate-node': {
    surface: 'node-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'archive-node': {
    surface: 'node-editing',
    destructive: true,
    requiresConfirmation: true,
  },
  'restore-node': {
    surface: 'node-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'create-edge': {
    surface: 'graph-editing',
    destructive: false,
    requiresConfirmation: false,
  },
  'delete-edge': {
    surface: 'graph-editing',
    destructive: true,
    requiresConfirmation: true,
  },
  'edit-route': {
    surface: 'route-authoring',
    destructive: false,
    requiresConfirmation: false,
  },
  'edit-check': {
    surface: 'check-metadata',
    destructive: false,
    requiresConfirmation: false,
  },
  'archive-campaign': {
    surface: 'template-maintenance',
    destructive: true,
    requiresConfirmation: true,
  },
  'restore-campaign': {
    surface: 'template-maintenance',
    destructive: false,
    requiresConfirmation: false,
  },
  'create-campaign': {
    surface: 'template-maintenance',
    destructive: false,
    requiresConfirmation: false,
  },
  'fork-template': {
    surface: 'template-maintenance',
    destructive: false,
    requiresConfirmation: false,
  },
};

export const isAuthorMode = (mode: WorkspaceMode) => mode === 'author';

export const shouldShowPrimaryModeSwitch = (mode: WorkspaceMode) => isAuthorMode(mode);

export const shouldShowShellNavDescriptions = (mode: WorkspaceMode) => isAuthorMode(mode);

export const shouldShowPriorityShellContextCard = (mode: WorkspaceMode, card: ShellContextCard) =>
  isAuthorMode(mode) || card === 'campaign' || card === 'specialization';

export const canShowAuthorSurface = (mode: WorkspaceMode, surface: AuthorEntryPoint) =>
  isAuthorMode(mode) && authorEntryPoints.includes(surface);

export const canRunAuthorAction = (mode: WorkspaceMode, action: AuthorAction) =>
  canShowAuthorSurface(mode, authorActionPolicies[action].surface);

export const requiresAuthorConfirmation = (action: AuthorAction) =>
  authorActionPolicies[action].requiresConfirmation;

export const isAuthorDestructiveAction = (action: AuthorAction) =>
  authorActionPolicies[action].destructive;
