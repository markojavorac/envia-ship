/**
 * Graph Builder
 *
 * Converts RouteStops into graph representation for optimization and visualization.
 */

import type { RouteStop } from "../route-types";
import type {
  DeliveryGraph,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
  CytoscapeElement,
  CytoscapeNodeData,
  CytoscapeEdgeData,
} from "../fleet-graph-types";
import type { VehicleRoute } from "../fleet-types";

/**
 * Build a complete delivery network graph from stops and depot
 *
 * @param stops - All delivery stops
 * @param depot - Starting point for all vehicles
 * @param distanceMatrix - Pre-computed distance matrix (optional, can be empty)
 * @param durationMatrix - Pre-computed duration matrix (optional, can be empty)
 * @returns Complete graph representation
 */
export function buildDeliveryGraph(
  stops: RouteStop[],
  depot: RouteStop,
  distanceMatrix: number[][] = [],
  durationMatrix: number[][] = []
): DeliveryGraph {
  // Create depot node
  const depotNode: GraphNode = {
    id: `node-${depot.id}`,
    stopId: depot.id,
    type: "depot",
    coordinates: depot.coordinates,
    address: depot.address,
    zone: depot.zone,
    packageCount: 0, // Depot has no packages
    serviceTime: 0, // No service time at depot
    notes: depot.notes,
  };

  // Create nodes for all stops
  const nodes: GraphNode[] = [depotNode, ...stops.map((stop) => createGraphNode(stop))];

  // Create edges for all connections
  const edges: GraphEdge[] = [];
  const allNodes = [depot, ...stops];

  for (let i = 0; i < allNodes.length; i++) {
    for (let j = i + 1; j < allNodes.length; j++) {
      const distance = distanceMatrix[i]?.[j] ?? 0;
      const duration = durationMatrix[i]?.[j] ?? 0;

      // Create bidirectional edges
      edges.push(
        createGraphEdge(
          `node-${allNodes[i].id}`,
          `node-${allNodes[j].id}`,
          "available",
          distance,
          duration
        )
      );
      edges.push(
        createGraphEdge(
          `node-${allNodes[j].id}`,
          `node-${allNodes[i].id}`,
          "available",
          distance,
          duration
        )
      );
    }
  }

  return {
    nodes,
    edges,
    depot: depotNode,
    distanceMatrix,
    durationMatrix,
  };
}

/**
 * Create a graph node from a RouteStop
 */
function createGraphNode(stop: RouteStop): GraphNode {
  // Determine node type
  let type: NodeType = "delivery";
  if (stop.stopType === "pickup") {
    type = "pickup";
  } else if (stop.stopType === "dropoff") {
    type = "dropoff";
  }

  return {
    id: `node-${stop.id}`,
    stopId: stop.id,
    type,
    coordinates: stop.coordinates,
    address: stop.address,
    zone: stop.zone,
    pairedNodeId: stop.pairedStopId ? `node-${stop.pairedStopId}` : undefined,
    packageCount: stop.packageCount ?? 1, // Default to 1 package
    serviceTime: stop.serviceTime ?? 5, // Default to 5 minutes
    notes: stop.notes,
  };
}

/**
 * Create a graph edge between two nodes
 */
function createGraphEdge(
  fromNodeId: string,
  toNodeId: string,
  type: EdgeType,
  distance: number,
  duration: number
): GraphEdge {
  return {
    id: `edge-${fromNodeId}-${toNodeId}`,
    fromNodeId,
    toNodeId,
    type,
    distance,
    duration,
    cost: distance, // Default cost is distance (can be customized)
  };
}

/**
 * Update graph with assigned routes (colors edges based on vehicle assignments)
 *
 * @param graph - Original graph
 * @param routes - Vehicle routes from optimization
 * @returns Updated graph with assigned edges
 */
export function updateGraphWithRoutes(graph: DeliveryGraph, routes: VehicleRoute[]): DeliveryGraph {
  // Clone edges
  const updatedEdges = graph.edges.map((edge) => ({ ...edge }));

  // Mark edges as assigned based on routes
  for (const route of routes) {
    if (route.isEmpty) continue;

    for (let i = 0; i < route.stops.length - 1; i++) {
      const fromStopId = route.stops[i].id;
      const toStopId = route.stops[i + 1].id;
      const fromNodeId = `node-${fromStopId}`;
      const toNodeId = `node-${toStopId}`;

      // Find the edge and mark as assigned
      const edge = updatedEdges.find((e) => e.fromNodeId === fromNodeId && e.toNodeId === toNodeId);

      if (edge) {
        edge.type = "assigned";
        edge.vehicleId = route.vehicleId;
        edge.color = route.vehicleColor;
        edge.sequenceNumber = i + 1;
      }
    }
  }

  return {
    ...graph,
    edges: updatedEdges,
  };
}

/**
 * Convert DeliveryGraph to Cytoscape elements for visualization
 *
 * @param graph - Delivery graph
 * @returns Array of Cytoscape elements (nodes + edges)
 */
export function graphToCytoscapeElements(graph: DeliveryGraph): CytoscapeElement[] {
  const elements: CytoscapeElement[] = [];

  // Convert nodes
  for (const node of graph.nodes) {
    const nodeData: CytoscapeNodeData = {
      id: node.id,
      label: node.type === "depot" ? "Depot" : `${node.packageCount}pkg`,
      type: node.type,
      metadata: {
        address: node.address,
        coordinates: node.coordinates,
        packageCount: node.packageCount,
        zone: node.zone,
        pairedNodeId: node.pairedNodeId,
      },
    };

    elements.push({
      group: "nodes",
      data: nodeData,
      classes: node.type,
    });
  }

  // Convert edges (only assigned edges for cleaner visualization)
  for (const edge of graph.edges) {
    if (edge.type !== "assigned") continue; // Skip unassigned edges

    const edgeData: CytoscapeEdgeData = {
      id: edge.id,
      source: edge.fromNodeId,
      target: edge.toNodeId,
      type: edge.type,
      label: `${edge.distance.toFixed(1)}km`,
      color: edge.color,
      metadata: {
        distance: edge.distance,
        duration: edge.duration,
        vehicleId: edge.vehicleId,
        sequenceNumber: edge.sequenceNumber,
      },
    };

    elements.push({
      group: "edges",
      data: edgeData,
      classes: `${edge.type} ${edge.vehicleId ? `vehicle-${edge.vehicleId}` : ""}`,
    });
  }

  return elements;
}

/**
 * Calculate geographic bounds of all nodes
 * Useful for centering and fitting the graph view
 */
export function calculateGraphBounds(graph: DeliveryGraph): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  centerLat: number;
  centerLng: number;
} {
  if (graph.nodes.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0,
      centerLat: 0,
      centerLng: 0,
    };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const node of graph.nodes) {
    minLat = Math.min(minLat, node.coordinates.lat);
    maxLat = Math.max(maxLat, node.coordinates.lat);
    minLng = Math.min(minLng, node.coordinates.lng);
    maxLng = Math.max(maxLng, node.coordinates.lng);
  }

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    centerLat: (minLat + maxLat) / 2,
    centerLng: (minLng + maxLng) / 2,
  };
}
