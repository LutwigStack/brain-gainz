import { useState } from 'react';
import { CheckCircle2, CircleDot, GitBranch, LockKeyhole, Map, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react';

import {
  PixelButton,
  PixelMeter,
  PixelPanelHeader,
  PixelStack,
  PixelSurface,
  PixelText,
} from './pixel';
import { GalaxyLegend } from './galaxy/GalaxyLegend.tsx';
import { SPHERE_TOKEN_ORDER, tryGetSphereTokenKey } from '../theme/galaxy/sphere-id-to-token.ts';

interface WindRoseBranch {
  id: number;
  name: string;
  primary_stat_id?: number | null;
  node_count: number;
  done_node_count: number;
  focus_node_id?: number | null;
  focus_node_title?: string | null;
  next_action_id?: number | null;
  next_action_title?: string | null;
}

interface WindRoseStat {
  id: number;
  /** Catalog slug (e.g. `programming`, `algorithms-theory`). */
  key: string;
  title: string;
  /**
   * Legacy hex color from the database. Kept for backward compatibility
   * with existing campaigns whose stats were seeded before epic 41;
   * the radar uses the sphere token (mapped from `key`) when present
   * and only falls back to this hex if the slug is not in the sphere
   * map (NLH cash, see epic 41 README). New code should not read it.
   *
   * @deprecated since epic 41; will be removed in a follow-up.
   */
  color?: string | null;
  xp: number;
  level: number;
  progressToNext: number;
  branches: WindRoseBranch[];
}

interface WindRoseSnapshot {
  stats: WindRoseStat[];
  unassignedBranches: WindRoseBranch[];
}

interface WindRoseViewProps {
  snapshot: WindRoseSnapshot | null;
  isLoading: boolean;
  error: string | null;
  selectedStatId: number | null;
  onSelectStat: (statId: number) => void;
  onOpenBranch: (branch: WindRoseBranch) => void;
  onRefresh: () => void;
}

const polarPoint = (index: number, total: number, radius: number) => {
  const angle = -Math.PI / 2 + (index / Math.max(total, 1)) * Math.PI * 2;
  return {
    x: 160 + Math.cos(angle) * radius,
    y: 160 + Math.sin(angle) * radius,
  };
};

type BranchStateKey = 'active' | 'next' | 'blocked' | 'completed';

type SphereStop = 'default' | 'strong' | 'soft' | 'textOnStrong';

/**
 * Build a `var(--sphere-{key}-{stop})` reference for the given stat.
 * Returns the infra fallback (`var(--pixel-accent)`) when the stat's
 * catalog slug is not in the sphere map — currently the case for
 * NLH cash stats, which the epic 41 README explicitly leaves out of
 * scope. The fallback keeps the radar renderable for those stats
 * without falling back to a hardcoded hex.
 */
const sphereVar = (
  stat: Pick<WindRoseStat, 'key' | 'color'>,
  stop: SphereStop,
): string => {
  const tokenKey = tryGetSphereTokenKey(stat.key);
  if (tokenKey) {
    return `var(--sphere-${tokenKey}-${stop})`;
  }
  if (stop === 'default' || stop === 'strong') {
    return 'var(--pixel-accent)';
  }
  return 'var(--pixel-text)';
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const branchProgress = (branch: WindRoseBranch) =>
  branch.node_count <= 0 ? 0 : clampPercent((branch.done_node_count / branch.node_count) * 100);

const branchState = (
  branch: WindRoseBranch,
): { key: BranchStateKey; label: string; tone: 'accent' | 'success' | 'warning' | 'danger' | 'info' } => {
  if (branch.node_count > 0 && branch.done_node_count >= branch.node_count) {
    return { key: 'completed', label: 'Под контролем', tone: 'success' };
  }

  if (branch.next_action_id != null) {
    return { key: 'active', label: 'Удержать', tone: 'accent' };
  }

  if (branch.focus_node_id != null) {
    return { key: 'next', label: 'Развить', tone: 'info' };
  }

  return { key: 'blocked', label: 'Нет хода', tone: 'warning' };
};

const BranchStateIcon = ({ state }: { state: BranchStateKey }) => {
  if (state === 'completed') {
    return <CheckCircle2 size={14} />;
  }

  if (state === 'blocked') {
    return <LockKeyhole size={14} />;
  }

  return <CircleDot size={14} />;
};

const branchTarget = (branch: WindRoseBranch) =>
  branch.next_action_title ?? branch.focus_node_title ?? (branch.node_count > 0 ? 'карта ветки' : 'пустая ветка');

const pickPrimaryBranch = (branches: WindRoseBranch[]) =>
  branches.find((branch) => branchState(branch).key === 'active') ??
  branches.find((branch) => branchState(branch).key === 'next') ??
  branches.find((branch) => branchState(branch).key !== 'completed') ??
  branches[0] ??
  null;

export const WindRoseView = ({
  snapshot,
  isLoading,
  error,
  selectedStatId,
  onSelectStat,
  onOpenBranch,
  onRefresh,
}: WindRoseViewProps) => {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const stats = snapshot?.stats ?? [];
  const selectedStat = stats.find((stat) => stat.id === selectedStatId) ?? stats[0] ?? null;
  const selectedBranches = selectedStat?.branches ?? [];
  const defaultBranch = pickPrimaryBranch(selectedBranches);
  const selectedBranch = selectedBranches.find((branch) => branch.id === selectedBranchId) ?? defaultBranch;
  const maxLevel = Math.max(5, ...stats.map((stat) => Number(stat.level ?? 1)));
  const polygonPoints = stats
    .map((stat, index: number) => {
      const levelRadius = 34 + (Number(stat.level ?? 1) / maxLevel) * 110;
      const point = polarPoint(index, stats.length, levelRadius);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  // Legend — always 8 fixed rows (one per sphere token). The active
  // campaign drives the focused-row signal: when a stat is selected
  // and its slug is in the sphere map, the matching row is focused.
  // Clicking a row calls `onSelectStat` for the stat whose slug
  // matches; for campaigns without a sphere mapping (NLH cash) the
  // click is a no-op, which matches the spec ("linked to the radar
  // via the sphere filter").
  const legendEntries = stats.map((stat, index) => ({
    slug: stat.key,
    label: stat.title,
    tokenKey: tryGetSphereTokenKey(stat.key) ?? SPHERE_TOKEN_ORDER[index % SPHERE_TOKEN_ORDER.length] ?? null,
  }));
  const focusedSlug = selectedStat?.key ?? null;
  const handleLegendSelect = (slug: string) => {
    const stat = stats.find((entry) => entry.key === slug);
    if (stat) {
      onSelectStat(stat.id);
    }
  };

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <PixelSurface frame="secondary" padding="xl" className="wind-rose-panel min-w-0" style={{ boxSizing: 'border-box' }}>
        <PixelStack gap="lg">
          <PixelPanelHeader
            eyebrow="Роза ветров"
            title="Статы кампании"
            description="Уровни и ветки."
            aside={
              <PixelButton onClick={onRefresh} disabled={isLoading}>
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
              </PixelButton>
            }
          />

          {error ? (
            <PixelSurface frame="destructive" padding="sm">
              <PixelText as="p" readable size="sm">
                {error}
              </PixelText>
            </PixelSurface>
          ) : null}

          {stats.length === 0 ? (
            <PixelSurface frame="disabled" padding="xl">
              <div className="grid place-items-center gap-3 py-10 text-center">
                <Sparkles size={28} className="text-[var(--pixel-accent)]" />
                <PixelText as="p" readable color="textMuted">
                  Нет статов.
                </PixelText>
              </div>
            </PixelSurface>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="relative mx-auto aspect-square w-full max-w-[360px]">
                <svg viewBox="0 0 320 320" className="h-full w-full">
                  {[44, 72, 100, 128].map((radius) => (
                    <circle
                      key={radius}
                      cx="160"
                      cy="160"
                      r={radius}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.22)"
                      strokeWidth="1"
                    />
                  ))}
                  {stats.map((stat, index: number) => {
                    const outer = polarPoint(index, stats.length, 142);
                    return (
                      <line
                        key={stat.id}
                        x1="160"
                        y1="160"
                        x2={outer.x}
                        y2={outer.y}
                        stroke="rgba(148, 163, 184, 0.24)"
                        strokeWidth="1"
                      />
                    );
                  })}
                  <polygon points={polygonPoints} fill="rgba(88, 214, 255, 0.18)" stroke="var(--pixel-accent)" strokeWidth="2" />
                  {stats.map((stat, index: number) => {
                    const point = polarPoint(index, stats.length, 144);
                    const active = selectedStat?.id === stat.id;
                    return (
                      <g key={stat.id} role="button" tabIndex={0} onClick={() => onSelectStat(stat.id)} style={{ cursor: 'pointer' }}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r={active ? 16 : 12}
                          fill={active ? sphereVar(stat, 'strong') : sphereVar(stat, 'default')}
                          opacity={active ? 1 : 0.82}
                        />
                        <text
                          x={point.x}
                          y={point.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="800"
                          fill={sphereVar(stat, 'textOnStrong')}
                        >
                          {stat.level}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="grid min-w-0 content-start gap-2">
                {stats.map((stat) => {
                  const active = selectedStat?.id === stat.id;
                  return (
                    <button
                      key={stat.id}
                      type="button"
                      onClick={() => onSelectStat(stat.id)}
                      className="grid min-w-0 gap-2 border bg-[rgba(15,23,42,0.72)] p-3 text-left"
                      style={{
                        borderColor: active ? sphereVar(stat, 'strong') : 'var(--pixel-border)',
                        boxShadow: active ? `inset 4px 0 0 ${sphereVar(stat, 'strong')}` : undefined,
                      }}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="truncate text-sm font-bold text-[var(--pixel-text)]">{stat.title}</span>
                        <span className="text-xs text-[var(--pixel-text-muted)]">
                          ур. {stat.level} · {stat.branches?.length ?? 0} ветк.
                        </span>
                      </div>
                      <PixelMeter value={stat.progressToNext ?? 0} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid min-w-0 gap-2">
            <PixelText as="p" size="xs" color="textMuted" readable>
              Сферы (8) — кликни строку, чтобы выбрать стат
            </PixelText>
            <GalaxyLegend entries={legendEntries} focusedSlug={focusedSlug} onSelect={handleLegendSelect} />
          </div>
        </PixelStack>
      </PixelSurface>

      <PixelSurface
        frame="secondary"
        padding="md"
        className="min-w-0"
        style={{
          borderColor: selectedStat ? sphereVar(selectedStat, 'default') : undefined,
          boxSizing: 'border-box',
        }}
      >
        <PixelPanelHeader
          eyebrow={
            selectedStat ? (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5"
                  style={{ background: sphereVar(selectedStat, 'default') }}
                />
                Стат
              </span>
            ) : (
              'Стат'
            )
          }
          title={selectedStat?.title ?? 'Выбор'}
          description={selectedStat ? `${selectedStat.xp} XP · ${selectedBranches.length} ветк.` : 'Нажмите луч.'}
        />

        {selectedStat ? (
          <div className="mt-3 grid gap-3">
            {selectedBranches.map((branch) => {
              const state = branchState(branch);
              const progress = branchProgress(branch);
              const target = branchTarget(branch);
              const isSelected = selectedBranch?.id === branch.id;

              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranchId(branch.id)}
                  aria-pressed={isSelected}
                  aria-label={`Выбрать ветку ${branch.name}: ${target}`}
                  className={`wind-branch-card grid min-w-0 gap-2 border bg-[rgba(15,23,42,0.68)] p-3 text-left ${
                    isSelected ? 'wind-branch-card--selected' : ''
                  }`}
                  style={{
                    borderColor: isSelected ? sphereVar(selectedStat, 'strong') : 'var(--pixel-line-soft)',
                    boxShadow: isSelected ? `inset 4px 0 0 ${sphereVar(selectedStat, 'strong')}` : undefined,
                  }}
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <GitBranch size={14} className="shrink-0 text-[var(--pixel-accent)]" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[var(--pixel-text)]">{branch.name}</span>
                        <span className="block truncate text-xs text-[var(--pixel-text-muted)]">К карте: {target}</span>
                      </span>
                    </span>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 border px-1.5 py-1 text-[10px] text-[var(--pixel-text-muted)]"
                      style={{ borderColor: isSelected ? sphereVar(selectedStat, 'strong') : 'var(--pixel-line-soft)' }}
                    >
                      <BranchStateIcon state={state.key} />
                      {state.label}
                    </span>
                  </div>
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-[var(--pixel-text-muted)]">
                      <span>Прогресс: {branch.done_node_count}/{branch.node_count} узл.</span>
                      <span>{progress}%</span>
                    </div>
                    <PixelMeter value={progress} tone={state.tone} showValue={false} />
                  </div>
                </button>
              );
            })}

            {selectedBranches.length === 0 ? (
              <PixelText as="p" readable size="sm" color="textMuted">
                Веток пока нет.
              </PixelText>
            ) : null}
          </div>
        ) : null}

        {(snapshot?.unassignedBranches ?? []).length > 0 ? (
          <PixelSurface frame="warning" padding="sm" className="mt-3">
            <PixelText as="p" size="xs" color="warning">
              <TriangleAlert size={13} className="inline" /> Без стата: {snapshot.unassignedBranches.length}
            </PixelText>
          </PixelSurface>
        ) : null}

        {selectedBranch ? (
          <PixelButton
            tone="accent"
            onClick={() => onOpenBranch(selectedBranch)}
            fullWidth
            aria-label={`Открыть выбранную ветку ${selectedBranch.name}: ${branchTarget(selectedBranch)}`}
            style={{ marginTop: 12, justifyContent: 'space-between' }}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <Map size={16} className="shrink-0" />
              <span className="truncate">Открыть: {selectedBranch.name}</span>
            </span>
            <span className="truncate text-[10px] text-[var(--pixel-text-muted)]">{branchTarget(selectedBranch)}</span>
          </PixelButton>
        ) : null}
      </PixelSurface>
    </div>
  );
};
