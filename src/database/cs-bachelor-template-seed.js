import { createUtcTimestamp } from '../stores/store-helpers.js';

export const CS_BACHELOR_TEMPLATE_SLUG = 'template-cs-bachelor';

const CS_BACHELOR_STATS = [
  { key: 'programming', title: 'Программирование', color: '#58d6ff', icon: 'code', sort_order: 0 },
  { key: 'math-reasoning', title: 'Мат. мышление', color: '#ffd166', icon: 'sigma', sort_order: 1 },
  { key: 'structures', title: 'Структуры', color: '#5ee6b5', icon: 'network', sort_order: 2 },
  { key: 'algorithms', title: 'Алгоритмы', color: '#fb7185', icon: 'route', sort_order: 3 },
  { key: 'databases', title: 'Базы данных', color: '#38bdf8', icon: 'database', sort_order: 4 },
  { key: 'debugging', title: 'Отладка', color: '#c084fc', icon: 'bug', sort_order: 5 },
  { key: 'systems-intuition', title: 'Системное мышление', color: '#f97316', icon: 'cpu', sort_order: 6 },
];

const BRANCHES = [
  {
    id: 'programming-fundamentals',
    title: 'Основы программирования',
    statKey: 'programming',
    summary: 'Синтаксис, управление ходом программы, функции, представление данных, отладка и небольшие программы.',
  },
  {
    id: 'discrete-math',
    title: 'Дискретная математика',
    statKey: 'math-reasoning',
    summary: 'Логика, множества, доказательства, индукция, отношения, подсчет и словарь графов.',
  },
  {
    id: 'data-structures',
    title: 'Структуры данных',
    statKey: 'structures',
    summary: 'Основные абстрактные типы данных, представления, стоимость операций и компромиссы.',
  },
  {
    id: 'algorithms',
    title: 'Алгоритмы',
    statKey: 'algorithms',
    summary: 'Сложность, поиск, сортировка, рекурсия, жадные решения, динамическое программирование и графы.',
  },
  {
    id: 'databases',
    title: 'Базы данных',
    statKey: 'databases',
    summary: 'Моделирование данных, реляционные таблицы, SQL-запросы, соединения, ограничения, индексы, транзакции и небольшой проект базы.',
  },
  {
    id: 'debugging-and-testing',
    title: 'Отладка и тестирование',
    statKey: 'debugging',
    summary: 'Воспроизведение ошибок, трассировка, проверки, модульные тесты и восстановление после крайних случаев.',
  },
  {
    id: 'math-notation-and-proof-support',
    title: 'Математическая запись',
    statKey: 'math-reasoning',
    summary: 'Свободное чтение обозначений, перевод утверждений, каркасы доказательств и рекуррентные соотношения.',
  },
  {
    id: 'memory-model-intro',
    title: 'Модель памяти',
    statKey: 'systems-intuition',
    summary: 'Значения, ссылки, стек, куча, псевдонимы и стоимость изменений.',
  },
];

const assessment = (type, extra = {}) => ({
  check_method: 'strict',
  strict_check_type: type,
  prompt: extra.prompt ?? 'Выполните проверку для этого узла.',
  expected_summary: extra.expected_summary ?? null,
  ...extra,
});

const llmAssessment = (extra = {}) => ({
  check_method: 'llm_assisted',
  prompt: extra.prompt ?? 'Объясните понятие и обоснуйте ответ.',
  rubric: extra.rubric ?? extra.expected_summary ?? 'Ответ должен быть конкретным, правильным и связанным со сценарием.',
  expected_summary: extra.expected_summary ?? extra.rubric ?? null,
  ...extra,
});

const NODE_CHECKS = {
  'pf-01-programming-environment': assessment('checklist', {
    prompt: 'Подтвердите, что можете открыть редактор, запустить программу и сохранить первый файл.',
    items: [
      { id: 'editor', label: 'Редактор открывается', required: true },
      { id: 'run', label: 'Программа запускается', required: true },
      { id: 'save', label: 'Файл сохранен', required: true },
    ],
  }),
  'pf-02-values-variables-types': assessment('exact', {
    prompt: 'После x = 3 и x = x + 2 какое значение хранится в x?',
    expected_answer: '5',
  }),
  'pf-03-expressions-and-operators': assessment('number', {
    prompt: 'Чему равно 2 + 3 * 4?',
    expected_number: 14,
    tolerance: 0,
  }),
  'pf-04-branching-with-conditionals': assessment('contains', {
    prompt: 'Объясните, когда выполняется ветка if/else.',
    required_terms: ['условие', 'истина'],
  }),
  'pf-06-functions-and-parameters': assessment('contains', {
    prompt: 'Объясните, как параметры помогают не повторять код.',
    required_terms: ['вход', 'повтор'],
  }),
  'pf-08-arrays-and-lists': assessment('checklist', {
    prompt: 'Поработайте со списком: чтение по индексу, добавление и перебор.',
    items: [
      { id: 'index', label: 'Прочитать по индексу', required: true },
      { id: 'append', label: 'Добавить значение', required: true },
      { id: 'iterate', label: 'Перебрать все значения', required: true },
    ],
  }),
  'pf-12-small-program-design': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Соберите небольшую консольную программу с вводом, ветвлениями, циклами и функциями.',
    expected_summary: 'Проверяющий подтверждает, что программа проходит чек-лист.',
  },
  'dm-01-sets-and-membership': assessment('exact', {
    prompt: 'Какой символ обычно читается как "принадлежит множеству"?',
    expected_answers: ['∈', 'in', 'принадлежит'],
  }),
  'dm-03-truth-tables': assessment('number', {
    prompt: 'Сколько строк в таблице истинности для трех высказываний?',
    expected_number: 8,
    tolerance: 0,
  }),
  'dm-05-direct-proofs': assessment('checklist', {
    prompt: 'Набросайте прямое доказательство от предпосылок к выводу.',
    items: [
      { id: 'assumptions', label: 'Указать предпосылки', required: true },
      { id: 'steps', label: 'Записать обоснованные шаги', required: true },
      { id: 'conclusion', label: 'Сформулировать вывод', required: true },
    ],
  }),
  'dm-10-graph-vocabulary': assessment('exact', {
    prompt: 'Как обычно называется связь между двумя вершинами графа?',
    expected_answers: ['ребро', 'edge'],
  }),
  'ds-01-abstract-data-types': assessment('contains', {
    prompt: 'Объясните абстрактный тип данных без привязки к одной реализации.',
    required_terms: ['операции', 'поведение'],
  }),
  'ds-02-arrays-and-dynamic-arrays': assessment('number', {
    prompt: 'Какой уровень Big-O без степени обычно описывает доступ к массиву по индексу?',
    expected_number: 1,
    tolerance: 0,
  }),
  'ds-04-stacks': assessment('exact', {
    prompt: 'Какую политику извлечения использует стек?',
    expected_answers: ['LIFO', 'последним пришел первым вышел'],
  }),
  'ds-07-trees': assessment('contains', {
    prompt: 'Объясните, почему деревья полезны для иерархических данных.',
    required_terms: ['родитель', 'дочер'],
  }),
  'ds-08-binary-search-trees': llmAssessment({
    prompt: 'Объясните, почему сбалансированное бинарное дерево поиска сохраняет поиск эффективным.',
    rubric: 'Ответ должен упомянуть порядок, левое и правое поддерево, баланс и интуицию логарифмического поиска.',
  }),
  'ds-09-hash-tables': assessment('number', {
    prompt: 'Какой уровень Big-O без степени обычно описывает средний поиск в хеш-таблице?',
    expected_number: 1,
    tolerance: 0,
  }),
  'ds-10-heaps-and-priority-queues': assessment('contains', {
    prompt: 'Объясните, почему куча подходит для многократного выбора следующего приоритетного элемента.',
    required_terms: ['приоритет', 'миним'],
  }),
  'ds-11-graph-representations': assessment('checklist', {
    prompt: 'Сравните списки смежности и матрицы смежности.',
    items: [
      { id: 'space', label: 'Сравнить расход памяти', required: true },
      { id: 'neighbors', label: 'Сравнить перебор соседей', required: true },
    ],
  }),
  'ds-12-data-structure-tradeoffs': llmAssessment({
    prompt: 'Сравните массивы, хеш-таблицы и графы для конкретного сценария.',
    rubric: 'Ответ должен обосновать выбор через операции, ограничения и компромиссы представления.',
    expected_summary: 'Ответ должен обосновать выбор через операции и ограничения.',
  }),
  'al-01-algorithmic-thinking': assessment('contains', {
    prompt: 'Объясните, чем алгоритм отличается от программы на конкретном языке.',
    required_terms: ['шаг', 'вход'],
  }),
  'al-02-asymptotic-complexity': assessment('number', {
    prompt: 'Если один цикл один раз просматривает n элементов, какой это уровень Big-O без степени?',
    expected_number: 1,
    tolerance: 0,
  }),
  'al-03-linear-and-binary-search': assessment('number', {
    prompt: 'Сколько раз бинарный поиск может делить 16 отсортированных элементов пополам, пока не останется один?',
    expected_number: 4,
    tolerance: 0,
  }),
  'al-04-sorting-basics': assessment('contains', {
    prompt: 'Объясните, что сортировка меняет и что сохраняет.',
    required_terms: ['порядок', 'элемент'],
  }),
  'al-05-divide-and-conquer': assessment('checklist', {
    prompt: 'Разберите алгоритм "разделяй и властвуй" по шагам.',
    items: [
      { id: 'split', label: 'Разделить задачу', required: true },
      { id: 'solve', label: 'Решить подзадачи', required: true },
      { id: 'combine', label: 'Объединить результаты', required: true },
    ],
  }),
  'al-07-greedy-intuition': llmAssessment({
    prompt: 'Объясните, когда локально лучший выбор может хватить для общего решения.',
    rubric: 'Ответ должен описать локальный выбор, ограничения и почему жадному выбору нужно доказательство корректности.',
  }),
  'al-08-dynamic-programming-intuition': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Решите небольшую задачу с пересекающимися подзадачами через таблицу или мемоизированную рекурсию.',
    expected_summary: 'Проверяющий подтверждает, что в решении указаны состояние, переход и базовые случаи.',
  },
  'al-09-graph-traversal': assessment('checklist', {
    prompt: 'Разберите обход графа в ширину.',
    items: [
      { id: 'queue', label: 'Использовать очередь', required: true },
      { id: 'visited', label: 'Отмечать посещенные вершины', required: true },
    ],
  }),
  'al-10-shortest-path-intuition': assessment('contains', {
    prompt: 'Объясните, когда веса ребер важны для кратчайших путей.',
    required_terms: ['вес', 'путь'],
  }),
  'db-01-data-modeling-purpose': assessment('checklist', {
    prompt: 'Смоделируйте маленькую библиотеку или трекер привычек до создания таблиц.',
    items: [
      { id: 'entities', label: 'Перечислить основные сущности', required: true },
      { id: 'attributes', label: 'Перечислить важные атрибуты', required: true },
      { id: 'relationships', label: 'Назвать хотя бы одну связь', required: true },
    ],
  }),
  'db-02-entities-attributes-relationships': assessment('contains', {
    prompt: 'Объясните разницу между сущностями, атрибутами и связями.',
    required_terms: ['сущ', 'атрибут', 'связ'],
  }),
  'db-03-primary-keys': assessment('exact', {
    prompt: 'Какой ключ однозначно определяет одну строку таблицы?',
    expected_answers: ['первичный ключ', 'primary key'],
  }),
  'db-04-tables-and-rows': assessment('number', {
    prompt: 'В таблице 4 строки, одну строку удалили. Сколько строк осталось?',
    expected_number: 3,
    tolerance: 0,
  }),
  'db-05-basic-select': assessment('contains', {
    prompt: 'Объясните, что делают SELECT и WHERE в простом запросе.',
    required_terms: ['select', 'where'],
  }),
  'db-06-filter-sort-project': assessment('checklist', {
    prompt: 'Составьте план запроса: выбрать столбцы, отфильтровать строки и упорядочить результат.',
    items: [
      { id: 'project', label: 'Выбрать возвращаемые столбцы', required: true },
      { id: 'filter', label: 'Отфильтровать строки условием', required: true },
      { id: 'sort', label: 'Отсортировать результат', required: false },
    ],
  }),
  'db-07-foreign-keys': assessment('exact', {
    prompt: 'Какой ключ указывает из одной таблицы на строку в другой таблице?',
    expected_answers: ['внешний ключ', 'foreign key'],
  }),
  'db-08-inner-joins': assessment('contains', {
    prompt: 'Объясните, почему внутреннему соединению нужны совпадающие значения между таблицами.',
    required_terms: ['совпад', 'ключ'],
  }),
  'db-09-join-cardinality': llmAssessment({
    prompt: 'Сравните связи один-ко-многим и многие-ко-многим на конкретном примере.',
    rubric: 'Ответ должен назвать оба вида связей, объяснить таблицу-связку для многие-ко-многим и не путать строки с таблицами.',
  }),
  'db-10-normalization-basics': assessment('checklist', {
    prompt: 'Нормализуйте маленькую таблицу с повторяющимися адресами в более чистые таблицы.',
    items: [
      { id: 'repeat', label: 'Найти повторяющиеся данные', required: true },
      { id: 'split', label: 'Разделить на связанные таблицы', required: true },
      { id: 'keys', label: 'Связать таблицы ключами', required: true },
    ],
  }),
  'db-11-constraints': assessment('exact', {
    prompt: 'Какое SQL-ограничение запрещает повторяющиеся значения в столбце?',
    expected_answers: ['unique', 'уникальность', 'уникальное'],
  }),
  'db-12-indexes': assessment('number', {
    prompt: 'Для модели курса: какой уровень Big-O без степени описывает цель индексированного поиска?',
    expected_number: 1,
    tolerance: 0,
  }),
  'db-13-transactions': assessment('contains', {
    prompt: 'Объясните, почему перевод между двумя счетами должен использовать транзакцию.',
    required_terms: ['атомар', 'commit'],
  }),
  'db-14-acid-properties': assessment('exact', {
    prompt: 'Какая четырехбуквенная аббревиатура обозначает атомарность, согласованность, изоляцию и долговечность?',
    expected_answer: 'ACID',
  }),
  'db-15-isolation-and-races': llmAssessment({
    prompt: 'Объясните одну проблему, которая возникает, когда два пользователя одновременно обновляют одни данные.',
    rubric: 'Ответ должен упомянуть конкурентные обновления, устаревшее чтение или потерянные обновления, а также роль изоляции или блокировок.',
  }),
  'db-16-sql-injection': assessment('contains', {
    prompt: 'Объясните, почему параметризованные запросы помогают предотвращать SQL-инъекции.',
    required_terms: ['параметр', 'ввод'],
  }),
  'db-17-schema-migrations': assessment('checklist', {
    prompt: 'Спланируйте безопасное изменение схемы для добавления нового столбца.',
    items: [
      { id: 'backward', label: 'Сохранить старое поведение приложения', required: true },
      { id: 'backfill', label: 'Заполнить или задать значения для старых строк', required: true },
      { id: 'verify', label: 'Проверить новую форму данных', required: true },
    ],
  }),
  'db-18-crud-app-flow': assessment('checklist', {
    prompt: 'Проследите CRUD-поток от действия в интерфейсе до изменения в базе.',
    items: [
      { id: 'create', label: 'Создание или вставка разобраны', required: true },
      { id: 'read', label: 'Чтение или список разобраны', required: true },
      { id: 'update-delete', label: 'Обновление или удаление разобраны', required: true },
    ],
  }),
  'db-19-query-planning': assessment('contains', {
    prompt: 'Объясните, почему планировщику запросов важны фильтры, соединения и индексы.',
    required_terms: ['фильтр', 'индекс'],
  }),
  'db-20-aggregates-and-grouping': assessment('number', {
    prompt: 'Если GROUP BY status находит группы open, paused и done, сколько групп получилось?',
    expected_number: 3,
    tolerance: 0,
  }),
  'db-21-null-and-missing-data': assessment('contains', {
    prompt: 'Объясните, почему NULL не равен пустой строке.',
    required_terms: ['неизвест', 'пуст'],
  }),
  'db-22-backups-and-restore': assessment('checklist', {
    prompt: 'Опишите минимальную проверку резервной копии и восстановления.',
    items: [
      { id: 'backup', label: 'Создать резервную копию', required: true },
      { id: 'restore', label: 'Проверить восстановление', required: true },
    ],
  }),
  'db-23-embedded-vs-server-db': llmAssessment({
    prompt: 'Сравните встроенную и серверную базу данных для небольшого учебного настольного приложения.',
    rubric: 'Ответ должен сравнить развертывание, конкуренцию, локальное хранение и операционную сложность.',
  }),
  'db-24-orms-and-query-builders': assessment('contains', {
    prompt: 'Объясните один плюс и один риск ORM или конструктора запросов.',
    required_terms: ['запрос', 'сопостав'],
  }),
  'db-25-data-privacy-basics': assessment('checklist', {
    prompt: 'Классифицируйте данные перед сохранением.',
    items: [
      { id: 'personal', label: 'Выделить персональные данные', required: true },
      { id: 'retention', label: 'Решить, сколько хранить и когда удалять', required: true },
      { id: 'access', label: 'Ограничить доступ', required: true },
    ],
  }),
  'db-26-database-testing': assessment('checklist', {
    prompt: 'Протестируйте код, который читает и записывает строки базы данных.',
    items: [
      { id: 'setup', label: 'Создать известный тестовый набор данных', required: true },
      { id: 'assert', label: 'Проверить строки после операции', required: true },
      { id: 'cleanup', label: 'Изолировать тесты друг от друга', required: true },
    ],
  }),
  'db-27-performance-debugging': assessment('contains', {
    prompt: 'Объясните, с чего начать расследование медленного запроса к базе.',
    required_terms: ['индекс', 'план'],
  }),
  'db-28-small-database-project': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Спроектируйте маленькую функцию на базе данных: схема, запросы и тесты.',
    expected_summary: 'Проверяющий подтверждает, что проект включает таблицы, ограничения, минимум три запроса и план тестирования.',
  },
  'dt-02-tracing-state-by-hand': assessment('checklist', {
    prompt: 'Проследите состояние переменных в короткой программе.',
    items: [
      { id: 'initial', label: 'Записать начальное состояние', required: true },
      { id: 'updates', label: 'Записать каждое обновление', required: true },
    ],
  }),
  'dt-03-edge-cases': assessment('checklist', {
    prompt: 'Перечислите крайние случаи для функции, которая обрабатывает список чисел.',
    items: [
      { id: 'empty', label: 'Пустой список учтен', required: true },
      { id: 'single', label: 'Один элемент учтен', required: true },
      { id: 'duplicates', label: 'Дубликаты или повторяющиеся значения учтены', required: true },
    ],
  }),
  'dt-04-basic-unit-tests': {
    check_method: 'strict',
    strict_check_type: 'manual_strict',
    prompt: 'Напишите базовые модульные тесты для нормального, граничного и ошибочного ввода.',
    expected_summary: 'Проверяющий подтверждает, что тесты покрывают успешный путь и минимум два крайних случая.',
  },
  'ms-01-reading-symbols': assessment('exact', {
    prompt: 'Что обычно означает символ forall?',
    expected_answers: ['для всех', 'for all'],
  }),
  'ms-03-proof-skeletons': assessment('checklist', {
    prompt: 'Создайте каркас доказательства перед заполнением деталей.',
    items: [
      { id: 'given', label: 'Указать, что дано', required: true },
      { id: 'goal', label: 'Указать, что нужно доказать', required: true },
      { id: 'strategy', label: 'Выбрать стратегию доказательства', required: true },
    ],
  }),
  'ms-04-recurrence-notation': assessment('number', {
    prompt: 'Для T(n) = 2T(n/2) + n: сколько подзадач появляется при каждом разбиении?',
    expected_number: 2,
    tolerance: 0,
  }),
  'mm-01-values-vs-references': assessment('exact', {
    prompt: 'Как называется ситуация, когда два имени указывают на один изменяемый объект?',
    expected_answers: ['псевдоним', 'aliasing'],
  }),
  'mm-02-call-stack': assessment('contains', {
    prompt: 'Объясните, что отслеживает кадр стека вызовов.',
    required_terms: ['функц', 'локаль'],
  }),
  'mm-03-references-and-aliasing': assessment('checklist', {
    prompt: 'Проследите две ссылки, которые указывают на один список.',
    items: [
      { id: 'names', label: 'Назвать обе ссылки', required: true },
      { id: 'mutation', label: 'Показать одно изменение через оба имени', required: true },
    ],
  }),
  'mm-04-mutation-costs': assessment('number', {
    prompt: 'Если вставка в начало массива сдвигает n элементов, какой это уровень Big-O без степени?',
    expected_number: 1,
    tolerance: 0,
  }),
  'mm-05-memory-model-for-recursion': llmAssessment({
    prompt: 'Объясните, почему каждому рекурсивному вызову нужен свой кадр стека.',
    rubric: 'Ответ должен упомянуть отдельные параметры и локальные переменные, движение к базовому случаю и возврат значений.',
  }),
};

const NODE_OUTCOMES = {
  'pf-01-programming-environment': 'Настроить цикл редактор-запуск, чтобы писать, запускать и сохранять маленькие программы.',
  'pf-02-values-variables-types': 'Отслеживать значения при присваивании переменным и различать простые типы данных.',
  'pf-03-expressions-and-operators': 'Вычислять выражения с учетом приоритета операторов и базового поведения типов.',
  'pf-04-branching-with-conditionals': 'Использовать условия для выбора ветки и объяснять, какой путь выполнится.',
  'pf-05-loops-and-iteration': 'Повторять работу циклами, сохраняя понятное состояние цикла и условие остановки.',
  'pf-06-functions-and-parameters': 'Упаковывать повторяющуюся логику в функции с входами, выходами и понятными именами.',
  'pf-07-scope-and-lifetime': 'Предсказывать, какие переменные видны в блоке или вызове функции.',
  'pf-08-arrays-and-lists': 'Хранить упорядоченные коллекции и использовать индексы, добавление и перебор.',
  'pf-09-dictionaries-and-records': 'Представлять данные с ключами и сравнивать поиск по ключу с поиском по позиции.',
  'pf-10-input-output-and-parsing': 'Превращать ввод пользователя или файла в значения, которые программа может проверить и обработать.',
  'pf-11-debugging-basics': 'Воспроизводить ошибку, смотреть состояние и сужать место сбоя.',
  'pf-12-small-program-design': 'Объединять ввод, ветвления, циклы, функции и коллекции в небольшую законченную программу.',
  'dm-01-sets-and-membership': 'Использовать множества, принадлежность, подмножества и простые операции над множествами в примерах из информатики.',
  'dm-02-propositions-and-logic': 'Переводить условия в высказывания и рассуждать об истинных и ложных утверждениях.',
  'dm-03-truth-tables': 'Строить таблицы истинности для составных булевых выражений.',
  'dm-04-quantifiers': 'Читать и записывать утверждения с кванторами "для всех" и "существует".',
  'dm-05-direct-proofs': 'Писать прямое доказательство от предпосылок к заданному выводу.',
  'dm-06-contrapositive-and-contradiction': 'Выбирать контрапозицию или доказательство от противного, когда прямой путь неудобен.',
  'dm-07-induction': 'Использовать базовый случай и шаг индукции для доказательства утверждений о повторяющейся структуре.',
  'dm-08-functions-and-relations': 'Моделировать отображения и отношения через область определения, область значений и упорядоченные пары.',
  'dm-09-counting-basics': 'Считать простые варианты, произведения и комбинации, нужные для анализа алгоритмов.',
  'dm-10-graph-vocabulary': 'Использовать словарь графов: вершина, ребро, путь, степень, направленный и взвешенный граф.',
  'ds-01-abstract-data-types': 'Описывать структуру данных через операции до выбора реализации.',
  'ds-02-arrays-and-dynamic-arrays': 'Объяснять доступ по индексу, расширение и стоимость вставки для динамических массивов.',
  'ds-03-linked-lists': 'Прослеживать ссылки узлов и сравнивать связные списки с массивами для вставки и обхода.',
  'ds-04-stacks': 'Применять поведение "последним пришел - первым вышел" к вызовам, отмене действий и обходам.',
  'ds-05-queues': 'Применять поведение "первым пришел - первым вышел" к планированию и обработке в ширину.',
  'ds-06-recursion-for-structures': 'Использовать рекурсивное мышление на списках и деревьях с ясными базовыми случаями.',
  'ds-07-trees': 'Моделировать иерархические данные через корни, родителей, детей, листья и высоту.',
  'ds-08-binary-search-trees': 'Использовать упорядоченную структуру дерева для поиска, вставки и обхода.',
  'ds-09-hash-tables': 'Объяснять поиск по хешу, коллизии и среднее постоянное время.',
  'ds-10-heaps-and-priority-queues': 'Использовать порядок кучи, чтобы многократно получать следующий приоритетный элемент.',
  'ds-11-graph-representations': 'Выбирать списки или матрицы смежности по плотности графа и нужным операциям.',
  'ds-12-data-structure-tradeoffs': 'Выбирать структуру по нагрузке, ограничениям и стоимости операций.',
  'al-01-algorithmic-thinking': 'Формулировать входы, выходы, шаги и идею корректности до написания кода.',
  'al-02-asymptotic-complexity': 'Оценивать скорость роста через Big-O и сравнивать постоянную, линейную и квадратичную работу.',
  'al-03-linear-and-binary-search': 'Выбирать линейный или бинарный поиск по упорядоченности данных и ожидаемой стоимости.',
  'al-04-sorting-basics': 'Объяснять, что дает отсортированный порядок, и узнавать базовую стоимость сортировок.',
  'al-05-divide-and-conquer': 'Разделять задачу, решать подзадачи и объединять результаты.',
  'al-06-recursion-and-recurrences': 'Связывать рекурсивный код с рассуждениями о стоимости через рекуррентные соотношения.',
  'al-07-greedy-intuition': 'Распознавать жадные выборы и необходимость доказательства корректности.',
  'al-08-dynamic-programming-intuition': 'Находить пересекающиеся подзадачи и переиспользуемое состояние.',
  'al-09-graph-traversal': 'Разбирать обход в ширину и глубину с учетом посещенных вершин.',
  'al-10-shortest-path-intuition': 'Объяснять цель кратчайшего пути и почему веса ребер меняют выбор алгоритма.',
  'db-01-data-modeling-purpose': 'Начинать работу с базой от целей пользователя, сущностей, атрибутов и связей.',
  'db-02-entities-attributes-relationships': 'Разделять сущности, атрибуты и связи перед созданием таблиц.',
  'db-03-primary-keys': 'Использовать первичные ключи для надежной идентификации строк.',
  'db-04-tables-and-rows': 'Читать таблицы как строки и столбцы с понятными операциями на уровне строки.',
  'db-05-basic-select': 'Использовать SELECT, FROM и WHERE, чтобы получать нужные данные.',
  'db-06-filter-sort-project': 'Выбирать столбцы, фильтровать строки и сортировать результат запроса.',
  'db-07-foreign-keys': 'Связывать таблицы внешними ключами и понимать ссылочную целостность.',
  'db-08-inner-joins': 'Использовать внутренние соединения для объединения совпадающих строк из связанных таблиц.',
  'db-09-join-cardinality': 'Рассуждать о связях один-к-одному, один-ко-многим и многие-ко-многим.',
  'db-10-normalization-basics': 'Уменьшать дублирование данных, выделяя повторяющиеся понятия в связанные таблицы.',
  'db-11-constraints': 'Использовать ограничения, чтобы не пускать неверные данные в базу.',
  'db-12-indexes': 'Объяснять, как индексы ускоряют сценарии с частым поиском.',
  'db-13-transactions': 'Группировать связанные записи в транзакцию, чтобы не возникали частичные обновления.',
  'db-14-acid-properties': 'Использовать словарь ACID для объяснения надежных обновлений базы.',
  'db-15-isolation-and-races': 'Распознавать риски конкурентных обновлений и понимать роль изоляции.',
  'db-16-sql-injection': 'Относиться к пользовательскому вводу как к данным и использовать параметризованные запросы.',
  'db-17-schema-migrations': 'Планировать изменения схемы, которые сохраняют существующие данные и поведение приложения.',
  'db-18-crud-app-flow': 'Прослеживать создание, чтение, обновление и удаление через функцию приложения.',
  'db-19-query-planning': 'Использовать фильтры, соединения и индексы для рассуждения о планах запросов.',
  'db-20-aggregates-and-grouping': 'Сводить строки агрегатными функциями и группировкой.',
  'db-21-null-and-missing-data': 'Обрабатывать отсутствующие, неизвестные и необязательные данные, не путая их с пустыми значениями.',
  'db-22-backups-and-restore': 'Проверять, что важные данные можно сохранить в резервной копии и восстановить.',
  'db-23-embedded-vs-server-db': 'Выбирать между встроенной и серверной базой для небольшого продукта.',
  'db-24-orms-and-query-builders': 'Понимать, что скрывают ORM и конструкторы запросов и где они создают риск.',
  'db-25-data-privacy-basics': 'Классифицировать сохраненные данные и принимать базовые решения о приватности до записи.',
  'db-26-database-testing': 'Тестировать код базы данных с известными наборами данных, проверками и изоляцией.',
  'db-27-performance-debugging': 'Исследовать медленные запросы через индексы, планы и реальную нагрузку.',
  'db-28-small-database-project': 'Собрать маленькую функцию на базе данных от схемы до тестов.',
  'dt-01-reading-error-messages': 'Использовать сообщения об ошибках как подсказки, а не как шум.',
  'dt-02-tracing-state-by-hand': 'Вручную отслеживать значения переменных через ветвления и циклы.',
  'dt-03-edge-cases': 'Находить пустые, граничные, повторяющиеся и неверные входы до тестирования.',
  'dt-04-basic-unit-tests': 'Писать тесты, которые защищают ожидаемое поведение и крайние случаи.',
  'dt-05-debugging-a-small-program': 'Диагностировать и чинить небольшую сломанную программу через повторяемый процесс.',
  'ms-01-reading-symbols': 'Читать распространенные математические символы из множеств, логики и доказательств.',
  'ms-02-translating-statements': 'Переводить между обычным русским текстом и компактной математической записью.',
  'ms-03-proof-skeletons': 'Намечать доказательство до заполнения алгебраических или логических деталей.',
  'ms-04-recurrence-notation': 'Читать простую рекуррентную запись, используемую для рекурсивных алгоритмов.',
  'mm-01-values-vs-references': 'Предсказывать, когда значение копируется, а когда ссылка указывает на общие данные.',
  'mm-02-call-stack': 'Использовать интуицию кадров стека для рассуждения о вызовах функций и возврате.',
  'mm-03-references-and-aliasing': 'Распознавать псевдонимы и объяснять неожиданные изменения через общие ссылки.',
  'mm-04-mutation-costs': 'Связывать изменение данных и сдвиги элементов со стоимостью операций.',
  'mm-05-memory-model-for-recursion': 'Объяснять рекурсивные вызовы через кадры стека и отдельное локальное состояние.',
};

const NODE_POSITIONS = {
  'debugging-and-testing': { x: -1040, y: -260, dx: 220 },
  'programming-fundamentals': { x: -1200, y: 0, dx: 220 },
  'discrete-math': { x: -980, y: 300, dx: 220 },
  'math-notation-and-proof-support': { x: -760, y: 560, dx: 220 },
  'data-structures': { x: -760, y: 860, dx: 220 },
  'memory-model-intro': { x: -540, y: 1120, dx: 220 },
  algorithms: { x: -540, y: 1420, dx: 220 },
  databases: { x: -1200, y: 1720, dx: 180 },
};

const SUPPORT_EDGES = [
  ['mm-03-references-and-aliasing', 'ds-03-linked-lists'],
  ['mm-02-call-stack', 'ds-06-recursion-for-structures'],
  ['ms-04-recurrence-notation', 'al-06-recursion-and-recurrences'],
  ['dt-04-basic-unit-tests', 'pf-12-small-program-design'],
  ['ms-03-proof-skeletons', 'dm-05-direct-proofs'],
  ['ds-09-hash-tables', 'db-12-indexes'],
  ['al-02-asymptotic-complexity', 'db-19-query-planning'],
  ['dt-04-basic-unit-tests', 'db-26-database-testing'],
];

const nodeSummary = (node) => NODE_OUTCOMES[node.id] ?? `Потренируйте "${node.title}" в базовом маршруте информатики.`;
const nodeCompletionCriteria = (node) =>
  node.check
    ? 'Выполните практику по понятию и пройдите проверку этого узла.'
    : 'Выполните практику по понятию и свяжите его минимум с одним предварительным или следующим примером.';
const nodeActionTitle = (node) => {
  if (node.check?.strict_check_type === 'manual_strict') {
    return `Собрать подтверждение: ${node.title}`;
  }
  if (node.check?.check_method === 'llm_assisted') {
    return `Объяснить: ${node.title}`;
  }
  return `Потренировать: ${node.title}`;
};
const nodeActionDetails = (node) =>
  node.check
    ? 'Выполните короткое учебное задание, затем подтвердите результат по понятным критериям.'
    : `Создайте небольшой пример или заметку, которая показывает, что вы умеете применять "${node.title}" в базовом маршруте.`;
const nodePosition = (node, branchIndex) => {
  const config = NODE_POSITIONS[node.branchId] ?? { x: 0, y: 0, dx: 180 };
  return {
    x: config.x + branchIndex * config.dx,
    y: config.y,
  };
};

const NODES = [
  ['programming-fundamentals', 'pf-01-programming-environment', 'Среда программирования', []],
  ['programming-fundamentals', 'pf-02-values-variables-types', 'Значения, переменные и типы', ['pf-01-programming-environment']],
  ['programming-fundamentals', 'pf-03-expressions-and-operators', 'Выражения и операторы', ['pf-02-values-variables-types']],
  ['programming-fundamentals', 'pf-04-branching-with-conditionals', 'Ветвления и условия', ['pf-03-expressions-and-operators']],
  ['programming-fundamentals', 'pf-05-loops-and-iteration', 'Циклы и итерации', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-06-functions-and-parameters', 'Функции и параметры', ['pf-05-loops-and-iteration']],
  ['programming-fundamentals', 'pf-07-scope-and-lifetime', 'Область видимости и время жизни', ['pf-06-functions-and-parameters']],
  ['programming-fundamentals', 'pf-08-arrays-and-lists', 'Массивы и списки', ['pf-05-loops-and-iteration']],
  ['programming-fundamentals', 'pf-09-dictionaries-and-records', 'Словари и записи', ['pf-08-arrays-and-lists']],
  ['programming-fundamentals', 'pf-10-input-output-and-parsing', 'Ввод, вывод и разбор данных', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-11-debugging-basics', 'Основы отладки', ['pf-04-branching-with-conditionals']],
  ['programming-fundamentals', 'pf-12-small-program-design', 'Проектирование небольшой программы', ['pf-06-functions-and-parameters', 'pf-08-arrays-and-lists', 'pf-10-input-output-and-parsing', 'pf-11-debugging-basics']],
  ['discrete-math', 'dm-01-sets-and-membership', 'Множества и принадлежность', ['pf-02-values-variables-types']],
  ['discrete-math', 'dm-02-propositions-and-logic', 'Высказывания и логика', ['pf-04-branching-with-conditionals']],
  ['discrete-math', 'dm-03-truth-tables', 'Таблицы истинности', ['dm-02-propositions-and-logic']],
  ['discrete-math', 'dm-04-quantifiers', 'Кванторы', ['dm-01-sets-and-membership', 'dm-02-propositions-and-logic']],
  ['discrete-math', 'dm-05-direct-proofs', 'Прямые доказательства', ['dm-04-quantifiers']],
  ['discrete-math', 'dm-06-contrapositive-and-contradiction', 'Контрапозиция и противоречие', ['dm-05-direct-proofs']],
  ['discrete-math', 'dm-07-induction', 'Индукция', ['dm-05-direct-proofs', 'pf-05-loops-and-iteration']],
  ['discrete-math', 'dm-08-functions-and-relations', 'Функции и отношения', ['dm-01-sets-and-membership', 'dm-04-quantifiers']],
  ['discrete-math', 'dm-09-counting-basics', 'Основы подсчета', ['dm-01-sets-and-membership']],
  ['discrete-math', 'dm-10-graph-vocabulary', 'Словарь графов', ['dm-01-sets-and-membership', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-01-abstract-data-types', 'Абстрактные типы данных', ['pf-06-functions-and-parameters', 'dm-01-sets-and-membership']],
  ['data-structures', 'ds-02-arrays-and-dynamic-arrays', 'Массивы и динамические массивы', ['pf-08-arrays-and-lists', 'ds-01-abstract-data-types']],
  ['data-structures', 'ds-03-linked-lists', 'Связные списки', ['ds-01-abstract-data-types']],
  ['data-structures', 'ds-04-stacks', 'Стеки', ['ds-01-abstract-data-types', 'pf-06-functions-and-parameters']],
  ['data-structures', 'ds-05-queues', 'Очереди', ['ds-01-abstract-data-types', 'ds-04-stacks']],
  ['data-structures', 'ds-06-recursion-for-structures', 'Рекурсия для структур', ['pf-06-functions-and-parameters', 'dm-07-induction']],
  ['data-structures', 'ds-07-trees', 'Деревья', ['ds-06-recursion-for-structures', 'dm-10-graph-vocabulary']],
  ['data-structures', 'ds-08-binary-search-trees', 'Бинарные деревья поиска', ['ds-07-trees', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-09-hash-tables', 'Хеш-таблицы', ['ds-02-arrays-and-dynamic-arrays', 'dm-08-functions-and-relations']],
  ['data-structures', 'ds-10-heaps-and-priority-queues', 'Кучи и очереди с приоритетом', ['ds-07-trees', 'dm-09-counting-basics']],
  ['data-structures', 'ds-11-graph-representations', 'Представления графов', ['dm-10-graph-vocabulary', 'ds-02-arrays-and-dynamic-arrays', 'ds-09-hash-tables']],
  ['data-structures', 'ds-12-data-structure-tradeoffs', 'Компромиссы структур данных', ['ds-02-arrays-and-dynamic-arrays', 'ds-04-stacks', 'ds-05-queues', 'ds-09-hash-tables', 'ds-11-graph-representations']],
  ['algorithms', 'al-01-algorithmic-thinking', 'Алгоритмическое мышление', ['pf-12-small-program-design', 'dm-05-direct-proofs']],
  ['algorithms', 'al-02-asymptotic-complexity', 'Асимптотическая сложность', ['al-01-algorithmic-thinking', 'dm-09-counting-basics']],
  ['algorithms', 'al-03-linear-and-binary-search', 'Линейный и бинарный поиск', ['al-02-asymptotic-complexity', 'pf-08-arrays-and-lists']],
  ['algorithms', 'al-04-sorting-basics', 'Основы сортировки', ['al-02-asymptotic-complexity', 'pf-08-arrays-and-lists']],
  ['algorithms', 'al-05-divide-and-conquer', 'Разделяй и властвуй', ['al-03-linear-and-binary-search', 'al-04-sorting-basics']],
  ['algorithms', 'al-06-recursion-and-recurrences', 'Рекурсия и рекуррентные соотношения', ['ds-06-recursion-for-structures', 'al-05-divide-and-conquer']],
  ['algorithms', 'al-07-greedy-intuition', 'Жадная интуиция', ['al-02-asymptotic-complexity', 'dm-05-direct-proofs']],
  ['algorithms', 'al-08-dynamic-programming-intuition', 'Интуиция динамического программирования', ['al-06-recursion-and-recurrences', 'al-07-greedy-intuition']],
  ['algorithms', 'al-09-graph-traversal', 'Обход графов', ['ds-11-graph-representations', 'ds-04-stacks', 'ds-05-queues']],
  ['algorithms', 'al-10-shortest-path-intuition', 'Интуиция кратчайшего пути', ['al-09-graph-traversal', 'ds-10-heaps-and-priority-queues']],
  ['databases', 'db-01-data-modeling-purpose', 'Зачем моделировать данные', ['pf-12-small-program-design', 'ds-12-data-structure-tradeoffs']],
  ['databases', 'db-02-entities-attributes-relationships', 'Сущности, атрибуты и связи', ['db-01-data-modeling-purpose']],
  ['databases', 'db-03-primary-keys', 'Первичные ключи', ['db-02-entities-attributes-relationships']],
  ['databases', 'db-04-tables-and-rows', 'Таблицы и строки', ['db-03-primary-keys']],
  ['databases', 'db-05-basic-select', 'Базовые запросы SELECT', ['db-04-tables-and-rows', 'pf-04-branching-with-conditionals']],
  ['databases', 'db-06-filter-sort-project', 'Фильтрация, сортировка и выбор столбцов', ['db-05-basic-select']],
  ['databases', 'db-07-foreign-keys', 'Внешние ключи', ['db-03-primary-keys', 'db-02-entities-attributes-relationships']],
  ['databases', 'db-08-inner-joins', 'Внутренние соединения', ['db-05-basic-select', 'db-07-foreign-keys']],
  ['databases', 'db-09-join-cardinality', 'Кратность связей', ['db-08-inner-joins', 'dm-08-functions-and-relations']],
  ['databases', 'db-10-normalization-basics', 'Основы нормализации', ['db-09-join-cardinality']],
  ['databases', 'db-11-constraints', 'Ограничения', ['db-03-primary-keys', 'db-07-foreign-keys']],
  ['databases', 'db-12-indexes', 'Индексы', ['db-05-basic-select', 'ds-09-hash-tables', 'al-02-asymptotic-complexity']],
  ['databases', 'db-13-transactions', 'Транзакции', ['db-11-constraints']],
  ['databases', 'db-14-acid-properties', 'Свойства ACID', ['db-13-transactions']],
  ['databases', 'db-15-isolation-and-races', 'Изоляция и гонки данных', ['db-14-acid-properties', 'dt-02-tracing-state-by-hand']],
  ['databases', 'db-16-sql-injection', 'SQL-инъекции', ['db-05-basic-select', 'pf-10-input-output-and-parsing']],
  ['databases', 'db-17-schema-migrations', 'Миграции схемы', ['db-11-constraints', 'dt-04-basic-unit-tests']],
  ['databases', 'db-18-crud-app-flow', 'Поток CRUD в приложении', ['db-05-basic-select', 'pf-12-small-program-design']],
  ['databases', 'db-19-query-planning', 'Планирование запросов', ['db-08-inner-joins', 'db-12-indexes']],
  ['databases', 'db-20-aggregates-and-grouping', 'Агрегации и группировка', ['db-06-filter-sort-project']],
  ['databases', 'db-21-null-and-missing-data', 'NULL и отсутствующие данные', ['db-11-constraints']],
  ['databases', 'db-22-backups-and-restore', 'Резервные копии и восстановление', ['db-13-transactions']],
  ['databases', 'db-23-embedded-vs-server-db', 'Встроенные и серверные базы', ['db-18-crud-app-flow', 'mm-05-memory-model-for-recursion']],
  ['databases', 'db-24-orms-and-query-builders', 'ORM и конструкторы запросов', ['db-18-crud-app-flow', 'pf-06-functions-and-parameters']],
  ['databases', 'db-25-data-privacy-basics', 'Основы приватности данных', ['db-21-null-and-missing-data']],
  ['databases', 'db-26-database-testing', 'Тестирование базы данных', ['db-17-schema-migrations', 'dt-04-basic-unit-tests']],
  ['databases', 'db-27-performance-debugging', 'Отладка производительности базы', ['db-19-query-planning', 'dt-05-debugging-a-small-program']],
  ['databases', 'db-28-small-database-project', 'Небольшой проект с базой данных', ['db-18-crud-app-flow', 'db-19-query-planning', 'db-26-database-testing', 'db-25-data-privacy-basics']],
  ['debugging-and-testing', 'dt-01-reading-error-messages', 'Чтение сообщений об ошибках', ['pf-01-programming-environment']],
  ['debugging-and-testing', 'dt-02-tracing-state-by-hand', 'Ручная трассировка состояния', ['pf-03-expressions-and-operators', 'pf-04-branching-with-conditionals']],
  ['debugging-and-testing', 'dt-03-edge-cases', 'Крайние случаи', ['pf-05-loops-and-iteration', 'pf-08-arrays-and-lists']],
  ['debugging-and-testing', 'dt-04-basic-unit-tests', 'Базовые модульные тесты', ['pf-06-functions-and-parameters']],
  ['debugging-and-testing', 'dt-05-debugging-a-small-program', 'Отладка небольшой программы', ['pf-11-debugging-basics', 'dt-02-tracing-state-by-hand', 'dt-03-edge-cases']],
  ['math-notation-and-proof-support', 'ms-01-reading-symbols', 'Чтение математических символов', ['dm-01-sets-and-membership']],
  ['math-notation-and-proof-support', 'ms-02-translating-statements', 'Перевод утверждений', ['dm-02-propositions-and-logic', 'dm-04-quantifiers']],
  ['math-notation-and-proof-support', 'ms-03-proof-skeletons', 'Каркасы доказательств', ['dm-05-direct-proofs']],
  ['math-notation-and-proof-support', 'ms-04-recurrence-notation', 'Рекуррентная запись', ['dm-07-induction', 'al-02-asymptotic-complexity']],
  ['memory-model-intro', 'mm-01-values-vs-references', 'Значения и ссылки', ['pf-08-arrays-and-lists', 'pf-09-dictionaries-and-records']],
  ['memory-model-intro', 'mm-02-call-stack', 'Стек вызовов', ['pf-06-functions-and-parameters', 'pf-07-scope-and-lifetime']],
  ['memory-model-intro', 'mm-03-references-and-aliasing', 'Ссылки и псевдонимы', ['mm-01-values-vs-references']],
  ['memory-model-intro', 'mm-04-mutation-costs', 'Стоимость изменений', ['mm-03-references-and-aliasing', 'ds-02-arrays-and-dynamic-arrays']],
  ['memory-model-intro', 'mm-05-memory-model-for-recursion', 'Модель памяти для рекурсии', ['mm-02-call-stack', 'ds-06-recursion-for-structures']],
].map(([branchId, id, title, prerequisites], index, rows) => {
  const branchIndex = rows.slice(0, index).filter(([candidateBranchId]) => candidateBranchId === branchId).length;
  const baseNode = {
    branchId,
    id,
    title,
    prerequisites,
    order: index,
    branchIndex,
    check: NODE_CHECKS[id] ?? null,
  };
  const position = nodePosition(baseNode, branchIndex);
  return {
    ...baseNode,
    ...position,
    summary: nodeSummary(baseNode),
    completionCriteria: nodeCompletionCriteria(baseNode),
    actionTitle: nodeActionTitle(baseNode),
    actionDetails: nodeActionDetails(baseNode),
  };
});

const ROUTE_STAGES = [
  ['Основы программирования', ['pf-01-programming-environment', 'pf-02-values-variables-types', 'pf-03-expressions-and-operators', 'pf-04-branching-with-conditionals', 'pf-05-loops-and-iteration', 'pf-06-functions-and-parameters', 'pf-07-scope-and-lifetime', 'pf-08-arrays-and-lists', 'pf-09-dictionaries-and-records', 'pf-10-input-output-and-parsing', 'pf-11-debugging-basics', 'pf-12-small-program-design']],
  ['Дискретная математика', ['dm-01-sets-and-membership', 'dm-02-propositions-and-logic', 'dm-03-truth-tables', 'dm-04-quantifiers', 'dm-05-direct-proofs', 'dm-06-contrapositive-and-contradiction', 'dm-07-induction', 'dm-08-functions-and-relations', 'dm-09-counting-basics', 'dm-10-graph-vocabulary']],
  ['Структуры данных', ['ds-01-abstract-data-types', 'ds-02-arrays-and-dynamic-arrays', 'ds-03-linked-lists', 'ds-04-stacks', 'ds-05-queues', 'ds-06-recursion-for-structures', 'ds-07-trees', 'ds-08-binary-search-trees', 'ds-09-hash-tables', 'ds-10-heaps-and-priority-queues', 'ds-11-graph-representations', 'ds-12-data-structure-tradeoffs']],
  ['Алгоритмы', ['al-01-algorithmic-thinking', 'al-02-asymptotic-complexity', 'al-03-linear-and-binary-search', 'al-04-sorting-basics', 'al-05-divide-and-conquer', 'al-06-recursion-and-recurrences', 'al-07-greedy-intuition', 'al-08-dynamic-programming-intuition', 'al-09-graph-traversal', 'al-10-shortest-path-intuition']],
  ['Базы данных', ['db-01-data-modeling-purpose', 'db-02-entities-attributes-relationships', 'db-03-primary-keys', 'db-04-tables-and-rows', 'db-05-basic-select', 'db-06-filter-sort-project', 'db-07-foreign-keys', 'db-08-inner-joins', 'db-09-join-cardinality', 'db-10-normalization-basics', 'db-11-constraints', 'db-12-indexes', 'db-13-transactions', 'db-14-acid-properties', 'db-15-isolation-and-races', 'db-16-sql-injection', 'db-17-schema-migrations', 'db-18-crud-app-flow', 'db-19-query-planning', 'db-20-aggregates-and-grouping', 'db-21-null-and-missing-data', 'db-22-backups-and-restore', 'db-23-embedded-vs-server-db', 'db-24-orms-and-query-builders', 'db-25-data-privacy-basics', 'db-26-database-testing', 'db-27-performance-debugging', 'db-28-small-database-project']],
];

const selectOne = async (database, sql, params = []) => (await database.select(sql, params))[0] ?? null;

const upsertCampaign = async (database, timestamp) => {
  await database.execute(
    `
      INSERT INTO campaigns (type, slug, name, icon, color, mode, career_status, is_archived, created_at, updated_at, last_opened_at)
      VALUES ('template', ?, 'Бакалавриат по информатике', 'brain', '#58d6ff', 'career', 'active', 0, ?, ?, NULL)
      ON CONFLICT(slug) DO UPDATE SET
        type = 'template',
        name = excluded.name,
        icon = excluded.icon,
        color = excluded.color,
        mode = excluded.mode,
        career_status = excluded.career_status,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [CS_BACHELOR_TEMPLATE_SLUG, timestamp, timestamp],
  );

  return selectOne(database, 'SELECT * FROM campaigns WHERE slug = ? LIMIT 1', [CS_BACHELOR_TEMPLATE_SLUG]);
};

const upsertStats = async (database, campaignId, timestamp) => {
  const statsByKey = new Map();
  for (const stat of CS_BACHELOR_STATS) {
    await database.execute(
      `
        INSERT INTO campaign_stats (campaign_id, key, title, color, icon, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(campaign_id, key) DO UPDATE SET
          title = excluded.title,
          color = excluded.color,
          icon = excluded.icon,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [campaignId, stat.key, stat.title, stat.color, stat.icon, stat.sort_order, timestamp, timestamp],
    );
    const row = await selectOne(database, 'SELECT * FROM campaign_stats WHERE campaign_id = ? AND key = ? LIMIT 1', [
      campaignId,
      stat.key,
    ]);
    statsByKey.set(stat.key, row);
  }
  return statsByKey;
};

const upsertStructure = async (database, campaignId, statsByKey, timestamp) => {
  await database.execute(
    `
      INSERT INTO spheres (campaign_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'Бакалавриат по информатике', 'cs-bachelor-foundations', 'Переиспользуемый шаблон реалистичного базового маршрута по информатике.', 0, 0, ?, ?)
      ON CONFLICT(campaign_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [campaignId, timestamp, timestamp],
  );
  const sphere = await selectOne(database, 'SELECT * FROM spheres WHERE campaign_id = ? AND slug = ? LIMIT 1', [
    campaignId,
    'cs-bachelor-foundations',
  ]);

  await database.execute(
    `
      INSERT INTO directions (sphere_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
      VALUES (?, 'Основы информатики', 'core-cs-foundations', 'Первый игровой маршрут через программирование, дискретную математику, структуры данных, алгоритмы и поддерживающие ветки.', 0, 0, ?, ?)
      ON CONFLICT(sphere_id, slug) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        sort_order = excluded.sort_order,
        is_archived = 0,
        updated_at = excluded.updated_at
    `,
    [sphere.id, timestamp, timestamp],
  );
  const direction = await selectOne(database, 'SELECT * FROM directions WHERE sphere_id = ? AND slug = ? LIMIT 1', [
    sphere.id,
    'core-cs-foundations',
  ]);

  const skillsByBranch = new Map();
  for (const [index, branch] of BRANCHES.entries()) {
    const stat = statsByKey.get(branch.statKey);
    await database.execute(
      `
        INSERT INTO skills (direction_id, primary_stat_id, name, slug, description, sort_order, is_archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
        ON CONFLICT(direction_id, slug) DO UPDATE SET
          primary_stat_id = excluded.primary_stat_id,
          name = excluded.name,
          description = excluded.description,
          sort_order = excluded.sort_order,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [direction.id, stat?.id ?? null, branch.title, branch.id, branch.summary, index, timestamp, timestamp],
    );
    const skill = await selectOne(database, 'SELECT * FROM skills WHERE direction_id = ? AND slug = ? LIMIT 1', [
      direction.id,
      branch.id,
    ]);
    skillsByBranch.set(branch.id, skill);
  }

  return skillsByBranch;
};

const upsertKnowledgeNode = async (database, node, timestamp) => {
  const key = `cs-bachelor:${node.id}`;
  await database.execute(
    `
      INSERT INTO knowledge_nodes (key, title, domain, summary, created_at, updated_at)
      VALUES (?, ?, 'Информатика', ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        title = excluded.title,
        domain = excluded.domain,
        summary = excluded.summary,
        updated_at = excluded.updated_at
    `,
    [key, node.title, node.summary, timestamp, timestamp],
  );
  return selectOne(database, 'SELECT * FROM knowledge_nodes WHERE key = ? LIMIT 1', [key]);
};

const upsertNodes = async (database, skillsByBranch, timestamp) => {
  const nodesBySlug = new Map();

  for (const node of NODES) {
    const skill = skillsByBranch.get(node.branchId);
    const knowledgeNode = await upsertKnowledgeNode(database, node, timestamp);
    await database.execute(
      `
        INSERT INTO nodes (
          skill_id,
          type,
          status,
          title,
          slug,
          summary,
          completion_criteria,
          links,
          reward,
          x,
          y,
          knowledge_node_id,
          self_marked_mastery_level,
          check_metadata,
          importance,
          target_date,
          last_touched_at,
          is_archived,
          created_at,
          updated_at
        )
        VALUES (?, 'task', 'active', ?, ?, ?, ?, NULL, NULL, ?, ?, ?, NULL, ?, ?, NULL, NULL, 0, ?, ?)
        ON CONFLICT(skill_id, slug) DO UPDATE SET
          title = excluded.title,
          summary = excluded.summary,
          completion_criteria = excluded.completion_criteria,
          x = excluded.x,
          y = excluded.y,
          knowledge_node_id = excluded.knowledge_node_id,
          self_marked_mastery_level = NULL,
          check_metadata = excluded.check_metadata,
          importance = excluded.importance,
          is_archived = 0,
          updated_at = excluded.updated_at
      `,
      [
        skill.id,
        node.title,
        node.id,
        node.summary,
        node.completionCriteria,
        node.x,
        node.y,
        knowledgeNode.id,
        node.check ? JSON.stringify(node.check) : null,
        node.check ? 'high' : 'medium',
        timestamp,
        timestamp,
      ],
    );
    const row = await selectOne(database, 'SELECT * FROM nodes WHERE skill_id = ? AND slug = ? LIMIT 1', [
      skill.id,
      node.id,
    ]);
    nodesBySlug.set(node.id, row);

    const existingPrimaryAction = await selectOne(
      database,
      'SELECT * FROM node_actions WHERE node_id = ? AND sort_order = 0 ORDER BY id ASC LIMIT 1',
      [row.id],
    );
    if (existingPrimaryAction) {
      await database.execute(
        `
          UPDATE node_actions
          SET title = ?,
              details = ?,
              size_hint = 'standard',
              is_minimum_step = 0,
              is_repeatable = 0,
              updated_at = ?
          WHERE id = ?
        `,
        [node.actionTitle, node.actionDetails, timestamp, existingPrimaryAction.id],
      );
    } else {
      await database.execute(
        `
          INSERT INTO node_actions (node_id, title, details, status, size_hint, sort_order, is_minimum_step, is_repeatable, due_at, completed_at, created_at, updated_at)
          VALUES (?, ?, ?, 'todo', 'standard', 0, 0, 0, NULL, NULL, ?, ?)
        `,
        [row.id, node.actionTitle, node.actionDetails, timestamp, timestamp],
      );
    }
  }

  for (const node of NODES) {
    const blocked = nodesBySlug.get(node.id);
    for (const prerequisite of node.prerequisites) {
      const blocking = nodesBySlug.get(prerequisite);
      if (!blocked || !blocking) {
        continue;
      }
      await database.execute(
        `
          INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
          VALUES (?, ?, 'requires', ?)
        `,
        [blocked.id, blocking.id, timestamp],
      );
    }
  }

  for (const [supportSlug, supportedSlug] of SUPPORT_EDGES) {
    const support = nodesBySlug.get(supportSlug);
    const supported = nodesBySlug.get(supportedSlug);
    if (!support || !supported) {
      continue;
    }
    await database.execute(
      `
        DELETE FROM node_dependencies
        WHERE blocked_node_id = ?
          AND blocking_node_id = ?
          AND dependency_type = 'supports'
      `,
      [supported.id, support.id],
    );
    await database.execute(
      `
        INSERT OR IGNORE INTO node_dependencies (blocked_node_id, blocking_node_id, dependency_type, created_at)
        VALUES (?, ?, 'supports', ?)
      `,
      [support.id, supported.id, timestamp],
    );
  }

  return nodesBySlug;
};

const upsertRoute = async (database, campaign, nodesBySlug, timestamp) => {
  await database.execute(
    `
      INSERT INTO career_specializations (
        campaign_id,
        name,
        key,
        domain,
        length,
        status,
        started_at,
        completed_at,
        created_at,
        updated_at
      )
      VALUES (?, 'Основы информатики', 'route-core-cs-foundations', 'Информатика', 'long', 'active', ?, NULL, ?, ?)
      ON CONFLICT(campaign_id, key) DO UPDATE SET
        name = excluded.name,
        domain = excluded.domain,
        length = excluded.length,
        status = 'active',
        started_at = COALESCE(career_specializations.started_at, excluded.started_at),
        completed_at = NULL,
        updated_at = excluded.updated_at
    `,
    [campaign.id, timestamp, timestamp, timestamp],
  );
  const specialization = await selectOne(
    database,
    'SELECT * FROM career_specializations WHERE campaign_id = ? AND key = ? LIMIT 1',
    [campaign.id, 'route-core-cs-foundations'],
  );

  let routeOrder = 0;
  const routeRowsBySlug = new Map();
  for (const [stage, slugs] of ROUTE_STAGES) {
    for (const slug of slugs) {
      const node = nodesBySlug.get(slug);
      if (!node) {
        continue;
      }
      const existingRouteNode = await selectOne(
        database,
        'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
        [specialization.id, node.knowledge_node_id],
      );

      if (existingRouteNode) {
        await database.execute(
          `
            UPDATE specialization_route_nodes
            SET node_id = ?,
                required_mastery_level = 'confirmed',
                route_label = ?,
                route_order = ?,
                route_stage = ?,
                is_required = 1,
                updated_at = ?
            WHERE id = ?
          `,
          [node.id, node.title, routeOrder, stage, timestamp, existingRouteNode.id],
        );
      } else {
        await database.execute(
          `
            INSERT INTO specialization_route_nodes (
              specialization_id,
              node_id,
              knowledge_node_id,
              required_mastery_level,
              route_label,
              route_order,
              route_stage,
              is_required,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, 'confirmed', ?, ?, ?, 1, ?, ?)
          `,
          [specialization.id, node.id, node.knowledge_node_id, node.title, routeOrder, stage, timestamp, timestamp],
        );
      }
      const routeRow = await selectOne(
        database,
        'SELECT * FROM specialization_route_nodes WHERE specialization_id = ? AND knowledge_node_id = ? LIMIT 1',
        [specialization.id, node.knowledge_node_id],
      );
      routeRowsBySlug.set(slug, routeRow);
      routeOrder += 1;
    }
  }

  const routeSlugs = ROUTE_STAGES.flatMap(([, slugs]) => slugs);
  for (let index = 1; index < routeSlugs.length; index += 1) {
    const source = routeRowsBySlug.get(routeSlugs[index]);
    const target = routeRowsBySlug.get(routeSlugs[index - 1]);
    if (!source || !target) {
      continue;
    }
    await database.execute(
      `
        INSERT OR IGNORE INTO specialization_route_edges (specialization_id, source_route_node_id, target_route_node_id, edge_type, created_at)
        VALUES (?, ?, ?, 'requires', ?)
      `,
      [specialization.id, source.id, target.id, timestamp],
    );
  }

  await database.execute(
    `
      UPDATE campaigns
      SET current_specialization_id = ?,
          mode = 'career',
          career_status = 'active',
          updated_at = ?
      WHERE id = ?
    `,
    [specialization.id, timestamp, campaign.id],
  );
};

const clearTemplateProgress = async (database, campaignId, timestamp) => {
  await database.execute(
    `
      DELETE FROM node_barrier_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    `
      DELETE FROM node_error_notes
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute(
    `
      DELETE FROM daily_session_events
      WHERE session_id IN (
        SELECT id FROM daily_sessions WHERE campaign_id = ?
      )
    `,
    [campaignId],
  );
  await database.execute('DELETE FROM daily_sessions WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM assessment_attempts WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM mastery_events WHERE campaign_id = ?', [campaignId]);
  await database.execute('DELETE FROM stat_xp_grants WHERE campaign_id = ?', [campaignId]);
  await database.execute(
    `
      UPDATE node_actions
      SET status = 'todo',
          completed_at = NULL,
          updated_at = ?
      WHERE node_id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
  await database.execute(
    `
      UPDATE nodes
      SET status = 'active',
          self_marked_mastery_level = NULL,
          last_touched_at = NULL,
          updated_at = ?
      WHERE id IN (
        SELECT nodes.id
        FROM nodes
        JOIN skills ON skills.id = nodes.skill_id
        JOIN directions ON directions.id = skills.direction_id
        JOIN spheres ON spheres.id = directions.sphere_id
        WHERE spheres.campaign_id = ?
      )
    `,
    [timestamp, campaignId],
  );
};

export const seedCsBachelorTemplate = async (database) => {
  const timestamp = createUtcTimestamp();
  const campaign = await upsertCampaign(database, timestamp);
  const statsByKey = await upsertStats(database, campaign.id, timestamp);
  const skillsByBranch = await upsertStructure(database, campaign.id, statsByKey, timestamp);
  const nodesBySlug = await upsertNodes(database, skillsByBranch, timestamp);
  await upsertRoute(database, campaign, nodesBySlug, timestamp);
  await clearTemplateProgress(database, campaign.id, timestamp);
  return selectOne(database, 'SELECT * FROM campaigns WHERE id = ? LIMIT 1', [campaign.id]);
};
