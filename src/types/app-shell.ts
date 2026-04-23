export type BarrierType =
  | 'too complex'
  | 'unclear next step'
  | 'low energy'
  | 'aversive / scary to start'
  | 'wrong time / wrong context';

export type OutcomeAction = 'defer' | 'block' | 'shrink';

export interface DatabaseMutationResult {
  lastInsertId?: number;
  rowsAffected?: number;
}

export interface Subject {
  id: number;
  name: string;
  icon: string;
}

export interface LegacyCard {
  id: number;
  subject_id: number;
  word: string;
  transcription?: string | null;
  translation?: string | null;
  definition?: string | null;
  example?: string | null;
  category?: string | null;
}

export interface LegacyCardDraft {
  subject_id: number;
  word: string;
  transcription?: string;
  translation?: string;
  definition?: string;
  example?: string;
  category?: string;
}

export interface RecommendationSelection {
  nodeId: number;
  actionId: number | null;
}

export interface RecommendationCandidate extends RecommendationSelection {
  actionTitle: string;
  sphereName: string;
  directionName: string;
  skillName: string;
  nodeTitle: string;
  whyNow: string[];
  whatDegrades: string;
}

export interface DashboardMetrics {
  spheres: number;
  directions: number;
  skills: number;
  nodes: number;
  actions: number;
  dueReviews: number;
}

export interface DailySessionEvent {
  id: number;
  event_type: string;
  note?: string | null;
}

export interface DailySession {
  id: number;
  session_date: string;
  status: string;
  primary_node_id?: number | null;
  primary_action_id?: number | null;
  events: DailySessionEvent[];
}

export interface NowDashboardSnapshot {
  metrics: DashboardMetrics;
  primaryRecommendation: RecommendationCandidate | null;
  queue: RecommendationCandidate[];
  todaySession: DailySession | null;
}

export interface NodeAction {
  id: number;
  node_id: number;
  title: string;
  details?: string | null;
  status: string;
}

export interface NodeSummary {
  id: number;
  title: string;
  type: string;
  status: string;
  summary?: string | null;
  sphere_id: number;
  sphere_name: string;
  direction_id: number;
  direction_name: string;
  skill_id: number;
  skill_name: string;
}

export interface NodeDependencySummary {
  id: number;
  title: string;
  status: string;
}

export interface ReviewState {
  current_risk?: string | null;
  next_due_at?: string | null;
}

export interface BarrierNote {
  id: number;
  barrier_type: BarrierType;
  note?: string | null;
}

export interface ErrorNote {
  id: number;
  note_kind: string;
  note?: string | null;
}

export interface NodeFocusProgress {
  totalActions: number;
  completedActions: number;
  openActions: number;
  completionPercent: number;
  isCurrentSessionNode: boolean;
}

export interface NodeFocusSnapshot {
  node: NodeSummary;
  selectedAction: NodeAction | null;
  actions: NodeAction[];
  dependencies: NodeDependencySummary[];
  dependents: NodeDependencySummary[];
  reviewState?: ReviewState | null;
  session: DailySession | null;
  progress: NodeFocusProgress;
  barrierNotes?: BarrierNote[];
  errorNotes?: ErrorNote[];
}

export interface NavigationNodeSummary {
  id: number;
  skill_id: number;
  title: string;
  type: string;
  status: string;
  open_action_count: number;
  next_action_id?: number | null;
  next_action_title?: string | null;
}

export interface NavigationSkill {
  id: number;
  direction_id: number;
  name: string;
  node_count: number;
  open_action_count: number;
  nodes: NavigationNodeSummary[];
}

export interface NavigationDirection {
  id: number;
  sphere_id: number;
  name: string;
  node_count: number;
  open_action_count: number;
  skills: NavigationSkill[];
}

export interface NavigationSphere {
  id: number;
  name: string;
  node_count: number;
  open_action_count: number;
  directions: NavigationDirection[];
}

export interface NavigationSnapshot {
  spheres: NavigationSphere[];
  defaultSelection: RecommendationSelection | null;
}

export interface JournalBarrierSummaryEntry {
  barrierType: BarrierType;
  count: number;
}

export interface JournalHotspotEntry {
  nodeId: number;
  nodeTitle: string;
  incidentCount: number;
  blockedCount: number;
  shrunkCount: number;
  deferredCount: number;
}

export interface JournalEntry {
  id: number;
  nodeId: number;
  nodeTitle: string;
  eventType: string;
  note?: string | null;
  actionTitle?: string | null;
  barrierType?: BarrierType | null;
}

export interface JournalSnapshot {
  barrierSummary: JournalBarrierSummaryEntry[];
  barrierEntries: JournalEntry[];
  adjustmentEntries: JournalEntry[];
  hotspots: JournalHotspotEntry[];
}

export interface JournalFollowUpPayload {
  nodeId: number;
  title?: string;
  note?: string;
  barrierType?: BarrierType | null;
}
