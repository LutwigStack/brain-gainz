import type { GraphEdgeType } from '../types/app-shell';

export type GraphEdgeDirection = 'incoming' | 'outgoing';
export type GraphEdgeReading = 'directed' | 'associative';
export type GraphEdgeCanvasPattern = 'solid' | 'glow' | 'dotted';

export interface GraphEdgeSemantics {
  type: GraphEdgeType;
  label: string;
  outgoingCopy: string;
  incomingCopy: string;
  arrowMeaning: string;
  userReading: GraphEdgeReading;
  railSummary: string;
  canvas: {
    color: number;
    alpha: number;
    selectedAlpha: number;
    width: number;
    selectedWidth: number;
    bendStrength: number;
    pattern: GraphEdgeCanvasPattern;
  };
}

export const graphEdgeTypeOrder: GraphEdgeType[] = ['requires', 'supports', 'relates_to'];

const semanticsByType: Record<GraphEdgeType, GraphEdgeSemantics> = {
  requires: {
    type: 'requires',
    label: 'Требует',
    outgoingCopy: 'Этот узел зависит от цели',
    incomingCopy: 'Этот узел нужен источнику',
    arrowMeaning: 'Стрелка идёт к тому, без кого нельзя продвинуться дальше.',
    userReading: 'directed',
    railSummary: 'Строгая зависимость: без цели источник стопорится.',
    canvas: {
      color: 0x94a3b8,
      alpha: 0.34,
      selectedAlpha: 0.9,
      width: 2,
      selectedWidth: 4,
      bendStrength: 0.08,
      pattern: 'solid',
    },
  },
  supports: {
    type: 'supports',
    label: 'Поддерживает',
    outgoingCopy: 'Этот узел усиливает цель',
    incomingCopy: 'Поддерживает этот узел',
    arrowMeaning: 'Стрелка идёт к тому, что источник ускоряет или делает устойчивее.',
    userReading: 'directed',
    railSummary: 'Мягкая опора: источник помогает цели, но не блокирует её жёстко.',
    canvas: {
      color: 0x5eead4,
      alpha: 0.5,
      selectedAlpha: 0.96,
      width: 2.75,
      selectedWidth: 4.5,
      bendStrength: 0.07,
      pattern: 'glow',
    },
  },
  relates_to: {
    type: 'relates_to',
    label: 'Связано',
    outgoingCopy: 'Этот узел связан с целью',
    incomingCopy: 'Связан с этим узлом',
    arrowMeaning: 'Стрелка лишь показывает сохранённое направление записи; связь читается как ассоциативная.',
    userReading: 'associative',
    railSummary: 'Контекстная связь: полезно держать рядом, но это не зависимость и не опора.',
    canvas: {
      color: 0xfbbf24,
      alpha: 0.42,
      selectedAlpha: 0.92,
      width: 2.25,
      selectedWidth: 4,
      bendStrength: 0.05,
      pattern: 'dotted',
    },
  },
};

export const getGraphEdgeSemantics = (type: GraphEdgeType): GraphEdgeSemantics =>
  semanticsByType[type];

export const getGraphEdgeDirectionalCopy = (
  type: GraphEdgeType,
  direction: GraphEdgeDirection,
) => getGraphEdgeSemantics(type)[direction === 'outgoing' ? 'outgoingCopy' : 'incomingCopy'];

export const getGraphEdgeLineTitle = (
  type: GraphEdgeType,
  direction: GraphEdgeDirection,
  otherNodeTitle: string,
) =>
  direction === 'outgoing'
    ? `${getGraphEdgeSemantics(type).label} → ${otherNodeTitle}`
    : `${otherNodeTitle} → ${getGraphEdgeSemantics(type).label}`;
