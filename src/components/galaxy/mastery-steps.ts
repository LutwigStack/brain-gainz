/**
 * Mastery self-report step data for the right `Занятие` panel.
 *
 * The right panel exposes a single row of six self-report chips that mirror
 * the learner's progression through a node. Each chip carries:
 *  - `id`      — the integer rank (1..6) that the existing store already
 *                uses for the chip's position. Existing `setMastery` calls
 *                and the existing `currentRank` field index by this integer,
 *                so the field is kept as a stable integer to avoid
 *                re-plumbing the persistence layer.
 *  - `label`   — the short Russian label visible inside the chip
 *                (12px text style, centered).
 *  - `meaning` — a one-line description of the step; shown as a tooltip
 *                on hover (`title` attribute) and as the accessible name
 *                fragment via `aria-label` (`${label} - ${meaning}`).
 *
 * The order is fixed by epic 44 and is intentionally the same order the
 * learner travels through: read → recall → apply → re-apply → connect →
 * teach. Any re-ordering requires an epic-level change.
 *
 * Mapping from `id` to the existing `MasteryLevel` enum used by the store
 * lives in the consumer (NavigationView) — the data file stays focused
 * on the user-facing label/meaning pair.
 */
export interface MasteryStep {
  id: number;
  label: string;
  meaning: string;
}

export const masterySteps: readonly MasteryStep[] = [
  {
    id: 1,
    label: 'Понял',
    meaning: 'Я прочитал и могу пересказать тему.',
  },
  {
    id: 2,
    label: 'Запомнил',
    meaning: 'Я помню ключевые определения без подсказки.',
  },
  {
    id: 3,
    label: 'Применил',
    meaning: 'Я решил задачу на эту тему.',
  },
  {
    id: 4,
    label: 'Закрепил',
    meaning: 'Я решил ещё одну задачу через неделю.',
  },
  {
    id: 5,
    label: 'Связал',
    meaning: 'Я вижу, как тема стыкуется с соседними.',
  },
  {
    id: 6,
    label: 'Освоил',
    meaning: 'Я могу объяснить тему другому.',
  },
] as const;

/**
 * The helper line that sits under the six chips. The wording is fixed by
 * the epic so the learner can switch the chip they picked at any time
 * without losing their place in the progression.
 */
export const masteryHelperLine =
  'Отметь шаг, который точно отражает твоё состояние. Менять можно в любой момент.';

export const getMasteryStepById = (id: number): MasteryStep | null =>
  masterySteps.find((step) => step.id === id) ?? null;
