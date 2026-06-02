export type CsCourseLevel = 'pre-core' | 'core' | 'intermediate' | 'advanced' | 'project';
export type CsCourseSize = 'small' | 'medium' | 'large' | 'capstone';
export type CsAtlasHubType = 'course_hub' | 'project_hub' | 'support_hub';

export interface CsBachelorRegion {
  key: string;
  title: string;
  shortTitle: string;
  color: string;
  icon: string;
  description: string;
}

export interface CsBachelorCourse {
  key: string;
  title: string;
  regionKey: string;
  description: string;
  level: CsCourseLevel;
  yearHint: 1 | 2 | 3 | 4;
  semesterHint: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  prerequisiteKeys: string[];
  followUpKeys: string[];
  infrastructureObjectCandidate: boolean;
  infrastructureObjectName: string;
  atlasHubType: CsAtlasHubType;
  size: CsCourseSize;
}

type CourseSeed = Omit<CsBachelorCourse, 'followUpKeys' | 'infrastructureObjectCandidate' | 'infrastructureObjectName' | 'atlasHubType'> & {
  infrastructureObjectName?: string;
  atlasHubType?: CsAtlasHubType;
};

const course = (input: CourseSeed): CourseSeed => input;

export const CS_BACHELOR_REGIONS: CsBachelorRegion[] = [
  {
    key: 'programming',
    title: 'Программирование',
    shortTitle: 'Код',
    color: '#58d6ff',
    icon: 'code',
    description: 'Языки, парадигмы, инструменты и ежедневная инженерная практика.',
  },
  {
    key: 'mathematics',
    title: 'Математика',
    shortTitle: 'Математика',
    color: '#ffd166',
    icon: 'sigma',
    description: 'Анализ, алгебра, вероятность, логика и численные методы для информатики.',
  },
  {
    key: 'algorithms-theory',
    title: 'Алгоритмы и теория',
    shortTitle: 'Алгоритмы',
    color: '#5ee6b5',
    icon: 'route',
    description: 'Структуры данных, алгоритмы, графы, вычислимость, сложность и криптографическая база.',
  },
  {
    key: 'computer-systems',
    title: 'Компьютерные системы',
    shortTitle: 'Системы',
    color: '#f97316',
    icon: 'cpu',
    description: 'Архитектура, ОС, сети, базы данных, компиляторы, распределенные системы и безопасность.',
  },
  {
    key: 'data-ai',
    title: 'Данные и ИИ',
    shortTitle: 'Данные и ИИ',
    color: '#c084fc',
    icon: 'brain',
    description: 'Данные, модели, поиск, обучение и практические AI-системы.',
  },
  {
    key: 'software-product',
    title: 'Инженерия ПО и продукт',
    shortTitle: 'Инженерия ПО',
    color: '#38bdf8',
    icon: 'build',
    description: 'Архитектура, команда, интерфейсы, визуализация, надежность и коммуникация.',
  },
  {
    key: 'society-ethics-law',
    title: 'Общество, этика, право',
    shortTitle: 'Этика',
    color: '#a3e635',
    icon: 'shield',
    description: 'Ответственность, приватность, право данных и социальные последствия технологий.',
  },
  {
    key: 'projects',
    title: 'Проекты',
    shortTitle: 'Проекты',
    color: '#fb7185',
    icon: 'flag',
    description: 'Проектные работы, исследования, практика и выпускной проект.',
  },
];

const COURSE_SEEDS: CourseSeed[] = [
  course({
    key: 'programming-intro',
    title: 'Введение в программирование',
    regionKey: 'programming',
    description: 'Базовые идеи программирования, переменные, условия, циклы, функции и первые программы.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 1,
    prerequisiteKeys: [],
    size: 'large',
  }),
  course({
    key: 'programming-practice',
    title: 'Практика программирования',
    regionKey: 'programming',
    description: 'Регулярное написание небольших программ, чтение чужого кода, разбор ошибок и аккуратная разработка.',
    level: 'core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: ['programming-intro', 'developer-tools'],
    size: 'medium',
  }),
  course({
    key: 'program-structure-interpretation',
    title: 'Структура и интерпретация программ',
    regionKey: 'programming',
    description: 'Абстракции, интерпретация, композиция программ и устройство вычислений на уровне идей.',
    level: 'intermediate',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['programming-practice', 'discrete-math'],
    size: 'large',
  }),
  course({
    key: 'oop',
    title: 'Объектно-ориентированное программирование',
    regionKey: 'programming',
    description: 'Объекты, классы, интерфейсы, инкапсуляция, наследование и проектирование устойчивых моделей.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['programming-practice'],
    size: 'medium',
  }),
  course({
    key: 'functional-programming',
    title: 'Функциональное программирование',
    regionKey: 'programming',
    description: 'Функции как значения, неизменяемость, рекурсия, композиция и выразительные типы.',
    level: 'intermediate',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['program-structure-interpretation'],
    size: 'medium',
  }),
  course({
    key: 'programming-languages',
    title: 'Языки программирования',
    regionKey: 'programming',
    description: 'Синтаксис, типы, семантика, выполнение программ и выбор языка под задачу.',
    level: 'advanced',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['program-structure-interpretation', 'functional-programming'],
    size: 'medium',
  }),
  course({
    key: 'testing-debugging',
    title: 'Тестирование и отладка',
    regionKey: 'programming',
    description: 'Тест-кейсы, трассировка, воспроизведение ошибок, модульные проверки и регрессии.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['programming-practice', 'developer-tools'],
    atlasHubType: 'support_hub',
    size: 'medium',
  }),
  course({
    key: 'developer-tools',
    title: 'Инструменты разработчика',
    regionKey: 'programming',
    description: 'Терминал, Git, сборка, окружения, редакторы и рабочие привычки разработчика.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 1,
    prerequisiteKeys: [],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'calculus-1',
    title: 'Математический анализ I',
    regionKey: 'mathematics',
    description: 'Пределы, производные, функции одной переменной и базовая математическая аккуратность.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 1,
    prerequisiteKeys: [],
    size: 'medium',
  }),
  course({
    key: 'calculus-2',
    title: 'Математический анализ II',
    regionKey: 'mathematics',
    description: 'Интегралы, ряды, функции нескольких переменных и инструменты для моделей.',
    level: 'core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: ['calculus-1'],
    size: 'medium',
  }),
  course({
    key: 'linear-algebra',
    title: 'Линейная алгебра',
    regionKey: 'mathematics',
    description: 'Векторы, матрицы, линейные пространства, преобразования и геометрия данных.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 1,
    prerequisiteKeys: [],
    size: 'large',
  }),
  course({
    key: 'discrete-math',
    title: 'Дискретная математика',
    regionKey: 'mathematics',
    description: 'Множества, логика, отношения, индукция, комбинаторика, графы и язык доказательств.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: [],
    size: 'large',
  }),
  course({
    key: 'probability-statistics',
    title: 'Вероятность и статистика',
    regionKey: 'mathematics',
    description: 'Случайные величины, распределения, статистика, оценивание и неопределенность.',
    level: 'core',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['calculus-1', 'linear-algebra'],
    size: 'large',
  }),
  course({
    key: 'logic-proofs',
    title: 'Математическая логика и доказательства',
    regionKey: 'mathematics',
    description: 'Формальные утверждения, выводы, доказательства, корректность и строгий язык рассуждений.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['discrete-math'],
    size: 'medium',
  }),
  course({
    key: 'optimization',
    title: 'Оптимизация',
    regionKey: 'mathematics',
    description: 'Целевые функции, ограничения, градиенты, выпуклые задачи и вычислительная оптимизация.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['calculus-2', 'linear-algebra'],
    size: 'medium',
  }),
  course({
    key: 'numerical-methods',
    title: 'Численные методы',
    regionKey: 'mathematics',
    description: 'Приближенные вычисления, устойчивость, ошибки, линейные системы и численное моделирование.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['calculus-2', 'linear-algebra', 'programming-practice'],
    size: 'medium',
  }),
  course({
    key: 'data-structures',
    title: 'Структуры данных',
    regionKey: 'algorithms-theory',
    description: 'Массивы, списки, стек, очередь, деревья, хеш-таблицы, графы и компромиссы хранения.',
    level: 'core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: ['programming-practice', 'discrete-math'],
    size: 'large',
  }),
  course({
    key: 'algorithms-1',
    title: 'Алгоритмы I',
    regionKey: 'algorithms-theory',
    description: 'Сложность, поиск, сортировка, рекурсия, жадные идеи, динамика и первые графовые алгоритмы.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['data-structures', 'logic-proofs'],
    size: 'large',
  }),
  course({
    key: 'algorithms-2',
    title: 'Алгоритмы II',
    regionKey: 'algorithms-theory',
    description: 'Продвинутые алгоритмы, графы, потоки, динамическое программирование и анализ эффективности.',
    level: 'intermediate',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['algorithms-1', 'graphs-combinatorics'],
    size: 'large',
  }),
  course({
    key: 'graphs-combinatorics',
    title: 'Графы и комбинаторика',
    regionKey: 'algorithms-theory',
    description: 'Графовые модели, обходы, связность, раскраски, подсчет и дискретные структуры.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['data-structures', 'discrete-math'],
    size: 'medium',
  }),
  course({
    key: 'automata-formal-languages',
    title: 'Автоматы и формальные языки',
    regionKey: 'algorithms-theory',
    description: 'Автоматы, регулярные языки, грамматики, распознавание и границы формальных моделей.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['logic-proofs'],
    size: 'medium',
  }),
  course({
    key: 'computability-complexity',
    title: 'Вычислимость и сложность',
    regionKey: 'algorithms-theory',
    description: 'Разрешимость, сводимость, классы сложности и границы того, что можно эффективно вычислить.',
    level: 'advanced',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['automata-formal-languages', 'algorithms-2'],
    size: 'medium',
  }),
  course({
    key: 'randomized-algorithms',
    title: 'Рандомизированные алгоритмы',
    regionKey: 'algorithms-theory',
    description: 'Вероятностные методы, случайные выборки, ожидание, концентрация и алгоритмы с вероятностью ошибки.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['probability-statistics', 'algorithms-2'],
    size: 'small',
  }),
  course({
    key: 'cryptography-basics',
    title: 'Криптография: основы',
    regionKey: 'algorithms-theory',
    description: 'Шифрование, хеширование, подписи, протоколы и математические основания безопасности.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['probability-statistics', 'computability-complexity'],
    size: 'medium',
  }),
  course({
    key: 'computer-architecture',
    title: 'Архитектура компьютеров',
    regionKey: 'computer-systems',
    description: 'Процессор, память, инструкции, представление данных и связь программ с железом.',
    level: 'core',
    yearHint: 2,
    semesterHint: 3,
    prerequisiteKeys: ['digital-logic', 'programming-intro'],
    size: 'medium',
  }),
  course({
    key: 'digital-logic',
    title: 'Цифровая логика',
    regionKey: 'computer-systems',
    description: 'Логические схемы, булева алгебра, комбинационные и последовательностные устройства.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: ['discrete-math'],
    size: 'small',
  }),
  course({
    key: 'operating-systems',
    title: 'Операционные системы',
    regionKey: 'computer-systems',
    description: 'Процессы, память, файловые системы, синхронизация, планирование и системные вызовы.',
    level: 'intermediate',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['computer-architecture', 'programming-practice'],
    size: 'large',
  }),
  course({
    key: 'networks',
    title: 'Сети',
    regionKey: 'computer-systems',
    description: 'Протоколы, маршрутизация, транспорт, надежность, безопасность и устройство интернета.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['operating-systems'],
    size: 'medium',
  }),
  course({
    key: 'databases',
    title: 'Базы данных',
    regionKey: 'computer-systems',
    description: 'Модели данных, SQL, связи, индексы, транзакции, ограничения и проектирование схем.',
    level: 'core',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['data-structures'],
    size: 'large',
  }),
  course({
    key: 'compilers',
    title: 'Компиляторы',
    regionKey: 'computer-systems',
    description: 'Лексический анализ, синтаксис, семантика, промежуточные представления и генерация кода.',
    level: 'advanced',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['program-structure-interpretation', 'automata-formal-languages'],
    size: 'medium',
  }),
  course({
    key: 'parallel-computing',
    title: 'Параллельные вычисления',
    regionKey: 'computer-systems',
    description: 'Потоки, задачи, синхронизация, параллельные модели и измерение ускорения.',
    level: 'advanced',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['operating-systems', 'algorithms-1'],
    size: 'medium',
  }),
  course({
    key: 'distributed-systems',
    title: 'Распределенные системы',
    regionKey: 'computer-systems',
    description: 'Согласованность, отказоустойчивость, репликация, очереди, сервисы и сетевые сбои.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['networks', 'databases', 'operating-systems'],
    size: 'large',
  }),
  course({
    key: 'systems-security',
    title: 'Безопасность компьютерных систем',
    regionKey: 'computer-systems',
    description: 'Модели угроз, уязвимости, защита систем, контроль доступа и практики безопасной разработки.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['operating-systems', 'networks', 'privacy-data-law'],
    size: 'medium',
  }),
  course({
    key: 'data-analysis',
    title: 'Анализ данных',
    regionKey: 'data-ai',
    description: 'Подготовка данных, исследовательский анализ, статистические выводы и практические отчеты.',
    level: 'core',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['probability-statistics', 'programming-practice'],
    size: 'medium',
  }),
  course({
    key: 'machine-learning',
    title: 'Машинное обучение',
    regionKey: 'data-ai',
    description: 'Обучение моделей, признаки, обобщение, валидация, метрики и типовые алгоритмы.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['probability-statistics', 'linear-algebra', 'optimization', 'programming-practice'],
    size: 'large',
  }),
  course({
    key: 'deep-learning',
    title: 'Глубокое обучение',
    regionKey: 'data-ai',
    description: 'Нейронные сети, оптимизация, сверточные и последовательностные модели, обучение и регуляризация.',
    level: 'advanced',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['machine-learning'],
    size: 'medium',
  }),
  course({
    key: 'artificial-intelligence',
    title: 'Искусственный интеллект',
    regionKey: 'data-ai',
    description: 'Поиск, планирование, представление знаний, агенты и практические интеллектуальные системы.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['algorithms-2', 'probability-statistics'],
    size: 'medium',
  }),
  course({
    key: 'natural-language-processing',
    title: 'Обработка естественного языка',
    regionKey: 'data-ai',
    description: 'Тексты, токены, представления, языковые модели, поиск смысла и оценка NLP-систем.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['machine-learning', 'artificial-intelligence'],
    size: 'medium',
  }),
  course({
    key: 'information-retrieval',
    title: 'Информационный поиск',
    regionKey: 'data-ai',
    description: 'Индексация, ранжирование, релевантность, поисковые метрики и работа с корпусами.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['data-analysis', 'algorithms-1'],
    size: 'small',
  }),
  course({
    key: 'data-engineering',
    title: 'Инженерия данных',
    regionKey: 'data-ai',
    description: 'Пайплайны, хранилища, потоки данных, качество, оркестрация и эксплуатация данных.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['databases', 'distributed-systems'],
    size: 'medium',
  }),
  course({
    key: 'software-architecture',
    title: 'Архитектура программных систем',
    regionKey: 'software-product',
    description: 'Модули, границы, зависимости, архитектурные решения, масштабирование и поддерживаемость.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['oop', 'testing-debugging'],
    size: 'medium',
  }),
  course({
    key: 'team-development',
    title: 'Командная разработка',
    regionKey: 'software-product',
    description: 'Code review, ветвление, договоренности, совместная работа и устойчивые процессы команды.',
    level: 'core',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['developer-tools', 'testing-debugging'],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'interface-design',
    title: 'Проектирование интерфейсов',
    regionKey: 'software-product',
    description: 'Пользовательские сценарии, прототипы, доступность, визуальная структура и обратная связь.',
    level: 'core',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['programming-practice'],
    size: 'small',
  }),
  course({
    key: 'data-visualization',
    title: 'Визуализация данных',
    regionKey: 'software-product',
    description: 'Графики, дашборды, визуальные кодировки, сравнения и честная подача данных.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['data-analysis', 'interface-design'],
    size: 'small',
  }),
  course({
    key: 'reliability-observability-operations',
    title: 'Надежность, наблюдаемость и эксплуатация',
    regionKey: 'software-product',
    description: 'Логи, метрики, алерты, инциденты, деплой, надежность и эксплуатационная зрелость.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['distributed-systems', 'testing-debugging'],
    atlasHubType: 'support_hub',
    size: 'medium',
  }),
  course({
    key: 'project-management-technical-communication',
    title: 'Управление проектом и техническая коммуникация',
    regionKey: 'software-product',
    description: 'Планирование, риски, документация, технические решения, презентация и синхронизация команды.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['team-development', 'project-software-product'],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'computing-ethics',
    title: 'Этика вычислений',
    regionKey: 'society-ethics-law',
    description: 'Ответственность инженера, вред, справедливость, прозрачность и социальные последствия решений.',
    level: 'pre-core',
    yearHint: 1,
    semesterHint: 2,
    prerequisiteKeys: ['programming-intro'],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'privacy-data-law',
    title: 'Приватность и право данных',
    regionKey: 'society-ethics-law',
    description: 'Персональные данные, согласие, хранение, правовые рамки и уважение приватности пользователей.',
    level: 'intermediate',
    yearHint: 3,
    semesterHint: 5,
    prerequisiteKeys: ['databases', 'computing-ethics'],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'ai-safety-social-impact',
    title: 'Безопасность ИИ и социальные последствия технологий',
    regionKey: 'society-ethics-law',
    description: 'Риски ИИ, оценка воздействия, ограничения автоматизации и ответственность при внедрении моделей.',
    level: 'advanced',
    yearHint: 4,
    semesterHint: 8,
    prerequisiteKeys: ['artificial-intelligence', 'computing-ethics'],
    atlasHubType: 'support_hub',
    size: 'small',
  }),
  course({
    key: 'project-software-product',
    title: 'Проект I: программный продукт',
    regionKey: 'projects',
    description: 'Командная разработка небольшого продукта с понятным пользователем, задачей и результатом.',
    level: 'project',
    yearHint: 2,
    semesterHint: 4,
    prerequisiteKeys: ['programming-practice', 'team-development', 'interface-design'],
    atlasHubType: 'project_hub',
    size: 'capstone',
  }),
  course({
    key: 'project-systems',
    title: 'Проект II: системный проект',
    regionKey: 'projects',
    description: 'Проектирование и реализация системы с сетями, данными, отказами и эксплуатационными ограничениями.',
    level: 'project',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['distributed-systems', 'systems-security'],
    atlasHubType: 'project_hub',
    size: 'capstone',
  }),
  course({
    key: 'project-research',
    title: 'Проект III: исследовательский проект',
    regionKey: 'projects',
    description: 'Постановка вопроса, обзор подходов, эксперимент, выводы и аккуратная исследовательская коммуникация.',
    level: 'project',
    yearHint: 4,
    semesterHint: 7,
    prerequisiteKeys: ['machine-learning', 'computability-complexity'],
    atlasHubType: 'project_hub',
    size: 'capstone',
  }),
  course({
    key: 'capstone-thesis',
    title: 'Выпускной проект / диплом',
    regionKey: 'projects',
    description: 'Итоговая работа бакалавриата: самостоятельная постановка, реализация, оценка и защита результата.',
    level: 'project',
    yearHint: 4,
    semesterHint: 8,
    prerequisiteKeys: ['project-software-product', 'project-systems', 'project-research', 'practice-open-source'],
    atlasHubType: 'project_hub',
    size: 'capstone',
  }),
  course({
    key: 'practice-open-source',
    title: 'Практика или open-source вклад',
    regionKey: 'projects',
    description: 'Работа в реальном коде или практической среде: вклад, сопровождение, коммуникация и ответственность.',
    level: 'project',
    yearHint: 3,
    semesterHint: 6,
    prerequisiteKeys: ['developer-tools', 'team-development', 'testing-debugging'],
    atlasHubType: 'project_hub',
    size: 'medium',
  }),
];

const followUpKeysFor = (courseKey: string) =>
  COURSE_SEEDS.filter((courseEntry) => courseEntry.prerequisiteKeys.includes(courseKey)).map((courseEntry) => courseEntry.key);

export const CS_BACHELOR_COURSES: CsBachelorCourse[] = COURSE_SEEDS.map((courseEntry) => ({
  ...courseEntry,
  followUpKeys: followUpKeysFor(courseEntry.key),
  infrastructureObjectCandidate: true,
  infrastructureObjectName: courseEntry.infrastructureObjectName ?? courseEntry.title,
  atlasHubType: courseEntry.atlasHubType ?? 'course_hub',
}));

export const CS_BACHELOR_COURSE_KEYS = CS_BACHELOR_COURSES.map((courseEntry) => courseEntry.key);
export const CS_BACHELOR_COURSES_BY_KEY = new Map(CS_BACHELOR_COURSES.map((courseEntry) => [courseEntry.key, courseEntry]));
export const CS_BACHELOR_REGIONS_BY_KEY = new Map(CS_BACHELOR_REGIONS.map((region) => [region.key, region]));

export const findCsBachelorCourse = (key: string) => CS_BACHELOR_COURSES_BY_KEY.get(key) ?? null;

export const compareCsBachelorCourseRouteOrder = (left: CsBachelorCourse, right: CsBachelorCourse) =>
  left.semesterHint - right.semesterHint ||
  CS_BACHELOR_REGIONS.findIndex((region) => region.key === left.regionKey) -
    CS_BACHELOR_REGIONS.findIndex((region) => region.key === right.regionKey) ||
  left.title.localeCompare(right.title, 'ru-RU');

export const getCsBachelorCoursesInRouteOrder = () => [...CS_BACHELOR_COURSES].sort(compareCsBachelorCourseRouteOrder);

export const validateCsBachelorCatalog = () => {
  const regionKeys = new Set(CS_BACHELOR_REGIONS.map((region) => region.key));
  const courseKeys = new Set<string>();
  const duplicateCourseKeys: string[] = [];
  const invalidRegionCourseKeys: string[] = [];
  const missingReferenceKeys: string[] = [];
  const staleFollowUpKeys: string[] = [];
  const prerequisiteOrderViolations: string[] = [];

  for (const courseEntry of CS_BACHELOR_COURSES) {
    if (courseKeys.has(courseEntry.key)) {
      duplicateCourseKeys.push(courseEntry.key);
    }
    courseKeys.add(courseEntry.key);
    if (!regionKeys.has(courseEntry.regionKey)) {
      invalidRegionCourseKeys.push(courseEntry.key);
    }
  }

  const routeOrderIndex = new Map(getCsBachelorCoursesInRouteOrder().map((courseEntry, index) => [courseEntry.key, index]));
  for (const courseEntry of CS_BACHELOR_COURSES) {
    const courseIndex = routeOrderIndex.get(courseEntry.key) ?? -1;
    for (const prerequisiteKey of courseEntry.prerequisiteKeys) {
      const prerequisiteIndex = routeOrderIndex.get(prerequisiteKey) ?? -1;
      if (prerequisiteIndex >= courseIndex) {
        prerequisiteOrderViolations.push(`${courseEntry.key}<-${prerequisiteKey}`);
      }
    }
  }

  for (const courseEntry of CS_BACHELOR_COURSES) {
    for (const key of [...courseEntry.prerequisiteKeys, ...courseEntry.followUpKeys]) {
      if (!courseKeys.has(key)) {
        missingReferenceKeys.push(`${courseEntry.key}->${key}`);
      }
    }
    const expectedFollowUps = followUpKeysFor(courseEntry.key).sort();
    const actualFollowUps = [...courseEntry.followUpKeys].sort();
    if (expectedFollowUps.join('|') !== actualFollowUps.join('|')) {
      staleFollowUpKeys.push(courseEntry.key);
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycles: string[][] = [];
  const stack: string[] = [];

  const visit = (key: string) => {
    if (visited.has(key)) {
      return;
    }
    if (visiting.has(key)) {
      const startIndex = stack.indexOf(key);
      cycles.push([...stack.slice(Math.max(0, startIndex)), key]);
      return;
    }

    visiting.add(key);
    stack.push(key);
    for (const prerequisiteKey of CS_BACHELOR_COURSES_BY_KEY.get(key)?.prerequisiteKeys ?? []) {
      visit(prerequisiteKey);
    }
    stack.pop();
    visiting.delete(key);
    visited.add(key);
  };

  for (const key of courseKeys) {
    visit(key);
  }

  return {
    regionCount: CS_BACHELOR_REGIONS.length,
    courseCount: CS_BACHELOR_COURSES.length,
    duplicateCourseKeys,
    invalidRegionCourseKeys,
    missingReferenceKeys,
    staleFollowUpKeys,
    prerequisiteOrderViolations,
    cycles,
    valid:
      CS_BACHELOR_REGIONS.length === 8 &&
      CS_BACHELOR_COURSES.length === 54 &&
      duplicateCourseKeys.length === 0 &&
      invalidRegionCourseKeys.length === 0 &&
      missingReferenceKeys.length === 0 &&
      staleFollowUpKeys.length === 0 &&
      prerequisiteOrderViolations.length === 0 &&
      cycles.length === 0,
  };
};
