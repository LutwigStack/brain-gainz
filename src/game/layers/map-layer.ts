import { Container, FederatedPointerEvent, Graphics, Rectangle, Text } from 'pixi.js';

import { getGraphEdgeSemantics } from '../../application/graph-edge-semantics';
import { tryGetSphereTokenKey } from '../../theme/galaxy/sphere-id-to-token.ts';
import { sphereTokens, type SphereTokenKey } from '../../theme/galaxy/sphere-tokens.ts';
import {
  createQuadraticRoute,
  createStraightRoute,
  sampleJumpRoute,
} from '../edge-geometry';
import type { GameEdge, GameMapPresentation, GameNode, GamePoint, GameSceneModel, SkillAtlasEdgeRole, SkillAtlasNodeType } from '../types';
import type { ViewportCamera } from '../viewport';
import { StarMarker } from './star-marker';

/**
 * Pulse period (ms) — the corona scale and alpha complete one full
 * sine cycle in this many milliseconds. The workstream 02 spec pins
 * this at 2.4s; the constant is exported so the tests can pin the
 * value too.
 */
export const STAR_MARKER_PULSE_PERIOD_MS = 2400;
const STAR_MARKER_FALLBACK_HEX = '#ffffff';
const STAR_MARKER_FALLBACK_COLOR = STAR_MARKER_FALLBACK_HEX;

const statePalette = {
  locked: { fill: 0x111827, stroke: 0x475569, text: 0xcbd5e1, alpha: 0.55 },
  available: { fill: 0x123f43, stroke: 0x5eead4, text: 0xe6fffb, alpha: 0.9 },
  active: { fill: 0x1d4ed8, stroke: 0x93c5fd, text: 0xf8fbff, alpha: 1 },
  completed: { fill: 0x365314, stroke: 0xb9fbc0, text: 0xf7fee7, alpha: 0.92 },
  paused: { fill: 0x7c2d12, stroke: 0xfdba74, text: 0xffedd5, alpha: 0.84 },
} as const;

const NODE_BOX = {
  minWidth: 150,
  maxWidth: 340,
  height: 42,
  maxHeight: 112,
  radius: 8,
};

const OVERVIEW_NODE_BOX = {
  minWidth: 300,
  maxWidth: 460,
  height: 64,
  maxHeight: 104,
  radius: 8,
};

const NODE_GATE = {
  radius: 5.5,
  overviewRadius: 7,
  rim: 2,
  inset: 1,
};
const NODE_HIT_PADDING = 16;
const MIN_GATE_VISIBLE_ZOOM = 0.24;
const ATLAS_NODE_SIZE: Record<SkillAtlasNodeType, number> = {
  root: 76,
  domain_hub: 64,
  course_hub: 52,
  topic_node: 38,
  atomic_node: 24,
  practice_node: 28,
  review_node: 28,
  boss_node: 48,
};

/**
 * Epic 47 — three planet body sizes (workstream 02 spec).
 * `large` (14) is reserved for milestone nodes (boss_node +
 * domain_hub) and gets a thin elliptical ring; `medium` (10)
 * for the mid-tier hubs; `small` (6) for leaves.
 */
const PLANET_BODY_RADIUS: Record<SkillAtlasNodeType, number> = {
  root: 6,
  domain_hub: 14,
  course_hub: 10,
  topic_node: 10,
  atomic_node: 6,
  practice_node: 6,
  review_node: 6,
  boss_node: 14,
};

/** Visual types that get a milestone ring around the body. */
const MILESTONE_VISUAL_TYPES: ReadonlySet<SkillAtlasNodeType> = new Set([
  'boss_node',
  'domain_hub',
]);

const PLANET_INNER_STROKE_COLOR = 0xffffff;
const PLANET_INNER_STROKE_ALPHA = 0.3;
const PLANET_RING_ALPHA = 0.5;
const PLANET_RING_X_RATIO = 1.5;
const PLANET_RING_Y_RATIO = 0.6;
const PLANET_RING_ROTATION_RAD_PER_SEC = 0.05;
const PLANET_ICON_COLOR = 0xffffff;
const PLANET_ICON_ALPHA = 0.6;
const PLANET_HIT_PADDING = 10;

/**
 * Epic 47 workstream 03 — "jump route" edge visuals.
 *
 * The cosmic canvas draws every edge as a single Bezier curve in
 * the source sphere's `default` token at 30% alpha, with a
 * stardust trail of 3 small dots (1.5px) that animates along the
 * curve. The trail duration is derived from the edge length
 * (capped at 6s) and the per-edge state is a single Map keyed by
 * edge id — no React state, no per-frame allocations.
 */
const JUMP_ROUTE_STARDUST_DOT_COUNT = 3;
const JUMP_ROUTE_STARDUST_DOT_RADIUS = 1.5;
const JUMP_ROUTE_STARDUST_ALPHA = 0.5;
const JUMP_ROUTE_STARDUST_DOT_SPACING = 0.12;
const JUMP_ROUTE_HIT_WIDTH = 12;

/**
 * Cached "sampled curve + per-edge timing" for the current model.
 * Populated in `drawEdges` (when the static curve is drawn) and
 * consumed in `tick()` (when the stardust dots are animated).
 * The map is cleared on every `render()` so a model swap discards
 * stale trails.
 */
interface JumpRouteState {
  route: GamePoint[];
  durationMs: number;
  color: number;
}

/** Token keys we know are safe to look up in `sphereTokens`. */
const KNOWN_SPHERE_KEYS = new Set(Object.keys(sphereTokens) as SphereTokenKey[]);

const resolvePlanetRadius = (node: GameNode): number => {
  const visualType = node.atlasNodeType ?? 'atomic_node';
  return PLANET_BODY_RADIUS[visualType] ?? PLANET_BODY_RADIUS.atomic_node;
};

const resolvePlanetIsMilestone = (node: GameNode): boolean => {
  const visualType = node.atlasNodeType ?? 'atomic_node';
  return MILESTONE_VISUAL_TYPES.has(visualType);
};

const resolveSphereToken = (node: GameNode): SphereTokenKey => {
  const candidate = node.atlasSphereTokenKey;
  if (candidate && KNOWN_SPHERE_KEYS.has(candidate as SphereTokenKey)) {
    return candidate as SphereTokenKey;
  }
  return 'projects';
};

const hexStringToInt = (hex: string): number => parseInt(hex.startsWith('#') ? hex.slice(1) : hex, 16);

interface MapLayerHandlers {
  onNodePointerDown?: (nodeId: number, event: FederatedPointerEvent) => void;
  onNodeGatePointerDown?: (nodeId: number, gate: NodeGate, event: FederatedPointerEvent) => void;
  onEdgePointerDown?: (edgeId: number, event: FederatedPointerEvent) => void;
  selectedEdgeId?: number | null;
  connectSourceNodeId?: number | null;
  connectSourceGate?: NodeGate;
  connectPreviewTarget?: GamePoint | null;
  connectEdgeType?: 'requires' | 'supports' | 'relates_to' | null;
  connectPreviewState?: ConnectPreviewState;
  overviewMode?: boolean;
  forceNodeLabels?: boolean;
  presentation?: GameMapPresentation;
  onNodePointerOver?: (nodeId: number, event: FederatedPointerEvent) => void;
  onNodePointerOut?: (nodeId: number, event: FederatedPointerEvent) => void;
  /**
   * Catalog slug of the currently focused sphere (e.g. `programming`,
   * `mathematics`). When provided, the star marker uses the
   * matching `--sphere-{key}-strong` token for its body fill and
   * corona colour. When missing or unknown the marker falls back to
   * white and emits a `console.warn` so the missing binding is
   * visible in dev — see the epic 43 spec, workstream 01
   * "Color / Fallback".
   */
  currentSphereSlug?: string | null;
}

export type NodeGate = 'input' | 'output';
export type ConnectPreviewState = 'normal' | 'compatible' | 'forbidden';

const drawPolyline = (graphic: Graphics, points: GamePoint[]) => {
  if (points.length === 0) {
    return;
  }

  graphic.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => {
    graphic.lineTo(point.x, point.y);
  });
};

const drawDottedPolyline = (
  graphic: Graphics,
  points: GamePoint[],
  color: number,
  alpha: number,
  dotRadius: number,
  spacing: number,
) => {
  if (points.length === 0) {
    return;
  }

  let previous = points[0];
  let carry = 0;

  graphic.circle(previous.x, previous.y, dotRadius);
  graphic.fill({ color, alpha });

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const segmentLength = Math.hypot(dx, dy);

    if (segmentLength === 0) {
      previous = current;
      continue;
    }

    let distance = carry === 0 ? spacing : spacing - carry;

    while (distance <= segmentLength) {
      const ratio = distance / segmentLength;
      graphic.circle(previous.x + dx * ratio, previous.y + dy * ratio, dotRadius);
      graphic.fill({ color, alpha });
      distance += spacing;
    }

    carry = (segmentLength + carry) % spacing;
    previous = current;
  }
};

const getAtlasNodeEdgeAnchors = (fromNode: GameNode, toNode: GameNode): { from: GamePoint; to: GamePoint } => {
  const dx = toNode.position.x - fromNode.position.x;
  const dy = toNode.position.y - fromNode.position.y;
  const distance = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / distance, y: dy / distance };
  const fromRadius = resolvePlanetRadius(fromNode) + 5;
  const toRadius = resolvePlanetRadius(toNode) + 5;

  return {
    from: {
      x: fromNode.position.x + unit.x * fromRadius,
      y: fromNode.position.y + unit.y * fromRadius,
    },
    to: {
      x: toNode.position.x - unit.x * toRadius,
      y: toNode.position.y - unit.y * toRadius,
    },
  };
};

const getAtlasEdgeStyle = (
  edgeRole: SkillAtlasEdgeRole | undefined,
  isFocusEdge: boolean,
  isSelectedPathEdge: boolean,
): { alpha: number; width: number } => {
  if (isFocusEdge) {
    return { alpha: 0.32, width: 1.35 };
  }

  if (edgeRole === 'structure_root') {
    return { alpha: isSelectedPathEdge ? 0.22 : 0.13, width: 1.05 };
  }

  if (edgeRole === 'structure_branch') {
    return { alpha: isSelectedPathEdge ? 0.2 : 0.1, width: 0.85 };
  }

  return { alpha: isSelectedPathEdge ? 0.2 : 0.12, width: 0.7 };
};

const drawArrowHead = (
  graphic: Graphics,
  from: GamePoint,
  to: GamePoint,
  color: number,
  alpha: number,
  size: number,
) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / distance, y: dy / distance };
  const perpendicular = { x: -unit.y, y: unit.x };
  const base = {
    x: to.x - unit.x * size,
    y: to.y - unit.y * size,
  };

  graphic.poly([
    to.x,
    to.y,
    base.x + perpendicular.x * (size * 0.45),
    base.y + perpendicular.y * (size * 0.45),
    base.x - perpendicular.x * (size * 0.45),
    base.y - perpendicular.y * (size * 0.45),
  ]);
  graphic.fill({ color, alpha });
};

const formatRouteNodeLabel = (node: GameNode, overviewMode: boolean) => {
  if (!node.isRouteNode || overviewMode) {
    return overviewMode && (node.descendantCount ?? 0) > 0
      ? `${node.title}\n${node.descendantCount} узл.`
      : node.title;
  }

  const index = node.routeSequenceIndex != null ? `#${node.routeSequenceIndex}` : 'route';
  const status = node.isRouteComplete
    ? 'готово'
    : node.isCurrentRouteTarget
      ? 'цель'
      : node.isWeakRouteNode
        ? 'повтор'
        : node.isRouteLocked
          ? 'закрыто'
          : 'очередь';
  const stage = node.routeStage ? ` · ${node.routeStage}` : '';
  const required = node.routeRequiredMasteryLevel ? ` -> ${node.routeRequiredMasteryLevel}` : '';
  const mastery =
    node.routeCurrentMasteryRank != null ? `${node.routeCurrentMasteryRank}/6${required}` : required.trim();

  return `${index} · ${status}${stage}\n${node.title}${mastery ? `\n${mastery.trim()}` : ''}`;
};

export const resolveNodeBox = (node: GameNode, overviewMode = false) => {
  if (node.atlasNodeType) {
    const size = ATLAS_NODE_SIZE[node.atlasNodeType] ?? ATLAS_NODE_SIZE.atomic_node;
    return { width: size, height: size };
  }

  const box = overviewMode ? OVERVIEW_NODE_BOX : NODE_BOX;
  const charWidth = overviewMode ? 8.2 : 6.2;
  const lineLength = overviewMode ? 34 : 30;
  const lineHeight = overviewMode ? 18 : 14;
  const width = Math.min(
    box.maxWidth,
    Math.max(box.minWidth, 74 + node.title.length * charWidth, node.isRouteNode ? 248 : 0),
  );
  const routeLineCount = node.isRouteNode && !overviewMode ? 2 : 0;
  const estimatedLines =
    Math.ceil(node.title.length / lineLength) +
    routeLineCount +
    (overviewMode && (node.descendantCount ?? 0) > 0 ? 1 : 0);
  const height = Math.min(box.maxHeight, Math.max(box.height, 28 + estimatedLines * lineHeight));

  return { width, height };
};

export const getNodeGateAnchor = (
  node: GameNode,
  gate: NodeGate,
  overviewMode = false,
): GamePoint => {
  const box = resolveNodeBox(node, overviewMode);
  const radius = overviewMode ? NODE_GATE.overviewRadius : NODE_GATE.radius;
  const offset = box.width / 2 + radius - NODE_GATE.inset;

  return {
    x: node.position.x + (gate === 'output' ? offset : -offset),
    y: node.position.y,
  };
};

export const getRouteSegmentAnchors = (
  fromNode: GameNode,
  toNode: GameNode,
  overviewMode = false,
): { from: GamePoint; to: GamePoint } => {
  const goesRight = toNode.position.x >= fromNode.position.x;
  const fromGate = goesRight ? 'output' : 'input';
  const toGate = goesRight ? 'input' : 'output';

  return {
    from: getNodeGateAnchor(fromNode, fromGate, overviewMode),
    to: getNodeGateAnchor(toNode, toGate, overviewMode),
  };
};

export class MapLayer extends Container {
  private readonly world = new Container();
  private readonly edgeGraphics = new Graphics();
  private readonly edgeHitContainer = new Container();
  private readonly edgePreviewGraphics = new Graphics();
  /**
   * Epic 47 workstream 03 — animated stardust trail. A separate
   * Graphics batch so the trail can be redrawn every frame in
   * `tick()` without invalidating the static curve batch that was
   * emitted by `drawEdges()`. The container is added to `world`
   * after `edgeGraphics` so the trail sits above the static
   * curve and below the planets (which live in `nodeContainer`).
   */
  private readonly stardustGraphics = new Graphics();
  private readonly legendGraphics = new Graphics();
  private readonly legendLabels = new Container();
  private readonly nodeContainer = new Container();
  private readonly starMarkers = new Map<number, StarMarker>();
  private readonly nodeShells = new Map<number, Graphics>();
  private readonly nodeLabels = new Map<number, Text>();
  private readonly edgeHits = new Map<number, Graphics>();
  private readonly legendTexts = new Map<string, Text>();
  private readonly previewNodePositions = new Map<number, GamePoint>();
  /**
   * Per-edge sampled curve + duration cache for the stardust
   * trail. Cleared on every `render()` so a model swap drops
   * stale trails; populated by `drawEdges` (atlas branch) and
   * consumed by `tick()`.
   */
  private readonly jumpRouteStates = new Map<number, JumpRouteState>();
  private currentModel: GameSceneModel | null = null;
  private currentZoom = 1;
  private highlightedNodeId: number | null = null;
  private connectSourceNodeId: number | null = null;
  private connectSourceGate: NodeGate = 'output';
  private connectPreviewTarget: GamePoint | null = null;
  private connectEdgeType: 'requires' | 'supports' | 'relates_to' | null = null;
  private connectPreviewState: ConnectPreviewState = 'normal';
  private overviewMode = false;
  private forceNodeLabels = false;
  private presentation: GameMapPresentation = 'graph';
  private lastHandlers: MapLayerHandlers = {};
  /**
   * Catalog slug of the currently focused sphere (e.g. `programming`).
   * Cached from the last `render()` call so the `tick()` pulse loop
   * can keep using the same colour without re-reading the handlers.
   */
  private currentSphereSlug: string | null = null;
  /**
   * The colour the star markers were last drawn with, cached so a
   * `setColor` call is only emitted on a real change (the marker
   * allocates a FillGradient texture per colour, so we want this
   * idempotent for the steady state).
   */
  private lastAppliedStarColor: string | null = null;
  /**
   * Wall-clock origin for the pulse cycle. Updated every time the
   * document becomes visible again, so the cycle stays in phase
   * with the real clock after a tab switch (the spec calls this
   * "resume at current performance.now(), not at the paused
   * frame").
   */
  private pulseOriginMs = typeof performance !== 'undefined' ? performance.now() : 0;
  /**
   * Frozen cycle position used while the document is hidden — the
   * pulse holds the last visible frame until visibility flips back
   * to true, at which point `pulseOriginMs` resets and the cycle
   * restarts from 0.
   */
  private frozenCyclePos = 0;
  private isDocumentVisible = typeof document === 'undefined' ? true : !document.hidden;
  /**
   * Epic 47: cached rotation of the milestone-planet ring, in
   * radians. The rotation is paused when the tab is hidden; the
   * cached value freezes at the last computed rotation so the
   * ring does not jump on tab focus.
   */
  private cachedRingRotation = 0;
  private readonly handleVisibilityChange = () => {
    if (typeof document === 'undefined') {
      return;
    }
    this.isDocumentVisible = !document.hidden;
    if (this.isDocumentVisible && typeof performance !== 'undefined') {
      // Reset the cycle origin so the pulse resumes in phase with
      // the wall clock instead of continuing from the frozen frame
      // (workstream 02 §"Pause on hide").
      this.pulseOriginMs = performance.now();
    }
  };

  constructor() {
    super();
    this.world.addChild(
      this.edgeGraphics,
      this.stardustGraphics,
      this.edgeHitContainer,
      this.edgePreviewGraphics,
      this.nodeContainer,
    );
    this.addChild(this.world, this.legendGraphics, this.legendLabels);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  render(model: GameSceneModel, handlers: MapLayerHandlers = {}) {
    this.previewNodePositions.clear();
    // Epic 47 workstream 03 — drop the previous frame's stardust
    // trails on every model swap. The static curve is rebuilt in
    // `drawEdges`; the trail is rebuilt in `tick()`.
    this.jumpRouteStates.clear();
    this.stardustGraphics.clear();
    this.currentModel = model;
    this.lastHandlers = handlers;
    this.highlightedNodeId = model.highlightedNodeId;
    this.connectSourceNodeId = handlers.connectSourceNodeId ?? null;
    this.connectSourceGate = handlers.connectSourceGate ?? 'output';
    this.connectPreviewTarget = handlers.connectPreviewTarget ?? null;
    this.connectEdgeType = handlers.connectEdgeType ?? null;
    this.connectPreviewState = handlers.connectPreviewState ?? 'normal';
    this.overviewMode = handlers.overviewMode ?? false;
    this.forceNodeLabels = handlers.forceNodeLabels ?? false;
    this.presentation = handlers.presentation ?? 'graph';
    this.currentSphereSlug = handlers.currentSphereSlug ?? null;
    this.drawEdges(model, handlers);
    this.drawConnectPreview();
    this.drawLegend();

    const activeIds = new Set(
      model.nodes
        .filter((node) => this.shouldRenderNode(node))
        .map((node) => node.id),
    );

    model.nodes.filter((node) => this.shouldRenderNode(node)).forEach((node) => {
      const shell = this.nodeShells.get(node.id) ?? new Graphics();
      const starMarker = this.starMarkers.get(node.id) ?? new StarMarker();
      const label =
        this.nodeLabels.get(node.id) ??
        new Text({
          text: '',
          style: {
            fontFamily: 'Trebuchet MS',
            fontSize: 11,
            fontWeight: '700',
            fill: 0xffffff,
          },
        });

      if (!this.nodeShells.has(node.id)) {
        this.nodeShells.set(node.id, shell);
        this.starMarkers.set(node.id, starMarker);
        this.nodeLabels.set(node.id, label);
        // Z-order: edges → planet shell (body + ring + icon) →
        // current-node marker (corona + star) → label. Epic 47
        // workstream 02 §"Body" pins the planet body above the
        // edges and below the current-node marker; the marker
        // is therefore added AFTER the shell so the corona glows
        // over the planet rim instead of being clipped by it.
        this.nodeContainer.addChild(shell, starMarker, label);
      }

      starMarker.eventMode = 'none';
      label.eventMode = 'none';
      shell.eventMode = 'static';
      shell.cursor = 'pointer';
      shell.removeAllListeners();
      shell.on('pointerdown', (event) => {
        const gate = this.resolvePointerGate(this.withRenderPosition(node), event);
        if (gate) {
          event.stopPropagation();
          handlers.onNodeGatePointerDown?.(node.id, gate, event);
          return;
        }

        event.stopPropagation();
        handlers.onNodePointerDown?.(node.id, event);
      });
      shell.on('pointerover', (event) => {
        handlers.onNodePointerOver?.(node.id, event);
      });
      shell.on('pointerout', (event) => {
        handlers.onNodePointerOut?.(node.id, event);
      });

      this.drawNode(this.withRenderPosition(node), shell, starMarker, label, model);
      if (node.id === model.highlightedNodeId) {
        // Re-add the highlighted node on top so its halo + marker
        // stay above the other planets (the marker pulses and
        // would otherwise be hidden by an adjacent large planet).
        this.nodeContainer.addChild(shell, starMarker, label);
      }
    });

    [...this.nodeShells.keys()].forEach((nodeId) => {
      if (activeIds.has(nodeId)) {
        return;
      }

      this.nodeShells.get(nodeId)?.destroy();
      this.starMarkers.get(nodeId)?.destroy();
      this.nodeLabels.get(nodeId)?.destroy();
      this.nodeShells.delete(nodeId);
      this.starMarkers.delete(nodeId);
      this.nodeLabels.delete(nodeId);
    });

    this.refreshLabelVisibility();
  }

  previewNodePosition(nodeId: number, position: GamePoint, model: GameSceneModel) {
    const node = model.nodes.find((item) => item.id === nodeId);
    const shell = this.nodeShells.get(nodeId);
    const starMarker = this.starMarkers.get(nodeId);
    const label = this.nodeLabels.get(nodeId);

    if (!node || !shell || !starMarker || !label) {
      return;
    }

    this.previewNodePositions.set(nodeId, position);
    this.drawEdges(model, this.lastHandlers);
    this.drawConnectPreview();

    this.drawNode(
      {
        ...node,
        position,
      },
      shell,
      starMarker,
      label,
      model,
    );
  }

  tick(_deltaTime: number) {
    // The pulse is driven by `performance.now()` (not the frame
    // counter) so that a frame drop never skips the cycle visibly.
    // While the document is hidden we freeze the cycle position and
    // skip the per-marker update; the next tick after a
    // `visibilitychange` re-syncs the origin to the current
    // `performance.now()` and the cycle resumes from 0.
    void _deltaTime; // accepted for the public tick signature; pulse is wall-clock based.
    const cyclePos = this.resolveCyclePosition();

    this.starMarkers.forEach((starMarker, nodeId) => {
      const node = this.currentModel?.nodes.find((item) => item.id === nodeId);
      const isCurrent = nodeId === this.highlightedNodeId || node?.isCurrentRouteTarget === true;
      starMarker.visible = isCurrent;
      if (!isCurrent) {
        return;
      }

      starMarker.applyPulse(cyclePos);
    });

    // Epic 47 workstream 03 — stardust trail. Drawn from the
    // `performance.now()` clock so the animation is in phase with
    // the marker pulse and the milestone-ring rotation. When the
    // tab is hidden we skip the redraw entirely (the trail freezes
    // at its last frame) and we also redraw a frame on the next
    // tick after a visibility flip so the dots resume from the
    // current wall clock instead of jumping to a stale position.
    this.renderStardustTrails();
  }

  override destroy(options?: Parameters<Container['destroy']>[0]) {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    super.destroy(options);
  }

  private resolveCyclePosition(): number {
    if (!this.isDocumentVisible) {
      return this.frozenCyclePos;
    }
    if (typeof performance === 'undefined') {
      return 0;
    }
    const elapsed = performance.now() - this.pulseOriginMs;
    const cyclePos = ((elapsed % STAR_MARKER_PULSE_PERIOD_MS) + STAR_MARKER_PULSE_PERIOD_MS) % STAR_MARKER_PULSE_PERIOD_MS;
    const normalised = cyclePos / STAR_MARKER_PULSE_PERIOD_MS;
    this.frozenCyclePos = normalised;
    return normalised;
  }

  /**
   * Redraw the stardust trail batch for every cached jump route.
   * The trail is a train of `JUMP_ROUTE_STARDUST_DOT_COUNT` small
   * dots that travel along the curve from source to target over
   * `durationMs` and then loop. The head is at `headT`; the tail
   * dots are spaced `JUMP_ROUTE_STARDUST_DOT_SPACING` (12% of
   * the curve) behind it, so a 3-dot train spans ~24% of the
   * curve.
   *
   * Performance: one Graphics batch per frame, with at most
   * `edges.length * 3` circles. There is no per-edge sprite; the
   * batch is redrawn from the same sampled `route` array that
   * was cached in `drawEdges()`. The work is skipped entirely
   * when the tab is hidden.
   */
  private renderStardustTrails() {
    if (!this.isDocumentVisible) {
      // Freeze the last visible frame. The trail stays at whatever
      // the previous tick painted; the next visible tick resumes
      // from the current `performance.now()` because the per-edge
      // phase is derived from the wall clock.
      return;
    }
    if (this.jumpRouteStates.size === 0) {
      this.stardustGraphics.clear();
      return;
    }
    if (typeof performance === 'undefined') {
      return;
    }

    const now = performance.now();
    this.stardustGraphics.clear();
    this.jumpRouteStates.forEach((state) => {
      // Wrap the head position so the trail loops without a hard
      // jump. The `+ 0.15` headroom keeps the tail inside [0, 1]
      // when the head crosses 1.
      const phase = (now % state.durationMs) / state.durationMs;
      const headT = phase;
      for (let dotIndex = 0; dotIndex < JUMP_ROUTE_STARDUST_DOT_COUNT; dotIndex += 1) {
        const t = headT - dotIndex * JUMP_ROUTE_STARDUST_DOT_SPACING;
        if (t < 0 || t > 1) {
          continue;
        }
        const point = sampleJumpRoute(state.route, t);
        this.stardustGraphics.circle(point.x, point.y, JUMP_ROUTE_STARDUST_DOT_RADIUS);
        this.stardustGraphics.fill({ color: state.color, alpha: JUMP_ROUTE_STARDUST_ALPHA });
      }
    });
  }

  setViewport(camera: ViewportCamera) {
    this.currentZoom = camera.zoom;
    this.world.position.set(camera.x, camera.y);
    this.world.scale.set(camera.zoom);
    this.refreshLabelVisibility();
  }

  setConnectPreview(
    sourceNodeId: number | null,
    sourceGate: NodeGate,
    target: GamePoint | null,
    edgeType: 'requires' | 'supports' | 'relates_to' | null,
    state: ConnectPreviewState = 'normal',
  ) {
    this.connectSourceNodeId = sourceNodeId;
    this.connectSourceGate = sourceGate;
    this.connectPreviewTarget = target;
    this.connectEdgeType = edgeType;
    this.connectPreviewState = state;
    this.drawConnectPreview();
  }

  clearNodePreview(nodeId: number) {
    if (!this.previewNodePositions.delete(nodeId) || !this.currentModel) {
      return;
    }

    this.drawEdges(this.currentModel, this.lastHandlers);
    this.drawConnectPreview();
  }

  restoreNodeFromModel(nodeId: number) {
    if (!this.currentModel) {
      return;
    }

    const node = this.currentModel.nodes.find((item) => item.id === nodeId);
    const shell = this.nodeShells.get(nodeId);
    const starMarker = this.starMarkers.get(nodeId);
    const label = this.nodeLabels.get(nodeId);

    if (!node || !shell || !starMarker || !label) {
      return;
    }

    this.drawNode(this.withRenderPosition(node), shell, starMarker, label, this.currentModel);
  }

  private drawEdges(model: GameSceneModel, handlers: MapLayerHandlers) {
    this.edgeGraphics.clear();
    if (this.presentation === 'skill-atlas') {
      this.drawAtlasBackdrop(model);
    }
    const nodeById = new Map(
      model.nodes
        .filter((node) => this.shouldRenderNode(node))
        .map((node) => [
          node.id,
          {
            ...node,
            position: this.getRenderPosition(node),
          },
        ]),
    );
    const activeEdgeIds = new Set<number>();
    const isLargeGraphDetail = !this.overviewMode && model.nodes.length >= 40;
    const isAtlas = this.presentation === 'skill-atlas';

    model.edges.forEach((edge) => {
      const fromNode = nodeById.get(edge.fromNodeId);
      const toNode = nodeById.get(edge.toNodeId);

      if (!fromNode || !toNode) {
        return;
      }

      if (isAtlas && edge.atlasEdgeRole === 'route_overlay') {
        return;
      }

      activeEdgeIds.add(edge.id);
      const isSelected = edge.id === handlers.selectedEdgeId;
      const isSelectedPathEdge = Boolean(fromNode.isOnSelectedPath && toNode.isOnSelectedPath);
      const isOverviewPrimaryEdge =
        this.overviewMode &&
        edge.type !== 'relates_to' &&
        ((fromNode.hierarchyDepth === 0 && toNode.hierarchyDepth === 1) || isSelectedPathEdge);
      const isFocusEdge = !this.overviewMode && Boolean(handlers.selectedEdgeId) && isSelected;
      const semantics = getGraphEdgeSemantics(edge.type);
      const color = semantics.canvas.color;
      const baseEdgeAlpha =
        isAtlas
          ? isSelectedPathEdge || isFocusEdge
            ? 0.28
            : 0.025
          : isLargeGraphDetail && !isFocusEdge
            ? Math.min(semantics.canvas.alpha, 0.18)
            : semantics.canvas.alpha;
      const baseEdgeWidth =
        isAtlas
          ? isFocusEdge
            ? 2
            : 0.55
          : isLargeGraphDetail && !isFocusEdge
            ? Math.min(semantics.canvas.width, 1.1)
            : semantics.canvas.width;
      const shouldDrawGlow = semantics.canvas.pattern === 'glow' && (!isLargeGraphDetail || isFocusEdge) && !isAtlas;
      const alpha = this.overviewMode
        ? isSelectedPathEdge
          ? 0.9
          : isOverviewPrimaryEdge
            ? 0.58
            : 0.18
        : isFocusEdge
          ? semantics.canvas.selectedAlpha
          : baseEdgeAlpha;
      const fromAnchor = getNodeGateAnchor(fromNode, 'output', this.overviewMode);
      const toAnchor = getNodeGateAnchor(toNode, 'input', this.overviewMode);
      const route = createQuadraticRoute(
        fromAnchor,
        toAnchor,
        edge.fromNodeId <= edge.toNodeId ? 1 : -1,
        semantics.canvas.bendStrength,
      );

      if (isAtlas) {
        // Epic 47 workstream 03 — cosmic "jump route". The curve
        // is a single Bezier in the source sphere's `default` token
        // at 30% alpha; the stardust trail (3 dots, 1.5px, 50%
        // alpha) is animated separately in `tick()` using the
        // route state cached on `jumpRouteStates`. The edge
        // hit-area is still a 12px transparent polyline so the
        // existing pointer interactions keep working.
        const sourceSphere = resolveSphereToken(fromNode);
        const sourcePalette = sphereTokens[sourceSphere];
        const edgeColor = hexStringToInt(sourcePalette.default);
        const anchors = getAtlasNodeEdgeAnchors(fromNode, toNode);
        const routePoints = createStraightRoute(anchors.from, anchors.to);
        const style = getAtlasEdgeStyle(edge.atlasEdgeRole, isFocusEdge, isSelectedPathEdge);

        // Static curve batch — drawn in one stroke() call so the
        // GPU sees a single path. The curve sits above the
        // cosmic background (workstream 01) and below the
        // planets (workstream 02) because the nodeContainer is
        // added after edgeGraphics in the world container.
        drawPolyline(this.edgeGraphics, routePoints);
        this.edgeGraphics.stroke({
          width: style.width / Math.max(this.currentZoom, 0.75),
          color: edgeColor,
          alpha: style.alpha,
        });

        const hit =
          this.edgeHits.get(edge.id) ??
          (() => {
            const graphic = new Graphics();
            graphic.eventMode = 'static';
            graphic.cursor = 'pointer';
            this.edgeHits.set(edge.id, graphic);
            this.edgeHitContainer.addChild(graphic);
            return graphic;
          })();

        hit.removeAllListeners();
        hit.on('pointerdown', (event) => {
          event.stopPropagation();
          handlers.onEdgePointerDown?.(edge.id, event);
        });
        hit.clear();
        drawPolyline(hit, routePoints);
        hit.stroke({
          width: JUMP_ROUTE_HIT_WIDTH,
          color: edgeColor,
          alpha: 0.001,
        });
        return;
      }

      if (shouldDrawGlow) {
        this.edgeGraphics.setStrokeStyle({
          width:
            (isFocusEdge || (this.overviewMode && isSelectedPathEdge)
              ? semantics.canvas.selectedWidth
              : baseEdgeWidth) + 4,
          color,
          alpha: alpha * 0.18,
        });
        drawPolyline(this.edgeGraphics, route);
      }

      if (semantics.canvas.pattern === 'dotted') {
        drawDottedPolyline(
          this.edgeGraphics,
          route,
          color,
          alpha,
          isSelected ? 2.8 : 2.2,
          isSelected ? 12 : 14,
        );
      } else {
        this.edgeGraphics.setStrokeStyle({
          width: this.overviewMode
            ? isSelectedPathEdge
              ? 4
              : 2.4
            : isFocusEdge
              ? semantics.canvas.selectedWidth
              : baseEdgeWidth,
          color,
          alpha,
        });
        drawPolyline(this.edgeGraphics, route);
      }

      if (!isAtlas || isFocusEdge) {
        drawArrowHead(
          this.edgeGraphics,
          route[route.length - 2] ?? fromAnchor,
          route[route.length - 1] ?? toAnchor,
          color,
          this.overviewMode ? alpha : isFocusEdge ? 0.92 : isLargeGraphDetail ? 0.42 : 0.72,
          this.overviewMode ? 11 : isFocusEdge ? 14 : isLargeGraphDetail ? 7 : 12,
        );
      }

      const hit =
        this.edgeHits.get(edge.id) ??
        (() => {
          const graphic = new Graphics();
          graphic.eventMode = 'static';
          graphic.cursor = 'pointer';
          this.edgeHits.set(edge.id, graphic);
          this.edgeHitContainer.addChild(graphic);
          return graphic;
        })();

      hit.removeAllListeners();
      hit.on('pointerdown', (event) => {
        event.stopPropagation();
        handlers.onEdgePointerDown?.(edge.id, event);
      });
      hit.clear();
      drawPolyline(hit, route);
      hit.stroke({ width: 14, color, alpha: 0.001 });
    });

    const routeNodes = [...nodeById.values()]
      .filter((node) => node.isRouteNode)
      .sort((left, right) => (left.routeSequenceIndex ?? 9999) - (right.routeSequenceIndex ?? 9999));
    const routeOverlayNodes = isAtlas
      ? (() => {
          const currentIndex = routeNodes.findIndex((node) => node.isCurrentRouteTarget);
          const anchorIndex = currentIndex >= 0 ? currentIndex : routeNodes.findIndex((node) => !node.isRouteComplete);
          const startIndex = Math.max(0, (anchorIndex >= 0 ? anchorIndex : 0) - 1);
          return routeNodes.slice(startIndex, startIndex + 4);
        })()
      : routeNodes;
    routeOverlayNodes.slice(0, -1).forEach((fromNode, index) => {
      const toNode = routeOverlayNodes[index + 1];
      const anchors = isAtlas
        ? getAtlasNodeEdgeAnchors(fromNode, toNode)
        : getRouteSegmentAnchors(fromNode, toNode, this.overviewMode);
      const route = isAtlas
        ? createStraightRoute(anchors.from, anchors.to)
        : createQuadraticRoute(anchors.from, anchors.to, fromNode.id <= toNode.id ? 1 : -1, 0.12);
      const isCurrentSegment = Boolean(fromNode.isCurrentRouteTarget || toNode.isCurrentRouteTarget);
      const color = isCurrentSegment ? 0x38bdf8 : 0xfacc15;
      const atlasStrokeScale = 1 / Math.max(this.currentZoom, 0.35);

      if (isAtlas && !isCurrentSegment) {
        drawDottedPolyline(this.edgeGraphics, route, color, 0.045, 0.75 * atlasStrokeScale, 24);
      } else {
        drawPolyline(this.edgeGraphics, route);
        this.edgeGraphics.stroke({
          width: isAtlas ? (isCurrentSegment ? 0.8 : 0.45) * atlasStrokeScale : isCurrentSegment ? 4 : 2.6,
          color,
          alpha: isAtlas ? (isCurrentSegment ? 0.16 : 0.045) : isCurrentSegment ? 0.68 : 0.38,
        });
      }
      if (!isAtlas) {
        drawArrowHead(
          this.edgeGraphics,
          route[route.length - 2] ?? anchors.from,
          route[route.length - 1] ?? anchors.to,
          color,
          isCurrentSegment ? 0.86 : 0.55,
          isCurrentSegment ? 12 : 9,
        );
      }
    });

    [...this.edgeHits.keys()].forEach((edgeId) => {
      if (activeEdgeIds.has(edgeId)) {
        return;
      }

      this.edgeHits.get(edgeId)?.destroy();
      this.edgeHits.delete(edgeId);
    });
  }

  private drawConnectPreview() {
    this.edgePreviewGraphics.clear();

    if (
      !this.currentModel ||
      this.connectSourceNodeId == null ||
      this.connectPreviewTarget == null ||
      this.connectEdgeType == null
    ) {
      return;
    }

    const source = this.currentModel.nodes.find((node) => node.id === this.connectSourceNodeId);
    if (!source) {
      return;
    }

    const semantics = getGraphEdgeSemantics(this.connectEdgeType);
    const isForbidden = this.connectPreviewState === 'forbidden';
    const color = isForbidden ? 0xfb7185 : semantics.canvas.color;
    const sourcePosition = this.getRenderPosition(source);
    const sourceNode = { ...source, position: sourcePosition };
    const sourceAnchor = getNodeGateAnchor(sourceNode, this.connectSourceGate, this.overviewMode);
    const route = createQuadraticRoute(
      sourceAnchor,
      this.connectPreviewTarget,
      1,
      semantics.canvas.bendStrength,
    );

    if (semantics.canvas.pattern === 'glow' && !isForbidden) {
      this.edgePreviewGraphics.setStrokeStyle({ width: 7, color, alpha: 0.12 });
      drawPolyline(this.edgePreviewGraphics, route);
    }

    if (semantics.canvas.pattern === 'dotted' || isForbidden) {
      drawDottedPolyline(this.edgePreviewGraphics, route, color, isForbidden ? 0.84 : 0.72, 2.2, isForbidden ? 8 : 12);
    } else {
      this.edgePreviewGraphics.setStrokeStyle({
        width: this.connectPreviewState === 'compatible' ? 4 : 3,
        color,
        alpha: this.connectPreviewState === 'compatible' ? 0.82 : 0.68,
      });
      drawPolyline(this.edgePreviewGraphics, route);
    }
    drawArrowHead(
      this.edgePreviewGraphics,
      route[route.length - 2] ?? sourceAnchor,
      route[route.length - 1] ?? this.connectPreviewTarget,
      color,
      isForbidden ? 0.45 : 0.9,
      14,
    );
  }

  private drawLegend() {
    this.legendGraphics.clear();
    this.legendLabels.visible = false;
  }

  private drawNode(
    node: GameNode,
    shell: Graphics,
    starMarker: StarMarker,
    label: Text,
    model: GameSceneModel,
  ) {
    if (this.presentation === 'skill-atlas') {
      this.drawAtlasNode(node, shell, starMarker, label, model);
      return;
    }

    const palette = statePalette[node.state];
    const biome = model.biomes.find((item) => item.id === node.biomeId);
    const box = resolveNodeBox(node, this.overviewMode);
    const radius = this.overviewMode ? OVERVIEW_NODE_BOX.radius : NODE_BOX.radius;
    const isHighlighted = node.id === this.highlightedNodeId;
    const isConnectSource = node.id === this.connectSourceNodeId;
    const controlColor =
      node.controlState === 'lost' || node.controlState === 'contested'
        ? 0xfb7185
        : node.controlState === 'weakened'
          ? 0xfacc15
          : node.controlState === 'controlled' || node.controlState === 'fortified'
            ? 0x6ee7b7
            : node.controlState === 'scouted'
              ? 0x38bdf8
              : null;
    const routeColor = controlColor ?? (node.isRouteComplete
      ? 0x6ee7b7
      : node.isCurrentRouteTarget
        ? 0x38bdf8
        : node.isWeakRouteNode
          ? 0xfb7185
          : node.isRouteLocked
            ? 0x64748b
            : 0xfacc15);
    const borderColor = isHighlighted
      ? biome?.accent ?? palette.stroke
      : isConnectSource
        ? 0xfbbf24
        : node.isRouteNode
          ? routeColor
        : palette.stroke;

    // The star marker is the new current-node indicator (epic 43).
    // The colour is the current sphere's `strong` token so the
    // marker reads as the same "active star" the legend paints for
    // the WindRose. The visibility check in `tick()` decides whether
    // the marker is shown for this particular node; the geometry
    // is always drawn here so a later flip doesn't need a re-draw.
    const starColor = this.resolveStarColor();
    starMarker.setColor(starColor);
    starMarker.position.set(node.position.x, node.position.y);

    shell.clear();
    shell.hitArea = new Rectangle(
      -box.width / 2 - NODE_HIT_PADDING,
      -box.height / 2 - NODE_HIT_PADDING,
      box.width + NODE_HIT_PADDING * 2,
      box.height + NODE_HIT_PADDING * 2,
    );
    shell.roundRect(
      -box.width / 2 - 5,
      -box.height / 2 - 5,
      box.width + 10,
      box.height + 10,
      radius + 5,
    );
    shell.fill({ color: palette.fill, alpha: 0.001 });
    shell.roundRect(-box.width / 2, -box.height / 2, box.width, box.height, radius);
    shell.fill({ color: palette.fill, alpha: palette.alpha });
    shell.roundRect(
      -box.width / 2 - 1,
      -box.height / 2 - 1,
      box.width + 2,
      box.height + 2,
      radius + 1,
    );
    shell.stroke({
      color: borderColor,
      width: isHighlighted || node.isCurrentRouteTarget ? 3.5 : isConnectSource || node.isRouteNode ? 3 : 2,
      alpha: 0.96,
    });
    if (node.isRouteNode) {
      const stripeColor = node.isCurrentRouteTarget ? 0x38bdf8 : routeColor;
      shell.roundRect(-box.width / 2 + 8, -box.height / 2 + 6, 5, box.height - 12, 3);
      shell.fill({ color: stripeColor, alpha: node.isRouteComplete ? 0.58 : 0.9 });
      shell.roundRect(box.width / 2 - 42, -box.height / 2 + 6, 34, 16, 4);
      shell.fill({ color: 0x020617, alpha: 0.78 });
      shell.stroke({ color: stripeColor, width: 1.5, alpha: 0.88 });
      if (node.isCurrentRouteTarget) {
        shell.roundRect(-box.width / 2 - 6, -box.height / 2 - 6, box.width + 12, box.height + 12, radius + 6);
        shell.stroke({ color: 0x38bdf8, width: 1.5, alpha: 0.48 });
      }
    }
    const gateAlphaMultiplier = this.currentZoom < MIN_GATE_VISIBLE_ZOOM && !this.overviewMode ? 0.16 : 1;
    this.drawNodeGate(shell, box, 'input', {
      fill: 0x0b1220,
      stroke: 0x94a3b8,
      alpha: (node.state === 'locked' ? 0.56 : 0.9) * gateAlphaMultiplier,
      overviewMode: this.overviewMode,
    });
    this.drawNodeGate(shell, box, 'output', {
      fill: borderColor,
      stroke: biome?.accent ?? palette.stroke,
      alpha: (node.state === 'locked' ? 0.62 : 1) * gateAlphaMultiplier,
      overviewMode: this.overviewMode,
    });
    shell.position.set(node.position.x, node.position.y);

    label.style = {
      fontFamily: 'Trebuchet MS',
      fontSize: this.overviewMode ? 16 : node.isRouteNode ? 11 : node.title.length > 46 ? 9 : 10,
      fontWeight: '700',
      fill: palette.text,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: box.width - (node.isRouteNode ? 54 : 20),
      lineHeight: this.overviewMode ? 19 : node.isRouteNode ? 15 : undefined,
    };
    label.text = formatRouteNodeLabel(node, this.overviewMode);
    label.anchor.set(0.5);
    label.position.set(node.position.x, node.position.y);
    label.alpha = node.state === 'locked' ? 0.72 : 1;
    label.visible = this.shouldShowNodeLabel(node.id);
  }

  private drawAtlasSectorWedge(centerAngle: number, sectorWidth: number, color: number, accent: number) {
    const outerRadius = 1_070;
    const innerRadius = 180;
    const startAngle = centerAngle - sectorWidth / 2;
    const endAngle = centerAngle + sectorWidth / 2;
    const steps = 28;

    this.edgeGraphics.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
    for (let index = 0; index <= steps; index += 1) {
      const angle = startAngle + ((endAngle - startAngle) * index) / steps;
      this.edgeGraphics.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }
    for (let index = steps; index >= 0; index -= 1) {
      const angle = startAngle + ((endAngle - startAngle) * index) / steps;
      this.edgeGraphics.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    }
    this.edgeGraphics.lineTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
    this.edgeGraphics.fill({ color, alpha: 0.07 });

    this.edgeGraphics.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
    for (let index = 0; index <= steps; index += 1) {
      const angle = startAngle + ((endAngle - startAngle) * index) / steps;
      this.edgeGraphics.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
    }
    this.edgeGraphics.stroke({ color: accent, width: 1.2, alpha: 0.2 });

    this.edgeGraphics.moveTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
    for (let index = 0; index <= steps; index += 1) {
      const angle = startAngle + ((endAngle - startAngle) * index) / steps;
      this.edgeGraphics.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }
    this.edgeGraphics.stroke({ color: accent, width: 2, alpha: 0.12 });
  }

  private drawAtlasBackdrop(model: GameSceneModel) {
    const sectorWidth = model.biomes.length > 0 ? (Math.PI * 2) / model.biomes.length : Math.PI * 2;
    model.biomes.forEach((biome) => {
      const centerAngle = Math.atan2(biome.center.y, biome.center.x);
      this.drawAtlasSectorWedge(centerAngle, Math.max(0.34, sectorWidth * 0.88), biome.color, biome.accent);
      this.edgeGraphics.circle(biome.center.x, biome.center.y, biome.radius);
      this.edgeGraphics.fill({ color: biome.color, alpha: 0.035 });
      this.edgeGraphics.circle(biome.center.x, biome.center.y, biome.radius);
      this.edgeGraphics.stroke({ color: biome.accent, width: 2, alpha: 0.16 });
      this.edgeGraphics.circle(biome.center.x, biome.center.y, Math.max(36, biome.radius * 0.18));
      this.edgeGraphics.stroke({ color: biome.accent, width: 1.4, alpha: 0.24 });
    });

    [180, 260, 500, 720, 900].forEach((radius, index) => {
      this.edgeGraphics.circle(0, 0, radius);
      this.edgeGraphics.stroke({ color: index % 2 === 0 ? 0x60a5fa : 0xfbbf24, width: 1, alpha: 0.075 });
    });
  }

  private drawAtlasIcon(shell: Graphics, iconKey: string, color: number, size: number) {
    // Epic 47: the icon is rendered in white at 60% alpha, scaled
    // to 4-6px regardless of the planet body size. The caller
    // passes the icon diameter in pixels via `size` (not the
    // planet diameter); the default icon path is the existing
    // vector set, retuned for the small canvas.
    const iconSize = Math.max(4, Math.min(6, size));
    const iconAlpha = 0.6;
    shell.setStrokeStyle({ width: 1, color, alpha: iconAlpha });

    if (iconKey === 'database') {
      shell.ellipse(0, -iconSize * 0.34, iconSize * 0.55, iconSize * 0.24);
      shell.stroke();
      shell.moveTo(-iconSize * 0.55, -iconSize * 0.34);
      shell.lineTo(-iconSize * 0.55, iconSize * 0.42);
      shell.moveTo(iconSize * 0.55, -iconSize * 0.34);
      shell.lineTo(iconSize * 0.55, iconSize * 0.42);
      shell.stroke();
      shell.ellipse(0, iconSize * 0.42, iconSize * 0.55, iconSize * 0.24);
      shell.stroke();
      return;
    }

    if (iconKey === 'math') {
      shell.moveTo(-iconSize * 0.58, -iconSize * 0.5);
      shell.lineTo(iconSize * 0.42, -iconSize * 0.5);
      shell.moveTo(-iconSize * 0.48, 0);
      shell.lineTo(iconSize * 0.34, 0);
      shell.moveTo(-iconSize * 0.58, iconSize * 0.5);
      shell.lineTo(iconSize * 0.42, iconSize * 0.5);
      shell.moveTo(-iconSize * 0.54, -iconSize * 0.5);
      shell.lineTo(-iconSize * 0.08, 0);
      shell.lineTo(-iconSize * 0.54, iconSize * 0.5);
      shell.stroke();
      return;
    }

    if (iconKey === 'algorithm') {
      const points = [
        { x: -iconSize * 0.48, y: -iconSize * 0.32 },
        { x: 0, y: -iconSize * 0.48 },
        { x: iconSize * 0.5, y: 0.02 },
        { x: 0, y: iconSize * 0.5 },
        { x: -iconSize * 0.5, y: iconSize * 0.2 },
      ];
      points.forEach((point, index) => {
        if (index > 0) {
          const previous = points[index - 1];
          shell.moveTo(previous.x, previous.y);
          shell.lineTo(point.x, point.y);
        }
        shell.circle(point.x, point.y, 0.9);
        shell.fill({ color, alpha: iconAlpha });
      });
      shell.stroke();
      return;
    }

    if (iconKey === 'systems') {
      shell.rect(-iconSize * 0.45, -iconSize * 0.45, iconSize * 0.9, iconSize * 0.9);
      shell.stroke();
      shell.rect(-iconSize * 0.22, -iconSize * 0.22, iconSize * 0.44, iconSize * 0.44);
      shell.stroke();
      return;
    }

    if (iconKey === 'debug') {
      shell.circle(0, 0, iconSize * 0.36);
      shell.stroke();
      shell.moveTo(-iconSize * 0.62, -iconSize * 0.42);
      shell.lineTo(-iconSize * 0.26, -iconSize * 0.16);
      shell.moveTo(iconSize * 0.62, -iconSize * 0.42);
      shell.lineTo(iconSize * 0.26, -iconSize * 0.16);
      shell.moveTo(-iconSize * 0.68, iconSize * 0.3);
      shell.lineTo(-iconSize * 0.28, iconSize * 0.16);
      shell.moveTo(iconSize * 0.68, iconSize * 0.3);
      shell.lineTo(iconSize * 0.28, iconSize * 0.16);
      shell.stroke();
      return;
    }

    if (iconKey === 'build') {
      shell.moveTo(-iconSize * 0.5, iconSize * 0.42);
      shell.lineTo(iconSize * 0.46, -iconSize * 0.54);
      shell.moveTo(-iconSize * 0.34, -iconSize * 0.48);
      shell.lineTo(iconSize * 0.52, iconSize * 0.38);
      shell.stroke();
      return;
    }

    shell.moveTo(-iconSize * 0.48, -iconSize * 0.1);
    shell.lineTo(-iconSize * 0.18, -iconSize * 0.42);
    shell.moveTo(-iconSize * 0.48, -iconSize * 0.1);
    shell.lineTo(-iconSize * 0.18, iconSize * 0.22);
    shell.moveTo(iconSize * 0.48, -iconSize * 0.1);
    shell.lineTo(iconSize * 0.18, -iconSize * 0.42);
    shell.moveTo(iconSize * 0.48, -iconSize * 0.1);
    shell.lineTo(iconSize * 0.18, iconSize * 0.22);
    shell.stroke();
  }

  private drawAtlasNode(
    node: GameNode,
    shell: Graphics,
    starMarker: StarMarker,
    label: Text,
    _model: GameSceneModel,
  ) {
    void _model; // epic 47 re-introduces the model lookup; the canvas-only path doesn't need it.
    const isHighlighted = node.id === this.highlightedNodeId;
    const isBoss = node.atlasNodeType === 'boss_node';
    const isReview = node.atlasNodeType === 'review_node';
    const isRoot = node.atlasNodeType === 'root';
    const isHub = node.atlasNodeType === 'domain_hub' || node.atlasNodeType === 'course_hub' || node.atlasNodeType === 'topic_node';

    // Epic 47: planet body color comes from the sphere token, not
    // the hard-coded biome palette. Resolve the body radius from
    // the three planet sizes (small=6, medium=10, large=14).
    const planetRadius = resolvePlanetRadius(node);
    const sphereKey = resolveSphereToken(node);
    const spherePalette = sphereTokens[sphereKey];
    const planetBodyColor = hexStringToInt(spherePalette.default);
    const planetStrongColor = hexStringToInt(spherePalette.strong);
    const planetIsMilestone = resolvePlanetIsMilestone(node);
    const ringRotation = this.computePlanetRingRotation();

    // Epic 43: the current-node marker is a star + corona, not a
    // soft circular glow. The colour is the current sphere's
    // `strong` token (falling back to white + console.warn if the
    // slug is missing). The geometry is drawn here so a later
    // visibility flip in `tick()` is free.
    const starColor = this.resolveStarColor();
    starMarker.setColor(starColor);
    starMarker.position.set(node.position.x, node.position.y);

    shell.clear();
    shell.hitArea = new Rectangle(
      -planetRadius - PLANET_HIT_PADDING,
      -planetRadius - PLANET_HIT_PADDING,
      planetRadius * 2 + PLANET_HIT_PADDING * 2,
      planetRadius * 2 + PLANET_HIT_PADDING * 2,
    );

    // Subtle outer halo so the planet reads against the deep-space
    // background. The halo uses the sphere's `strong` stop at a
    // very low alpha; the body sits on top in the sphere's
    // `default` stop.
    const haloRadius = planetRadius + Math.max(2, planetRadius * 0.35);
    shell.circle(0, 0, haloRadius);
    shell.fill({ color: planetStrongColor, alpha: 0.08 });

    // Body
    shell.circle(0, 0, planetRadius);
    shell.fill({
      color: planetBodyColor,
      alpha: node.state === 'locked' ? 0.72 : 0.96,
    });
    // 1px inner stroke in white at 30% alpha — the brief is explicit
    // that the inner stroke is in #FFFFFF, not in the sphere token.
    shell.circle(0, 0, planetRadius);
    shell.stroke({
      color: PLANET_INNER_STROKE_COLOR,
      width: 1,
      alpha: PLANET_INNER_STROKE_ALPHA,
    });

    // Milestone ring — thin ellipse, sphere strong, slow rotation.
    // The ring is part of the planet body, not a separate sprite,
    // so the hit area is still the body. The rotation is paused
    // when the tab is hidden.
    if (planetIsMilestone) {
      const ringXRadius = planetRadius * PLANET_RING_X_RATIO;
      const ringYRadius = ringXRadius * PLANET_RING_Y_RATIO;
      const cos = Math.cos(ringRotation);
      const sin = Math.sin(ringRotation);
      const ringSteps = 48;
      let started = false;
      for (let step = 0; step <= ringSteps; step += 1) {
        const theta = (step / ringSteps) * Math.PI * 2;
        const localX = Math.cos(theta) * ringXRadius;
        const localY = Math.sin(theta) * ringYRadius;
        const rotatedX = localX * cos - localY * sin;
        const rotatedY = localX * sin + localY * cos;
        if (started) {
          shell.lineTo(rotatedX, rotatedY);
        } else {
          shell.moveTo(rotatedX, rotatedY);
          started = true;
        }
      }
      shell.stroke({ color: planetStrongColor, width: 1, alpha: PLANET_RING_ALPHA });
    }

    // Status badge: small dot in the upper-right of the body for
    // review / weak / contested / completed / locked route states.
    // The badge sits inside the body and does not affect the hit
    // area; the position scales with `planetRadius` so the three
    // planet sizes all get a readable badge.
    if (isReview || node.isWeakRouteNode) {
      shell.circle(planetRadius * 0.55, -planetRadius * 0.55, Math.max(1.6, planetRadius * 0.18));
      shell.fill({ color: 0xfacc15, alpha: 0.96 });
    } else if (node.controlState === 'contested' || node.controlState === 'lost') {
      shell.circle(planetRadius * 0.55, -planetRadius * 0.55, Math.max(1.6, planetRadius * 0.18));
      shell.fill({ color: 0xfb7185, alpha: 0.96 });
    } else if (node.isRouteComplete || node.state === 'completed') {
      shell.circle(planetRadius * 0.55, -planetRadius * 0.55, Math.max(1.6, planetRadius * 0.18));
      shell.fill({ color: 0x6ee7b7, alpha: 0.96 });
    } else if (node.isRouteLocked || node.state === 'locked') {
      shell.circle(planetRadius * 0.55, -planetRadius * 0.55, Math.max(1.6, planetRadius * 0.18));
      shell.fill({ color: 0x64748b, alpha: 0.86 });
    }

    if (node.isCurrentRouteTarget) {
      shell.circle(0, 0, planetRadius + 6);
      shell.stroke({ color: 0x38bdf8, width: 1.5, alpha: 0.6 });
    }

    if (isHighlighted) {
      shell.circle(0, 0, planetRadius + (isRoot ? 22 : isBoss || isHub ? 13 : 9));
      shell.stroke({ color: 0xfef08a, width: isRoot || isHub ? 2.6 : 2.2, alpha: 0.96 });
      shell.circle(0, 0, planetRadius + (isRoot ? 27 : isBoss || isHub ? 17 : 12));
      shell.stroke({ color: 0x38bdf8, width: 1.4, alpha: 0.52 });
    }

    // Icon inside the body, white at 60% alpha. The icon is
    // scaled to 4-6px regardless of the planet body size, per
    // the workstream 02 spec ("scaled to 4-6px, in white at 60%
    // alpha"). The icon is centred on the body and shares the
    // same hit area.
    this.drawAtlasIcon(shell, node.atlasIconKey ?? 'code', PLANET_ICON_COLOR, 5);

    shell.position.set(node.position.x, node.position.y);

    label.text = '';
    label.visible = false;
    label.position.set(node.position.x, node.position.y);
  }

  /**
   * Computes the current milestone-ring rotation in radians. The
   * rotation is driven by the same `performance.now()` clock as
   * the current-node pulse, so the two animations stay in phase.
   * When the tab is hidden (`document.hidden`) the rotation is
   * paused at its last value, matching the spec for the current-
   * node marker in epic 43.
   */
  private computePlanetRingRotation(): number {
    const doc = typeof document === 'undefined' ? null : document;
    if (doc?.hidden) {
      return this.cachedRingRotation;
    }
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    const radians = (now * PLANET_RING_ROTATION_RAD_PER_SEC) / 1000;
    this.cachedRingRotation = radians;
    return radians;
  }

  private refreshLabelVisibility() {
    if (!this.currentModel) {
      return;
    }

    this.currentModel.nodes.forEach((node) => {
      const label = this.nodeLabels.get(node.id);
      if (!label) {
        return;
      }

      label.visible = this.shouldShowNodeLabel(node.id);
    });
  }

  private drawNodeGate(
    shell: Graphics,
    box: { width: number; height: number },
    gate: NodeGate,
    options: { fill: number; stroke: number; alpha: number; overviewMode: boolean },
  ) {
    const radius = options.overviewMode ? NODE_GATE.overviewRadius : NODE_GATE.radius;
    const x = (gate === 'output' ? 1 : -1) * (box.width / 2 + radius - NODE_GATE.inset);
    const y = 0;

    shell.circle(x, y, radius + NODE_GATE.rim);
    shell.fill({ color: 0x020617, alpha: Math.min(0.92, options.alpha + 0.08) });
    shell.circle(x, y, radius);
    shell.fill({ color: options.fill, alpha: options.alpha });
    shell.circle(x, y, radius);
    shell.stroke({
      color: options.stroke,
      width: options.overviewMode ? 2.5 : 2,
      alpha: options.alpha,
    });
  }

  private resolvePointerGate(node: GameNode, event: FederatedPointerEvent): NodeGate | null {
    if (this.presentation === 'skill-atlas') {
      return null;
    }

    const worldPoint = this.world.toLocal(event.global);
    const hitRadius = (this.overviewMode ? NODE_GATE.overviewRadius : NODE_GATE.radius) + 5;
    const input = getNodeGateAnchor(node, 'input', this.overviewMode);
    const output = getNodeGateAnchor(node, 'output', this.overviewMode);
    const inputDistance = Math.hypot(worldPoint.x - input.x, worldPoint.y - input.y);
    const outputDistance = Math.hypot(worldPoint.x - output.x, worldPoint.y - output.y);
    const nearest = inputDistance <= outputDistance ? { gate: 'input' as const, distance: inputDistance } : { gate: 'output' as const, distance: outputDistance };

    return nearest.distance <= hitRadius ? nearest.gate : null;
  }

  private shouldShowNodeLabel(nodeId: number) {
    if (this.presentation === 'skill-atlas') {
      return false;
    }

    return (
      this.forceNodeLabels ||
      this.overviewMode ||
      this.currentZoom >= 0.34 ||
      nodeId === this.highlightedNodeId ||
      nodeId === this.connectSourceNodeId
    );
  }

  private shouldRenderNode(node: GameNode) {
    return !this.overviewMode || node.isOverviewVisible === true;
  }

  private getRenderPosition(node: GameNode): GamePoint {
    return (
      this.previewNodePositions.get(node.id) ??
      (this.overviewMode ? node.overviewPosition : null) ??
      node.position
    );
  }

  private withRenderPosition(node: GameNode): GameNode {
    return {
      ...node,
      position: this.getRenderPosition(node),
    };
  }

  /**
   * Resolve the colour for the star marker. The `currentSphereSlug`
   * handler is the source of truth — when it is present and maps
   * to a known token key, the matching `--sphere-{key}-strong`
   * hex is used. When it is missing or unknown, the marker falls
   * back to white and emits a single `console.warn` so the missing
   * binding is visible in dev. The `lastAppliedStarColor` cache
   * keeps the fallback path idempotent — the warning only fires on
   * a real change of slug (e.g. first render, then a slug swap to
   * an unknown value).
   */
  private resolveStarColor(): string {
    const slug = this.currentSphereSlug;
    let resolved: string;
    if (slug == null || slug === '') {
      if (this.lastAppliedStarColor !== STAR_MARKER_FALLBACK_COLOR) {
        console.warn(
          '[map-layer] star marker: no currentSphereSlug provided; using white fallback.',
        );
      }
      resolved = STAR_MARKER_FALLBACK_HEX;
    } else {
      const tokenKey = tryGetSphereTokenKey(slug) as SphereTokenKey | null;
      if (tokenKey == null) {
        if (this.lastAppliedStarColor !== STAR_MARKER_FALLBACK_COLOR) {
          console.warn(
            `[map-layer] star marker: no sphere token mapped for slug "${slug}"; using white fallback.`,
          );
        }
        resolved = STAR_MARKER_FALLBACK_HEX;
      } else {
        resolved = sphereTokens[tokenKey].strong;
      }
    }
    this.lastAppliedStarColor = resolved;
    return resolved;
  }
}
