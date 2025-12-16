/**
 * Fleet Graph - Type Definitions
 *
 * Graph representation types for network visualization and optimization.
 * Represents the delivery network as nodes (stops) and edges (connections).
 */

import type { Coordinates } from "./route-types";

/**
 * Node type in the delivery network graph
 */
export type NodeType = "depot" | "pickup" | "dropoff" | "delivery";

/**
 * Graph node (representing a stop in the delivery network)
 */
export interface GraphNode {
  /** Unique identifier for this node */
  id: string;
  /** Reference to the original RouteStop ID */
  stopId: string;
  /** Type of node */
  type: NodeType;
  /** Geographic coordinates */
  coordinates: Coordinates;
  /** Full address */
  address: string;
  /** Optional zone information */
  zone?: string;
  /** For VRPPD: paired node ID (pickup ↔ dropoff relationship) */
  pairedNodeId?: string;
  /** Number of packages at this stop (default: 1) */
  packageCount: number;
  /** Service time at this stop in minutes (default: 5) */
  serviceTime: number;
  /** Optional delivery notes */
  notes?: string;
}

/**
 * Edge type in the delivery network graph
 */
export type EdgeType = "available" | "assigned" | "depot-connection";

/**
 * Graph edge (representing a connection between two stops)
 */
export interface GraphEdge {
  /** Unique identifier for this edge */
  id: string;
  /** Source node ID */
  fromNodeId: string;
  /** Target node ID */
  toNodeId: string;
  /** Edge type */
  type: EdgeType;
  /** Distance in kilometers */
  distance: number;
  /** Duration in minutes */
  duration: number;
  /** Cost for optimization (can be distance, time, or weighted combination) */
  cost: number;
  /** If assigned to a route, which vehicle ID */
  vehicleId?: string;
  /** If assigned, color for visualization */
  color?: string;
  /** Sequence number in the route (for ordering) */
  sequenceNumber?: number;
}

/**
 * Complete delivery network graph
 */
export interface DeliveryGraph {
  /** All nodes in the graph */
  nodes: GraphNode[];
  /** All edges in the graph */
  edges: GraphEdge[];
  /** Reference to the depot node */
  depot: GraphNode;
  /** Distance matrix (node index → node index → distance) */
  distanceMatrix: number[][];
  /** Duration matrix (node index → node index → duration) */
  durationMatrix: number[][];
}

/**
 * Cytoscape-specific data format for visualization
 * This matches the format expected by Cytoscape.js
 */
export interface CytoscapeNodeData {
  /** Node ID */
  id: string;
  /** Display label */
  label: string;
  /** Node type for styling */
  type: NodeType;
  /** X position for geographic layout */
  x?: number;
  /** Y position for geographic layout */
  y?: number;
  /** Additional metadata */
  metadata: {
    address: string;
    coordinates: Coordinates;
    packageCount: number;
    zone?: string;
    pairedNodeId?: string;
  };
}

/**
 * Cytoscape-specific edge data format
 */
export interface CytoscapeEdgeData {
  /** Edge ID */
  id: string;
  /** Source node ID */
  source: string;
  /** Target node ID */
  target: string;
  /** Edge type for styling */
  type: EdgeType;
  /** Display label (distance) */
  label?: string;
  /** Line color if assigned to vehicle */
  color?: string;
  /** Additional metadata */
  metadata: {
    distance: number;
    duration: number;
    vehicleId?: string;
    sequenceNumber?: number;
  };
}

/**
 * Cytoscape element (node or edge)
 */
export interface CytoscapeElement {
  /** Element group */
  group: "nodes" | "edges";
  /** Element data */
  data: CytoscapeNodeData | CytoscapeEdgeData;
  /** CSS classes for styling */
  classes?: string;
}
