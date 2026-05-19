import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

// Estimated rendered dimensions per node type (width × height in px)
const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  agent: { width: 336, height: 294 },
  tool: { width: 264, height: 132 },
  memory: { width: 224, height: 116 },
  // trace-flow node types
  input: { width: 360, height: 260 },
  output: { width: 360, height: 280 },
};

const DEFAULT_DIMS = { width: 220, height: 120 };

export interface DagreOptions {
  /** Layout direction: left-to-right (default) or top-to-bottom */
  direction?: "LR" | "TB";
  /**
   * Gap between layout ranks (horizontal spacing in LR mode).
   * Increase for more "breathing room" between node columns.
   */
  rankSep?: number;
  /**
   * Gap between nodes on the same rank (vertical spacing in LR mode).
   */
  nodeSep?: number;
  marginX?: number;
  marginY?: number;
}

/**
 * Applies a Dagre auto-layout to a set of ReactFlow nodes and edges.
 * Returns a new array of nodes with updated `position` values.
 * Edges are unchanged — call this before passing nodes to ReactFlow.
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: DagreOptions = {},
): Node[] {
  const {
    direction = "LR",
    rankSep = 240,
    nodeSep = 80,
    marginX = 60,
    marginY = 60,
  } = options;

  if (nodes.length === 0) return nodes;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: marginX,
    marginy: marginY,
    acyclicer: "greedy",
    ranker: "network-simplex",
  });

  // Register every node with its expected dimensions
  nodes.forEach((node) => {
    const dims = NODE_DIMENSIONS[node.type ?? ""] ?? DEFAULT_DIMS;
    g.setNode(node.id, { width: dims.width, height: dims.height });
  });

  // Register edges (only between nodes that exist in the graph)
  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Dagre returns center-anchored coordinates; ReactFlow uses top-left
  return nodes.map((node) => {
    const pos = g.node(node.id);
    const dims = NODE_DIMENSIONS[node.type ?? ""] ?? DEFAULT_DIMS;
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: pos.x - dims.width / 2,
        y: pos.y - dims.height / 2,
      },
    };
  });
}
