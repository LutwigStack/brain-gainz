export type NlhCourseLevel = 'foundation' | 'core' | 'intermediate' | 'advanced' | 'routine';
export type NlhCourseSize = 'small' | 'medium' | 'large' | 'capstone';
export type NlhAtlasHubType = 'course_hub' | 'routine_hub' | 'risk_hub';

export interface NlhCashRegion {
  key: string;
  title: string;
  shortTitle: string;
  color: string;
  icon: string;
  description: string;
  infrastructureObjectName: string;
}

export interface NlhCashCourse {
  key: string;
  title: string;
  regionKey: string;
  description: string;
  level: NlhCourseLevel;
  orderHint: number;
  prerequisiteKeys: string[];
  followUpKeys: string[];
  infrastructureObjectCandidate: boolean;
  infrastructureObjectName: string;
  atlasHubType: NlhAtlasHubType;
  size: NlhCourseSize;
  riskNote: string | null;
}

type CourseSeed = Omit<
  NlhCashCourse,
  'description' | 'followUpKeys' | 'infrastructureObjectCandidate' | 'infrastructureObjectName' | 'atlasHubType' | 'size' | 'riskNote'
> & {
  description?: string;
  infrastructureObjectName?: string;
  atlasHubType?: NlhAtlasHubType;
  size?: NlhCourseSize;
  riskNote?: string | null;
};

const course = (input: CourseSeed): CourseSeed => input;

export const NLH_CASH_REGIONS: NlhCashRegion[] = [
  {
    key: 'safety',
    title: 'Вход и безопасность',
    shortTitle: 'Риск',
    color: '#f59e0b',
    icon: 'shield',
    description: 'Правила, формат cash, банкролл, лимиты, стоп-лосс и эмоциональные границы учебной практики.',
    infrastructureObjectName: 'Казначейство риска',
  },
  {
    key: 'math',
    title: 'Базовая математика',
    shortTitle: 'Математика',
    color: '#58d6ff',
    icon: 'sigma',
    description: 'Комбинации, equity, pot odds, EV, SPR, блокеры и мышление диапазонами.',
    infrastructureObjectName: 'Счетная палата',
  },
  {
    key: 'preflop',
    title: 'Preflop-ядро',
    shortTitle: 'Preflop',
    color: '#5ee6b5',
    icon: 'grid',
    description: 'Позиции, открытия, защиты, 3-bet, 4-bet, блайнды и базовые настройки до флопа.',
    infrastructureObjectName: 'Зал диапазонов',
  },
  {
    key: 'flop-srp',
    title: 'Flop: single-raised pots',
    shortTitle: 'Flop',
    color: '#38bdf8',
    icon: 'cards',
    description: 'Текстуры флопа, преимущества диапазона, c-bet, check-back, check-raise и multiway основы.',
    infrastructureObjectName: 'Арена текстур',
  },
  {
    key: 'turn',
    title: 'Turn',
    shortTitle: 'Turn',
    color: '#a78bfa',
    icon: 'route',
    description: 'Второй баррель, смена преимуществ, защита, полублефы и подготовка river-плана.',
    infrastructureObjectName: 'Башня давления',
  },
  {
    key: 'river',
    title: 'River',
    shortTitle: 'River',
    color: '#fb7185',
    icon: 'scale',
    description: 'Value betting, bluffing frequencies, bluffcatching, blockers, overbet и дисциплина отказа от блефа.',
    infrastructureObjectName: 'Суд последней улицы',
  },
  {
    key: 'three-four-bet',
    title: '3-bet / 4-bet pots',
    shortTitle: 'Большие банки',
    color: '#f97316',
    icon: 'fortress',
    description: 'IP/OOP 3-bet pots, blind vs blind, 4-bet pots, low SPR и deep stack решения.',
    infrastructureObjectName: 'Крепость больших банков',
  },
  {
    key: 'exploit-field',
    title: 'Exploit и игра против поля',
    shortTitle: 'Exploit',
    color: '#84cc16',
    icon: 'radar',
    description: 'Типы оппонентов, тенденции поля, table selection, live adjustments и осторожные эксплойт-подстройки.',
    infrastructureObjectName: 'Разведывательная сеть',
  },
  {
    key: 'gto-solver',
    title: 'GTO, солверы и упрощения',
    shortTitle: 'GTO',
    color: '#c084fc',
    icon: 'lab',
    description: 'GTO baseline, чтение solver output, simplified strategies, node locking и частоты без перегруза.',
    infrastructureObjectName: 'Лаборатория равновесия',
  },
  {
    key: 'professional-routine',
    title: 'Профессиональная рутина',
    shortTitle: 'Рутина',
    color: '#22c55e',
    icon: 'archive',
    description: 'Hand history review, database review, leak finding, warm-up, post-session review, shot taking и план учебы.',
    infrastructureObjectName: 'Архив раздач',
  },
];

const COURSE_SEEDS: CourseSeed[] = [
  course({ key: 'nlh-cash-intro', title: 'Что такое NLH cash', regionKey: 'safety', level: 'foundation', orderHint: 1, prerequisiteKeys: [], atlasHubType: 'risk_hub' }),
  course({ key: 'rules-positions-blinds-stack', title: 'Правила, позиции, блайнды, стек', regionKey: 'safety', level: 'foundation', orderHint: 2, prerequisiteKeys: ['nlh-cash-intro'], atlasHubType: 'risk_hub' }),
  course({ key: 'cash-vs-tournaments', title: 'Cash vs турниры', regionKey: 'safety', level: 'foundation', orderHint: 3, prerequisiteKeys: ['nlh-cash-intro'], atlasHubType: 'risk_hub' }),
  course({
    key: 'bankroll-management',
    title: 'Банкролл-менеджмент',
    regionKey: 'safety',
    level: 'foundation',
    orderHint: 4,
    prerequisiteKeys: ['rules-positions-blinds-stack'],
    atlasHubType: 'risk_hub',
    size: 'large',
    riskNote: 'Банкролл рассматривается как ограничение риска и дисциплины обучения, а не как обещание дохода.',
  }),
  course({ key: 'rake-limits-game-selection', title: 'Рейк, лимиты и выбор поля', regionKey: 'safety', level: 'foundation', orderHint: 5, prerequisiteKeys: ['bankroll-management'], atlasHubType: 'risk_hub' }),
  course({
    key: 'session-stop-loss-exit',
    title: 'Сессия, стоп-лосс и выход из игры',
    regionKey: 'safety',
    level: 'foundation',
    orderHint: 6,
    prerequisiteKeys: ['bankroll-management'],
    atlasHubType: 'risk_hub',
    riskNote: 'Стоп-лосс и выход из игры нужны для защиты внимания и банкролла; это учебная граница, не финансовый совет.',
  }),
  course({
    key: 'tilt-emotional-control',
    title: 'Тильт и эмоциональный контроль',
    regionKey: 'safety',
    level: 'foundation',
    orderHint: 7,
    prerequisiteKeys: ['session-stop-loss-exit'],
    atlasHubType: 'risk_hub',
    riskNote: 'Если эмоции мешают решениям, приоритетом становится пауза, разбор и снижение давления.',
  }),

  course({ key: 'hand-rankings-combinations', title: 'Комбинации и порядок рук', regionKey: 'math', level: 'foundation', orderHint: 8, prerequisiteKeys: ['rules-positions-blinds-stack'] }),
  course({ key: 'equity-outs-pot-odds', title: 'Эквити, ауты, pot odds', regionKey: 'math', level: 'foundation', orderHint: 9, prerequisiteKeys: ['hand-rankings-combinations', 'bankroll-management'] }),
  course({ key: 'implied-reverse-implied-odds', title: 'Implied odds и reverse implied odds', regionKey: 'math', level: 'core', orderHint: 10, prerequisiteKeys: ['equity-outs-pot-odds'] }),
  course({ key: 'ev-and-frequencies', title: 'EV и частоты', regionKey: 'math', level: 'core', orderHint: 11, prerequisiteKeys: ['equity-outs-pot-odds'] }),
  course({ key: 'spr-effective-stack', title: 'SPR и effective stack', regionKey: 'math', level: 'core', orderHint: 12, prerequisiteKeys: ['implied-reverse-implied-odds'] }),
  course({ key: 'combinatorics-blockers', title: 'Комбинаторика и blockers', regionKey: 'math', level: 'core', orderHint: 13, prerequisiteKeys: ['ev-and-frequencies'] }),
  course({ key: 'ranges-not-hands', title: 'Диапазоны вместо рук', regionKey: 'math', level: 'core', orderHint: 14, prerequisiteKeys: ['ev-and-frequencies', 'combinatorics-blockers'] }),

  course({ key: 'rfi-by-position', title: 'RFI по позициям', regionKey: 'preflop', level: 'core', orderHint: 15, prerequisiteKeys: ['ranges-not-hands', 'rake-limits-game-selection'] }),
  course({ key: 'defense-vs-open-raise', title: 'Защита против open raise', regionKey: 'preflop', level: 'core', orderHint: 16, prerequisiteKeys: ['rfi-by-position', 'ranges-not-hands'] }),
  course({ key: 'three-bet-ranges', title: '3-bet ranges', regionKey: 'preflop', level: 'core', orderHint: 17, prerequisiteKeys: ['defense-vs-open-raise'] }),
  course({ key: 'call-vs-three-bet', title: 'Call vs 3-bet', regionKey: 'preflop', level: 'core', orderHint: 18, prerequisiteKeys: ['three-bet-ranges'] }),
  course({ key: 'four-bet-five-bet-logic', title: '4-bet / 5-bet логика', regionKey: 'preflop', level: 'intermediate', orderHint: 19, prerequisiteKeys: ['three-bet-ranges', 'spr-effective-stack'] }),
  course({ key: 'blind-play', title: 'Игра на блайндах', regionKey: 'preflop', level: 'core', orderHint: 20, prerequisiteKeys: ['defense-vs-open-raise'] }),
  course({ key: 'squeeze-spots', title: 'Squeeze spots', regionKey: 'preflop', level: 'intermediate', orderHint: 21, prerequisiteKeys: ['three-bet-ranges', 'blind-play'] }),
  course({ key: 'isolating-limpers', title: 'Изоляция лимперов', regionKey: 'preflop', level: 'intermediate', orderHint: 22, prerequisiteKeys: ['rfi-by-position', 'rake-limits-game-selection'] }),
  course({ key: 'preflop-rake-stack-adjustments', title: 'Подстройка под рейк и стек', regionKey: 'preflop', level: 'intermediate', orderHint: 23, prerequisiteKeys: ['rfi-by-position', 'spr-effective-stack'] }),

  course({ key: 'flop-textures', title: 'Текстуры флопа', regionKey: 'flop-srp', level: 'core', orderHint: 24, prerequisiteKeys: ['ranges-not-hands', 'rfi-by-position'] }),
  course({ key: 'range-and-nut-advantage', title: 'Range advantage и nut advantage', regionKey: 'flop-srp', level: 'core', orderHint: 25, prerequisiteKeys: ['flop-textures', 'ranges-not-hands'] }),
  course({ key: 'cbet-ip', title: 'C-bet IP', regionKey: 'flop-srp', level: 'core', orderHint: 26, prerequisiteKeys: ['range-and-nut-advantage'] }),
  course({ key: 'cbet-oop', title: 'C-bet OOP', regionKey: 'flop-srp', level: 'core', orderHint: 27, prerequisiteKeys: ['range-and-nut-advantage'] }),
  course({ key: 'check-back-delayed-cbet', title: 'Check-back и delayed c-bet', regionKey: 'flop-srp', level: 'intermediate', orderHint: 28, prerequisiteKeys: ['cbet-ip'] }),
  course({ key: 'flop-check-raise', title: 'Check-raise', regionKey: 'flop-srp', level: 'intermediate', orderHint: 29, prerequisiteKeys: ['cbet-oop', 'range-and-nut-advantage'] }),
  course({ key: 'probe-bet', title: 'Probe bet', regionKey: 'flop-srp', level: 'intermediate', orderHint: 30, prerequisiteKeys: ['check-back-delayed-cbet'] }),
  course({ key: 'multiway-flop-basics', title: 'Multiway flop basics', regionKey: 'flop-srp', level: 'intermediate', orderHint: 31, prerequisiteKeys: ['flop-textures', 'equity-outs-pot-odds'] }),

  course({ key: 'turn-second-barrel', title: 'Второй баррель', regionKey: 'turn', level: 'intermediate', orderHint: 32, prerequisiteKeys: ['cbet-ip', 'cbet-oop'] }),
  course({ key: 'turn-range-shifting-cards', title: 'Карты, меняющие преимущество диапазона', regionKey: 'turn', level: 'intermediate', orderHint: 33, prerequisiteKeys: ['range-and-nut-advantage', 'turn-second-barrel'] }),
  course({ key: 'protection-vs-value', title: 'Protection vs value', regionKey: 'turn', level: 'intermediate', orderHint: 34, prerequisiteKeys: ['turn-range-shifting-cards'] }),
  course({ key: 'semibluffs-equity-denial', title: 'Полублефы и equity denial', regionKey: 'turn', level: 'intermediate', orderHint: 35, prerequisiteKeys: ['protection-vs-value', 'equity-outs-pot-odds'] }),
  course({ key: 'turn-check-raise', title: 'Turn check-raise', regionKey: 'turn', level: 'advanced', orderHint: 36, prerequisiteKeys: ['flop-check-raise', 'turn-range-shifting-cards'] }),
  course({ key: 'river-plan-preparation', title: 'Подготовка river plan', regionKey: 'turn', level: 'intermediate', orderHint: 37, prerequisiteKeys: ['turn-second-barrel', 'turn-range-shifting-cards'] }),

  course({ key: 'river-value-betting', title: 'Value betting', regionKey: 'river', level: 'intermediate', orderHint: 38, prerequisiteKeys: ['river-plan-preparation'] }),
  course({ key: 'river-bluffing-frequencies', title: 'Bluffing frequencies', regionKey: 'river', level: 'advanced', orderHint: 39, prerequisiteKeys: ['river-value-betting', 'ev-and-frequencies'] }),
  course({ key: 'bluffcatching', title: 'Bluffcatching', regionKey: 'river', level: 'advanced', orderHint: 40, prerequisiteKeys: ['river-value-betting', 'combinatorics-blockers'] }),
  course({ key: 'river-blockers', title: 'Blockers на river', regionKey: 'river', level: 'advanced', orderHint: 41, prerequisiteKeys: ['bluffcatching', 'combinatorics-blockers'] }),
  course({ key: 'overbet-polar-range', title: 'Overbet и polar range', regionKey: 'river', level: 'advanced', orderHint: 42, prerequisiteKeys: ['river-bluffing-frequencies', 'river-blockers'] }),
  course({ key: 'thin-value', title: 'Thin value', regionKey: 'river', level: 'advanced', orderHint: 43, prerequisiteKeys: ['river-value-betting', 'bluffcatching'] }),
  course({ key: 'when-not-to-bluff', title: 'Когда не блефовать', regionKey: 'river', level: 'advanced', orderHint: 44, prerequisiteKeys: ['river-bluffing-frequencies', 'tilt-emotional-control'], atlasHubType: 'risk_hub' }),

  course({ key: 'ip-three-bet-pots', title: 'IP 3-bet pots', regionKey: 'three-four-bet', level: 'intermediate', orderHint: 45, prerequisiteKeys: ['three-bet-ranges', 'cbet-ip'] }),
  course({ key: 'oop-three-bet-pots', title: 'OOP 3-bet pots', regionKey: 'three-four-bet', level: 'intermediate', orderHint: 46, prerequisiteKeys: ['three-bet-ranges', 'cbet-oop'] }),
  course({ key: 'blind-vs-blind', title: 'Blind vs blind', regionKey: 'three-four-bet', level: 'intermediate', orderHint: 47, prerequisiteKeys: ['blind-play', 'three-bet-ranges'] }),
  course({ key: 'four-bet-pots', title: '4-bet pots', regionKey: 'three-four-bet', level: 'advanced', orderHint: 48, prerequisiteKeys: ['four-bet-five-bet-logic', 'ip-three-bet-pots', 'oop-three-bet-pots'] }),
  course({ key: 'low-spr-decisions', title: 'Low SPR decisions', regionKey: 'three-four-bet', level: 'advanced', orderHint: 49, prerequisiteKeys: ['four-bet-pots', 'spr-effective-stack'] }),
  course({ key: 'deep-stack-cash', title: 'Deep stack cash', regionKey: 'three-four-bet', level: 'advanced', orderHint: 50, prerequisiteKeys: ['low-spr-decisions', 'river-plan-preparation'] }),

  course({ key: 'opponent-types', title: 'Типы оппонентов', regionKey: 'exploit-field', level: 'intermediate', orderHint: 51, prerequisiteKeys: ['ranges-not-hands', 'when-not-to-bluff'] }),
  course({ key: 'calling-stations', title: 'Calling stations', regionKey: 'exploit-field', level: 'intermediate', orderHint: 52, prerequisiteKeys: ['opponent-types', 'river-value-betting'] }),
  course({ key: 'nits', title: 'Nits', regionKey: 'exploit-field', level: 'intermediate', orderHint: 53, prerequisiteKeys: ['opponent-types', 'rfi-by-position'] }),
  course({ key: 'aggro-maniacs', title: 'Aggro / маньяки', regionKey: 'exploit-field', level: 'advanced', orderHint: 54, prerequisiteKeys: ['opponent-types', 'tilt-emotional-control', 'bluffcatching'] }),
  course({ key: 'reg-wars', title: 'Reg wars', regionKey: 'exploit-field', level: 'advanced', orderHint: 55, prerequisiteKeys: ['opponent-types', 'four-bet-pots', 'river-bluffing-frequencies'] }),
  course({ key: 'population-tendencies', title: 'Population tendencies', regionKey: 'exploit-field', level: 'advanced', orderHint: 56, prerequisiteKeys: ['opponent-types', 'ev-and-frequencies'] }),
  course({ key: 'table-selection', title: 'Table selection', regionKey: 'exploit-field', level: 'intermediate', orderHint: 57, prerequisiteKeys: ['rake-limits-game-selection', 'opponent-types'], atlasHubType: 'risk_hub' }),
  course({ key: 'live-cash-adjustments', title: 'Live cash adjustments', regionKey: 'exploit-field', level: 'advanced', orderHint: 58, prerequisiteKeys: ['table-selection', 'population-tendencies'] }),

  course({ key: 'gto-baseline', title: 'Что такое GTO baseline', regionKey: 'gto-solver', level: 'advanced', orderHint: 59, prerequisiteKeys: ['ranges-not-hands', 'river-bluffing-frequencies'] }),
  course({ key: 'reading-solver-output', title: 'Как читать solver output', regionKey: 'gto-solver', level: 'advanced', orderHint: 60, prerequisiteKeys: ['gto-baseline', 'combinatorics-blockers'] }),
  course({ key: 'simplified-strategies', title: 'Simplified strategies', regionKey: 'gto-solver', level: 'advanced', orderHint: 61, prerequisiteKeys: ['reading-solver-output'] }),
  course({ key: 'node-locking-exploit', title: 'Node locking и exploit', regionKey: 'gto-solver', level: 'advanced', orderHint: 62, prerequisiteKeys: ['reading-solver-output', 'population-tendencies'] }),
  course({ key: 'frequencies-without-overload', title: 'Частоты без перегруза', regionKey: 'gto-solver', level: 'advanced', orderHint: 63, prerequisiteKeys: ['gto-baseline', 'ev-and-frequencies'] }),
  course({ key: 'solver-understanding-not-botting', title: 'Как не стать solver-ботом без понимания', regionKey: 'gto-solver', level: 'advanced', orderHint: 64, prerequisiteKeys: ['simplified-strategies', 'frequencies-without-overload'] }),

  course({ key: 'hand-history-review', title: 'Разбор hand history', regionKey: 'professional-routine', level: 'routine', orderHint: 65, prerequisiteKeys: ['rules-positions-blinds-stack', 'equity-outs-pot-odds'], atlasHubType: 'routine_hub' }),
  course({ key: 'database-review-hud-stats', title: 'Database review / HUD stats', regionKey: 'professional-routine', level: 'routine', orderHint: 66, prerequisiteKeys: ['hand-history-review', 'ev-and-frequencies'], atlasHubType: 'routine_hub' }),
  course({ key: 'leak-finding', title: 'Leak finding', regionKey: 'professional-routine', level: 'routine', orderHint: 67, prerequisiteKeys: ['database-review-hud-stats', 'opponent-types'], atlasHubType: 'routine_hub' }),
  course({ key: 'session-warm-up', title: 'Warm-up перед сессией', regionKey: 'professional-routine', level: 'routine', orderHint: 68, prerequisiteKeys: ['tilt-emotional-control', 'rfi-by-position'], atlasHubType: 'routine_hub' }),
  course({ key: 'post-session-review', title: 'Post-session review', regionKey: 'professional-routine', level: 'routine', orderHint: 69, prerequisiteKeys: ['hand-history-review', 'session-warm-up'], atlasHubType: 'routine_hub' }),
  course({
    key: 'shot-taking-moving-down',
    title: 'Shot taking / moving down',
    regionKey: 'professional-routine',
    level: 'routine',
    orderHint: 71,
    prerequisiteKeys: ['bankroll-management', 'variance-sample-size', 'session-stop-loss-exit'],
    atlasHubType: 'risk_hub',
    riskNote: 'Переход по лимитам подается консервативно: сначала правила отката, лимиты риска и готовность вернуться ниже.',
  }),
  course({
    key: 'variance-sample-size',
    title: 'Дистанция, variance, sample size',
    regionKey: 'professional-routine',
    level: 'routine',
    orderHint: 70,
    prerequisiteKeys: ['ev-and-frequencies', 'post-session-review'],
    atlasHubType: 'risk_hub',
    riskNote: 'Результаты отдельных сессий не доказывают качество стратегии; важны выборка, разбор решений и контроль риска.',
  }),
  course({ key: 'bankroll-and-study-plan', title: 'Итоговый bankroll и study plan', regionKey: 'professional-routine', level: 'routine', orderHint: 72, prerequisiteKeys: ['shot-taking-moving-down', 'leak-finding', 'solver-understanding-not-botting'], atlasHubType: 'routine_hub', size: 'capstone' }),
];

const regionByKey = new Map(NLH_CASH_REGIONS.map((region) => [region.key, region]));
const riskCourseKeys = new Set(['bankroll-management', 'session-stop-loss-exit', 'tilt-emotional-control', 'shot-taking-moving-down', 'variance-sample-size']);
const forbiddenPromoPatterns = [/guaranteed profit/i, /easy money/i, /быстрый заработ/i, /легкие деньги/i, /гарантированн\w* доход/i];

const followUpKeysFor = (courseKey: string) =>
  COURSE_SEEDS.filter((courseEntry) => courseEntry.prerequisiteKeys.includes(courseKey)).map((courseEntry) => courseEntry.key);

const defaultDescription = (courseEntry: CourseSeed) => {
  const region = regionByKey.get(courseEntry.regionKey);
  return `Курс «${courseEntry.title}»: ${region?.description ?? 'структурная часть NLH cash'}. Фокус на качестве решений, разборе ошибок и контроле риска.`;
};

export const NLH_CASH_COURSES: NlhCashCourse[] = COURSE_SEEDS.map((courseEntry) => ({
  ...courseEntry,
  description: courseEntry.description ?? defaultDescription(courseEntry),
  followUpKeys: followUpKeysFor(courseEntry.key),
  infrastructureObjectCandidate: true,
  infrastructureObjectName: courseEntry.infrastructureObjectName ?? courseEntry.title,
  atlasHubType: courseEntry.atlasHubType ?? 'course_hub',
  size: courseEntry.size ?? (courseEntry.level === 'advanced' ? 'large' : courseEntry.level === 'routine' ? 'medium' : 'medium'),
  riskNote: courseEntry.riskNote ?? null,
}));

export const NLH_CASH_COURSE_KEYS = NLH_CASH_COURSES.map((courseEntry) => courseEntry.key);
export const NLH_CASH_COURSES_BY_KEY = new Map(NLH_CASH_COURSES.map((courseEntry) => [courseEntry.key, courseEntry]));
export const NLH_CASH_REGIONS_BY_KEY = new Map(NLH_CASH_REGIONS.map((region) => [region.key, region]));

export const findNlhCashCourse = (key: string) => NLH_CASH_COURSES_BY_KEY.get(key) ?? null;

export const compareNlhCashCourseRouteOrder = (left: NlhCashCourse, right: NlhCashCourse) =>
  left.orderHint - right.orderHint ||
  NLH_CASH_REGIONS.findIndex((region) => region.key === left.regionKey) -
    NLH_CASH_REGIONS.findIndex((region) => region.key === right.regionKey) ||
  left.title.localeCompare(right.title, 'ru-RU');

export const getNlhCashCoursesInRouteOrder = () => [...NLH_CASH_COURSES].sort(compareNlhCashCourseRouteOrder);

const findCycles = () => {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles: string[] = [];

  const visit = (key: string, path: string[]) => {
    if (visiting.has(key)) {
      cycles.push([...path, key].join(' -> '));
      return;
    }
    if (visited.has(key)) {
      return;
    }
    visiting.add(key);
    const courseEntry = NLH_CASH_COURSES_BY_KEY.get(key);
    for (const prerequisiteKey of courseEntry?.prerequisiteKeys ?? []) {
      visit(prerequisiteKey, [...path, key]);
    }
    visiting.delete(key);
    visited.add(key);
  };

  for (const courseEntry of NLH_CASH_COURSES) {
    visit(courseEntry.key, []);
  }
  return cycles;
};

export const validateNlhCashCatalog = () => {
  const regionKeys = new Set(NLH_CASH_REGIONS.map((region) => region.key));
  const courseKeys = new Set<string>();
  const duplicateCourseKeys: string[] = [];
  const invalidRegionCourseKeys: string[] = [];
  const missingReferenceKeys: string[] = [];
  const staleFollowUpKeys: string[] = [];
  const missingRiskNotes: string[] = [];
  const prerequisiteOrderViolations: string[] = [];
  const copyViolations: string[] = [];

  for (const courseEntry of NLH_CASH_COURSES) {
    if (courseKeys.has(courseEntry.key)) {
      duplicateCourseKeys.push(courseEntry.key);
    }
    courseKeys.add(courseEntry.key);
    if (!regionKeys.has(courseEntry.regionKey)) {
      invalidRegionCourseKeys.push(courseEntry.key);
    }
    if (riskCourseKeys.has(courseEntry.key) && !courseEntry.riskNote) {
      missingRiskNotes.push(courseEntry.key);
    }
    const copy = `${courseEntry.title} ${courseEntry.description} ${courseEntry.riskNote ?? ''}`;
    if (forbiddenPromoPatterns.some((pattern) => pattern.test(copy))) {
      copyViolations.push(courseEntry.key);
    }
  }

  const routeOrderIndex = new Map(getNlhCashCoursesInRouteOrder().map((courseEntry, index) => [courseEntry.key, index]));
  for (const courseEntry of NLH_CASH_COURSES) {
    const courseIndex = routeOrderIndex.get(courseEntry.key) ?? -1;
    for (const prerequisiteKey of courseEntry.prerequisiteKeys) {
      const prerequisiteIndex = routeOrderIndex.get(prerequisiteKey) ?? -1;
      if (prerequisiteIndex >= courseIndex) {
        prerequisiteOrderViolations.push(`${courseEntry.key}<-${prerequisiteKey}`);
      }
    }
    for (const key of [...courseEntry.prerequisiteKeys, ...courseEntry.followUpKeys]) {
      if (!courseKeys.has(key)) {
        missingReferenceKeys.push(`${courseEntry.key}->${key}`);
      }
    }
    for (const followUpKey of courseEntry.followUpKeys) {
      const followUp = NLH_CASH_COURSES_BY_KEY.get(followUpKey);
      if (!followUp?.prerequisiteKeys.includes(courseEntry.key)) {
        staleFollowUpKeys.push(`${courseEntry.key}->${followUpKey}`);
      }
    }
  }

  const cycles = findCycles();

  return {
    valid:
      duplicateCourseKeys.length === 0 &&
      invalidRegionCourseKeys.length === 0 &&
      missingReferenceKeys.length === 0 &&
      staleFollowUpKeys.length === 0 &&
      missingRiskNotes.length === 0 &&
      prerequisiteOrderViolations.length === 0 &&
      copyViolations.length === 0 &&
      cycles.length === 0,
    regionCount: NLH_CASH_REGIONS.length,
    courseCount: NLH_CASH_COURSES.length,
    duplicateCourseKeys,
    invalidRegionCourseKeys,
    missingReferenceKeys,
    staleFollowUpKeys,
    missingRiskNotes,
    prerequisiteOrderViolations,
    copyViolations,
    cycles,
  };
};
