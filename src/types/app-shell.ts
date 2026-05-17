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

export interface CampaignSummary {
  id: number;
  type: 'developer_main' | 'user' | 'template';
  slug: string;
  name: string;
  mode?: 'career' | 'free' | null;
  career_status?: 'active' | 'victory' | null;
  current_specialization_id?: number | null;
  icon?: string | null;
  color?: string | null;
  is_archived: number;
  last_opened_at?: string | null;
  structure_count?: number;
  node_count?: number;
  total_xp?: number;
}

export interface CampaignListSnapshot {
  active: CampaignSummary[];
  archived: CampaignSummary[];
  lastOpened: CampaignSummary | null;
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
  node_id?: number | null;
  action_id?: number | null;
  note?: string | null;
  occurred_at?: string | null;
}

export type DailyRunState = 'not_started' | 'active' | 'completed' | 'abandoned';
export type DailyRunTaskOutcome = 'pending' | 'completed' | 'failed' | 'skipped' | 'deferred';

export interface DailyRunTask {
  id: number;
  order: number;
  source: 'route_front' | 'route_next' | 'weak_spot' | 'recovery_retry' | 'due_check' | 'ready_check' | 'recommendation';
  sourceLabel: string;
  title: string;
  subtitle: string;
  nodeId: number;
  actionId: number | null;
  outcome: DailyRunTaskOutcome;
  outcomeNote?: string | null;
}

export interface DailySession {
  id: number;
  session_date: string;
  status: string;
  state?: DailyRunState;
  primary_node_id?: number | null;
  primary_action_id?: number | null;
  summary_note?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  events: DailySessionEvent[];
  tasks?: DailyRunTask[];
  summary?: {
    lines: string[];
    completedCount: number;
    failedCount: number;
    skippedCount: number;
    deferredCount: number;
  };
}

export type MasteryLevel = 'seen' | 'understood' | 'remembered' | 'applied' | 'confirmed' | 'retained';
export type SpecializationStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface CareerSpecialization {
  id: number;
  campaign_id: number;
  name: string;
  key: string;
  domain?: string | null;
  length: string;
  status: SpecializationStatus;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  route_node_count?: number;
  required_node_count?: number;
}

export interface CareerSnapshot {
  campaign: {
    id: number;
    name?: string | null;
    icon?: string | null;
    color?: string | null;
    mode: string;
    career_status: 'active' | 'victory';
    current_specialization_id?: number | null;
  };
  currentSpecialization: CareerSpecialization | null;
  specializations: CareerSpecialization[];
  mastery: {
    activeNodeCount: number;
    confirmedOrBetterNodeCount: number;
    verifiedNodeCount: number;
    selfMarkedOnlyNodeCount: number;
  };
}

export interface RouteProgressItem {
  id: number;
  node_id?: number | null;
  knowledge_node_id?: number | null;
  title: string;
  path: string;
  required_mastery_level: MasteryLevel;
  route_order: number;
  route_stage?: string | null;
  current_mastery_level?: MasteryLevel | null;
  current_mastery_rank: number;
  self_marked_mastery_rank?: number;
  has_verified_mastery?: number;
  weak_spot_reason?: string | null;
  weak_spot_reason_label?: string | null;
  weak_spot_sources?: string[];
  latest_failed_assessment_at?: string | null;
  latest_passed_assessment_at?: string | null;
  latest_failed_run_at?: string | null;
  latest_completed_run_at?: string | null;
  review_current_risk?: string | null;
  review_next_due_at?: string | null;
  last_touched_at?: string | null;
  is_required: number;
  is_complete: boolean;
  is_actionable?: boolean;
}

export interface TodaySnapshot {
  currentSpecialization: CareerSpecialization | null;
  careerStatus: 'active' | 'victory';
  mastery: CareerSnapshot['mastery'];
  state: {
    key:
      | 'truly_empty'
      | 'content_without_day_plan'
      | 'free_mode'
      | 'no_route'
      | 'active_route'
      | 'route_incomplete'
      | 'completed_route';
    label: string;
    title: string;
    reason: string;
    primaryCta: {
      action:
        | 'create_starter'
        | 'open_recommendation_map'
        | 'open_route_map'
        | 'open_route_node'
        | 'complete_route'
        | 'continue_route';
      label: string;
    };
    content: {
      hasContent: boolean;
      nodeCount: number;
      openActionCount: number;
      totalXp: number;
      verifiedNodeCount: number;
      selfMarkedOnlyNodeCount: number;
      routeNodeCount: number;
    };
  };
  race: {
    key: string;
    title: string;
    emblem: string;
    color: string;
  };
  route: {
    routeNodeCount: number;
    requiredNodeCount: number;
    completedRequiredNodeCount: number;
    completionPercent: number;
    isComplete: boolean;
    items: RouteProgressItem[];
    nextItem: RouteProgressItem | null;
  } | null;
  planner: {
    focusItem: RouteProgressItem | null;
    currentStage?: string | null;
    currentStageItems: RouteProgressItem[];
    nextItems: RouteProgressItem[];
    weakSpots: RouteProgressItem[];
    readyToVerify: RouteProgressItem[];
    hasRouteItems: boolean;
  } | null;
  city: {
    level: number;
    totalXp: number;
    districts: Array<{
      id: number;
      title: string;
      emblem: string;
      color: string;
      xp: number;
      level: number;
      stability: number;
    }>;
  };
  activity?: {
    streakDays: number;
    lastSessionDate?: string | null;
    activeSessionDayCount: number;
  };
  opponent: {
    specialization_id: number;
    daysElapsed: number;
    projectedRequired: number;
    pressure: number;
    score: number;
  } | null;
}

export interface NowDashboardSnapshot {
  metrics: DashboardMetrics;
  primaryRecommendation: RecommendationCandidate | null;
  queue: RecommendationCandidate[];
  todaySession: DailySession | null;
  today?: TodaySnapshot;
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
  check_metadata?: string | null;
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
  knowledge_node_id?: number | null;
  self_marked_mastery_level?: string | null;
  check_metadata?: string | null;
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
  knowledge_node_id?: number | null;
  self_marked_mastery_level?: string | null;
  check_metadata?: string | null;
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
  knowledge_node_id?: number | null;
  self_marked_mastery_level?: string | null;
  check_metadata?: string | null;
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
  knowledge_node_id?: number | null;
  self_marked_mastery_level?: string | null;
  check_metadata?: string | null;
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
  xpWarning?: XpWarning | null;
}

export interface XpWarning {
  code: 'missing-primary-stat';
  message: string;
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

export interface NodeFocusMasteryEvent {
  id: number;
  mastery_level: MasteryLevel;
  source_type: 'legacy_node_completion' | 'assessment' | 'self_marked' | 'manual';
  created_at: string;
  active: number;
}

export interface NodeFocusAssessmentAttempt {
  id: number;
  task_id: string;
  check_method: 'strict' | 'llm_assisted';
  passed: number;
  score?: number | null;
  target_mastery_level: MasteryLevel;
  feedback_summary?: string | null;
  evidence_payload?: string | null;
  created_at: string;
}

export interface NodeFocusMastery {
  currentLevel: MasteryLevel | null;
  currentRank: number;
  isVerified: boolean;
  isSelfMarkedOnly: boolean;
  eventCount: number;
  latestEvent: NodeFocusMasteryEvent | null;
  latestAttempt: NodeFocusAssessmentAttempt | null;
  routeRequirement: {
    specialization_id: number;
    specialization_name: string;
    required_mastery_level: MasteryLevel;
    is_required: number;
  } | null;
  check: {
    taskId: string;
    checkMethod?: 'strict' | 'llm_assisted' | null;
    strictCheckType: string | null;
    isStrictCheckable: boolean;
    isAutoStrictCheck?: boolean;
    prompt?: string | null;
    expectedSummary?: string | null;
    requiredTerms?: string[];
    checklistItems?: Array<{
      id: string;
      label: string;
      required: boolean;
    }>;
  };
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
  mastery?: NodeFocusMastery;
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

export interface ArchivedNavigationNodeSummary extends NavigationNodeSummary {
  sphere_id: number;
  sphere_name: string;
  direction_id: number;
  direction_name: string;
  skill_name: string;
  updated_at?: string;
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
  primary_stat_id?: number | null;
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
  archivedNodes: ArchivedNavigationNodeSummary[];
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
