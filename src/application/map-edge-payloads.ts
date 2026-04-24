import type { GraphEdgeCreatePayload, GraphEdgeType } from '../types/app-shell';

interface BuildGraphEdgeCreatePayloadInput {
  sourceNodeId: number;
  targetNodeId: number;
  edgeType: GraphEdgeType;
  createdAt?: string;
}

export const buildGraphEdgeCreatePayload = ({
  sourceNodeId,
  targetNodeId,
  edgeType,
  createdAt = new Date().toISOString(),
}: BuildGraphEdgeCreatePayloadInput): GraphEdgeCreatePayload => ({
  blocked_node_id: sourceNodeId,
  blocking_node_id: targetNodeId,
  dependency_type: edgeType,
  created_at: createdAt,
});
