import { GitBranch, Map, RefreshCw, Sparkles, TriangleAlert } from 'lucide-react';

import {
  PixelButton,
  PixelMeter,
  PixelPanelHeader,
  PixelStack,
  PixelSurface,
  PixelText,
} from './pixel';

interface WindRoseBranch {
  id: number;
  name: string;
  primary_stat_id?: number | null;
  node_count: number;
  done_node_count: number;
  focus_node_id?: number | null;
  next_action_id?: number | null;
}

interface WindRoseStat {
  id: number;
  title: string;
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

export const WindRoseView = ({
  snapshot,
  isLoading,
  error,
  selectedStatId,
  onSelectStat,
  onOpenBranch,
  onRefresh,
}: WindRoseViewProps) => {
  const stats = snapshot?.stats ?? [];
  const selectedStat = stats.find((stat) => stat.id === selectedStatId) ?? stats[0] ?? null;
  const maxLevel = Math.max(5, ...stats.map((stat) => Number(stat.level ?? 1)));
  const polygonPoints = stats
    .map((stat, index: number) => {
      const levelRadius = 34 + (Number(stat.level ?? 1) / maxLevel) * 110;
      const point = polarPoint(index, stats.length, levelRadius);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <PixelSurface frame="panel" padding="xl">
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
            <PixelSurface frame="accent" padding="sm">
              <PixelText as="p" readable size="sm">
                {error}
              </PixelText>
            </PixelSurface>
          ) : null}

          {stats.length === 0 ? (
            <PixelSurface frame="ghost" padding="xl">
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
                          fill={stat.color ?? '#58d6ff'}
                          opacity={active ? 1 : 0.82}
                        />
                        <text
                          x={point.x}
                          y={point.y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="800"
                          fill="#06101c"
                        >
                          {stat.level}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="grid min-w-0 content-start gap-2">
                {stats.map((stat) => (
                  <button
                    key={stat.id}
                    type="button"
                    onClick={() => onSelectStat(stat.id)}
                    className="grid min-w-0 gap-2 border bg-[rgba(15,23,42,0.72)] p-3 text-left"
                    style={{
                      borderColor: selectedStat?.id === stat.id ? stat.color : 'var(--pixel-border)',
                    }}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span className="truncate text-sm font-bold text-[var(--pixel-text)]">{stat.title}</span>
                      <span className="text-xs uppercase text-[var(--pixel-text-muted)]">lvl {stat.level}</span>
                    </div>
                    <PixelMeter value={stat.progressToNext ?? 0} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </PixelStack>
      </PixelSurface>

      <PixelSurface frame="panel" padding="md">
        <PixelPanelHeader
          eyebrow="Стат"
          title={selectedStat?.title ?? 'Выбор'}
          description={selectedStat ? `${selectedStat.xp} XP · ${selectedStat.branches?.length ?? 0} ветк.` : 'Нажмите луч.'}
        />

        {selectedStat ? (
          <div className="mt-3 grid gap-2">
            {(selectedStat.branches ?? []).map((branch) => (
              <PixelButton
                key={branch.id}
                tone="ghost"
                onClick={() => onOpenBranch(branch)}
                style={{ justifyContent: 'space-between' }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <GitBranch size={14} />
                  <span className="truncate">{branch.name}</span>
                </span>
                <span className="text-xs text-[var(--pixel-text-muted)]">
                  {branch.done_node_count}/{branch.node_count}
                </span>
              </PixelButton>
            ))}

            {(selectedStat.branches ?? []).length === 0 ? (
              <PixelText as="p" readable size="sm" color="textMuted">
                Веток пока нет.
              </PixelText>
            ) : null}
          </div>
        ) : null}

        {(snapshot?.unassignedBranches ?? []).length > 0 ? (
          <PixelSurface frame="ghost" padding="sm" className="mt-3">
            <PixelText as="p" size="xs" color="warning" uppercase>
              <TriangleAlert size={13} className="inline" /> Без стата: {snapshot.unassignedBranches.length}
            </PixelText>
          </PixelSurface>
        ) : null}

        {selectedStat?.branches?.[0] ? (
          <PixelButton tone="accent" onClick={() => onOpenBranch(selectedStat.branches[0])} fullWidth style={{ marginTop: 12 }}>
            <Map size={16} /> Открыть ветку
          </PixelButton>
        ) : null}
      </PixelSurface>
    </div>
  );
};
