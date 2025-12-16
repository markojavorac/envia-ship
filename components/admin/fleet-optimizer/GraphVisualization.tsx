"use client";

/**
 * Graph Visualization Component
 *
 * Interactive network graph visualization using Cytoscape.js.
 * Displays delivery network as nodes (depot, pickup, dropoff, delivery)
 * and edges (routes with vehicle assignments).
 */

import { useEffect, useRef, useState } from "react";
import cytoscape, { type Core, type ElementDefinition } from "cytoscape";
import type { DeliveryGraph } from "@/lib/admin/fleet-graph-types";
import { graphToCytoscapeElements } from "@/lib/admin/fleet-optimizer/graph-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface GraphVisualizationProps {
  graph: DeliveryGraph;
  height?: number;
}

export function GraphVisualization({ graph, height = 600 }: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert graph to Cytoscape elements
    const elements: ElementDefinition[] = graphToCytoscapeElements(graph).map((el) => ({
      data: el.data,
      classes: el.classes,
    }));

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: getCytoscapeStyles(),
      layout: {
        name: "cose", // Force-directed layout
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 100,
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.2,
    });

    // Add click handlers
    cy.on("tap", "node", (evt) => {
      const node = evt.target;
      setSelectedNode(node.id());
      console.log("Node clicked:", node.data());
    });

    cy.on("tap", "edge", (evt) => {
      const edge = evt.target;
      console.log("Edge clicked:", edge.data());
    });

    // Fit view to content
    cy.fit(undefined, 50);

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graph]);

  const handleZoomIn = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
    cyRef.current?.center();
  };

  const handleZoomOut = () => {
    cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
    cyRef.current?.center();
  };

  const handleResetView = () => {
    cyRef.current?.fit(undefined, 50);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">
            Network Graph
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Interactive network visualization • Click nodes for details
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={containerRef}
          style={{ width: "100%", height: `${height}px` }}
          className="rounded-lg border border-border bg-background"
        />
      </CardContent>
    </Card>
  );
}

/**
 * Cytoscape stylesheet configuration
 */
function getCytoscapeStyles(): cytoscape.Stylesheet[] {
  return [
    // Node styles
    {
      selector: "node",
      style: {
        "background-color": "#94a3b8", // Default gray
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "font-size": "12px",
        "font-weight": "bold",
        color: "#ffffff",
        "text-outline-color": "#1e293b",
        "text-outline-width": 2,
        width: 40,
        height: 40,
      },
    },

    // Depot node
    {
      selector: "node.depot",
      style: {
        "background-color": "#FF8C00", // Orange (primary brand)
        width: 60,
        height: 60,
        "border-width": 3,
        "border-color": "#ffffff",
      },
    },

    // Pickup node
    {
      selector: "node.pickup",
      style: {
        "background-color": "#3B82F6", // Blue
        width: 45,
        height: 45,
      },
    },

    // Dropoff node
    {
      selector: "node.dropoff",
      style: {
        "background-color": "#10B981", // Green
        width: 45,
        height: 45,
      },
    },

    // Delivery node
    {
      selector: "node.delivery",
      style: {
        "background-color": "#64748b", // Slate gray
        width: 40,
        height: 40,
      },
    },

    // Edge styles
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#cbd5e1",
        "target-arrow-color": "#cbd5e1",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },

    // Assigned edges (with vehicle color)
    {
      selector: "edge.assigned",
      style: {
        width: 4,
        "line-color": "data(color)",
        "target-arrow-color": "data(color)",
        label: "data(label)",
        "font-size": "10px",
        "text-background-color": "#ffffff",
        "text-background-opacity": 0.8,
        "text-background-padding": "3px",
        "text-border-color": "#e2e8f0",
        "text-border-width": 1,
        "text-border-opacity": 1,
      },
    },

    // Available edges (not assigned)
    {
      selector: "edge.available",
      style: {
        width: 1,
        "line-color": "#e2e8f0",
        "line-style": "dashed",
        opacity: 0.3,
      },
    },

    // Hover states
    {
      selector: "node:active",
      style: {
        "overlay-color": "#1e293b",
        "overlay-padding": 10,
        "overlay-opacity": 0.3,
      },
    },

    {
      selector: "edge:active",
      style: {
        width: 6,
        "overlay-color": "#1e293b",
        "overlay-padding": 4,
        "overlay-opacity": 0.3,
      },
    },
  ];
}
