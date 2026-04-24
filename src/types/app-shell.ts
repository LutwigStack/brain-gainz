export type BarrierType =
  | 'too complex'
  | 'unclear next step'
  | 'low energy'
  | 'aversive / scary to start'
  | 'wrong time / wrong context';

export type OutcomeAction = 'defer' | 'block' | 'shrink';
export type GraphEdgeType = 'requires' | 'supports' | 'relates_to';

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
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
  updated_at?: string;
  sphere_id: number;
  sphere_name: string;
  direction_id: number;
  direction_name: string;
  skill_id: number;
  skill_name: string;
}

export interface PersistedNodeRecord {
  id: number;
  skill_id: number;
  type: string;
  status: string;
  title: string;
  slug: string;
  summary?: string | null;
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
  importance: string;
  target_date?: string | null;
  last_touched_at?: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface NodeCreatePayload {
  skill_id: number;
  type: string;
  title: string;
  slug: string;
  summary?: string;
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
  importance?: string;
  status?: string;
  target_date?: string | null;
  last_touched_at?: string | null;
}

export interface NodeUpdatePayload {
  type?: string;
  status?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
  importance?: string;
  target_date?: string | null;
  last_touched_at?: string | null;
  is_archived?: number;
}

export interface NodeDuplicatePayload {
  skill_id?: number;
  title?: string;
  slug?: string;
  summary?: string | null;
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
}

export interface NodeArchivePayload {
  title?: string;
  summary?: string | null;
  completion_criteria?: string | null;
  links?: string | null;
  reward?: string | null;
  x?: number | null;
  y?: number | null;
  type?: string;
}

export interface NodeLayoutPositionInput {
  nodeId: number;
  x: number;
  y: number;
}

export interface PersistedGraphEdgeRecord {
  id: number;
  blocked_node_id: number;
  blocking_node_id: number;
  dependency_type: GraphEdgeType;
  created_at: string;
}

export interface GraphEdgeCreatePayload {
  blocked_node_id: number;
  blocking_node_id: number;
  dependency_type?: GraphEdgeType;
  created_at?: string;
}

export interface GraphEdgeUpdatePayload {
  blocked_node_id?: number;
  blocking_node_id?: number;
  dependency_type?: GraphEdgeType;
}

export interface NodeEditorMutationResult {
  node: PersistedNodeRecord;
  focus: NodeFocusSnapshot | null;
  dashboard: NowDashboardSnapshot;
  navigation: NavigationSnapshot;
  selection: RecommendationSelection | null;
}

export interface NodeDependencySummary {
  id: number;
  title: string;
  status: string;
  dependency_type?: GraphEdgeType;
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
  x?: number | null;
  y?: number | null;
  open_action_count: number;
  next_action_id?: number | null;
  next_action_title?: string | null;
}

export interface NavigationGraphEdge {
  id: number;
  source_node_id: number;
  target_node_id: number;
  edge_type: GraphEdgeType;
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
  edges: NavigationGraphEdge[];
  defaultSelection: RecommendationSelection | null;
}

export interface GraphEdgeMutationResult {
  edge: PersistedGraphEdgeRecord | null;
  navigation: NavigationSnapshot;
  focus: NodeFocusSnapshot | null;
  selection: RecommendationSelection | null;
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
