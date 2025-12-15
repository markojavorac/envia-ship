"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { OptimizedRoute } from "@/lib/admin/route-types";
import type { MockScenario } from "@/lib/admin/route-optimizer/mock-scenarios";
import { formatDistance, formatTime, formatCurrency } from "@/lib/admin/route-optimizer/route-comparison-utils";

interface RouteComparisonMapProps {
  scenario: MockScenario;
  optimizedRoute: OptimizedRoute;
  isLoading?: boolean;
}

/**
 * RouteComparisonMap Component
 *
 * Side-by-side map view showing BEFORE (red) vs. AFTER (green) routes
 */
export function RouteComparisonMap({ scenario, optimizedRoute, isLoading }: RouteComparisonMapProps) {
  const beforeMapContainer = useRef<HTMLDivElement>(null);
  const afterMapContainer = useRef<HTMLDivElement>(null);
  const beforeMapRef = useRef<maplibregl.Map | null>(null);
  const afterMapRef = useRef<maplibregl.Map | null>(null);
  const [mapsReady, setMapsReady] = useState(false);

  // Initialize maps
  useEffect(() => {
    if (!beforeMapContainer.current || !afterMapContainer.current) return;

    // Calculate bounds for all stops
    const bounds = new maplibregl.LngLatBounds();
    scenario.stops.forEach((stop) => {
      bounds.extend([stop.coordinates.lng, stop.coordinates.lat]);
    });

    // Map style (CartoDB Dark Matter - clean, dark)
    const mapStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

    // Initialize BEFORE map (Original route - Red)
    const beforeMap = new maplibregl.Map({
      container: beforeMapContainer.current,
      style: mapStyle,
      bounds: bounds,
      fitBoundsOptions: { padding: 50 },
    });

    // Initialize AFTER map (Optimized route - Green)
    const afterMap = new maplibregl.Map({
      container: afterMapContainer.current,
      style: mapStyle,
      bounds: bounds,
      fitBoundsOptions: { padding: 50 },
    });

    beforeMapRef.current = beforeMap;
    afterMapRef.current = afterMap;

    // Wait for both maps to load
    Promise.all([
      new Promise((resolve) => beforeMap.on("load", resolve)),
      new Promise((resolve) => afterMap.on("load", resolve)),
    ]).then(() => {
      setMapsReady(true);
    });

    // Cleanup
    return () => {
      beforeMap.remove();
      afterMap.remove();
    };
  }, []);

  // Draw routes when maps are ready
  useEffect(() => {
    if (!mapsReady || !beforeMapRef.current || !afterMapRef.current) return;

    drawOriginalRoute(beforeMapRef.current, scenario.stops);
    drawOptimizedRoute(afterMapRef.current, optimizedRoute.optimizedStops);
  }, [mapsReady, scenario, optimizedRoute]);

  return (
    <AdminCard className="py-0">
      <AdminCardContent className="p-0">
        <div className="grid gap-0 md:grid-cols-2">
          {/* BEFORE (Original) */}
          <div className="border-border flex flex-col md:border-r">
            {/* Header */}
            <div className="border-border bg-muted/30 border-b p-4">
              <h3 className="text-foreground mb-1 text-lg font-bold">BEFORE (Original)</h3>
              <p className="text-muted-foreground text-sm">Entered sequence - inefficient</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-foreground font-semibold">
                  {formatDistance(optimizedRoute.originalDistance)}
                </span>
                <span className="text-foreground font-semibold">
                  {formatTime(optimizedRoute.originalTime)}
                </span>
              </div>
            </div>

            {/* Map */}
            <div
              ref={beforeMapContainer}
              className="h-[300px] w-full md:h-[400px]"
              // eslint-disable-next-line custom/no-inline-styles
              style={{ minHeight: "300px" }}
            />
          </div>

          {/* AFTER (Optimized) */}
          <div className="flex flex-col">
            {/* Header */}
            <div className="border-border bg-green-500/10 border-b p-4">
              <h3 className="mb-1 text-lg font-bold text-green-600">AFTER (Optimized)</h3>
              <p className="text-sm text-green-600">Logical sequence - efficient</p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="font-semibold text-green-700">
                  {formatDistance(optimizedRoute.totalDistance)}
                </span>
                <span className="font-semibold text-green-700">
                  {formatTime(optimizedRoute.totalTime)}
                </span>
              </div>
            </div>

            {/* Map */}
            <div
              ref={afterMapContainer}
              className="h-[300px] w-full md:h-[400px]"
              // eslint-disable-next-line custom/no-inline-styles
              style={{ minHeight: "300px" }}
            />
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}

/**
 * Draw original route (BEFORE) with red styling
 */
function drawOriginalRoute(map: maplibregl.Map, stops: any[]) {
  // Add markers for each stop (original order)
  stops.forEach((stop, index) => {
    // Create numbered marker
    const el = document.createElement("div");
    el.className = "flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg";
    el.textContent = String(index + 1);

    new maplibregl.Marker({ element: el })
      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div class="text-sm">
            <strong>${index + 1}. ${stop.zone}</strong><br/>
            ${stop.address}<br/>
            ${stop.recipientName ? `<em>${stop.recipientName}</em>` : ""}
          </div>`
        )
      )
      .addTo(map);
  });

  // Draw route line (dashed red)
  const coordinates = stops.map((stop) => [stop.coordinates.lng, stop.coordinates.lat]);

  if (map.getSource("original-route")) {
    (map.getSource("original-route") as maplibregl.GeoJSONSource).setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: {},
    });
  } else {
    map.addSource("original-route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      },
    });

    map.addLayer({
      id: "original-route-line",
      type: "line",
      source: "original-route",
      paint: {
        "line-color": "#EF4444", // Red
        "line-width": 3,
        "line-dasharray": [2, 2], // Dashed
      },
    });
  }
}

/**
 * Draw optimized route (AFTER) with green styling
 */
function drawOptimizedRoute(map: maplibregl.Map, stops: any[]) {
  // Add markers for each stop (optimized order)
  stops.forEach((stop, index) => {
    // Create numbered marker with checkmark
    const el = document.createElement("div");
    el.className = "flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white shadow-lg";
    el.textContent = String(index + 1);

    new maplibregl.Marker({ element: el })
      .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div class="text-sm">
            <strong>${index + 1}. ${stop.zone}</strong><br/>
            ${stop.address}<br/>
            ${stop.recipientName ? `<em>${stop.recipientName}</em>` : ""}
          </div>`
        )
      )
      .addTo(map);
  });

  // Draw route line (solid green)
  const coordinates = stops.map((stop) => [stop.coordinates.lng, stop.coordinates.lat]);

  if (map.getSource("optimized-route")) {
    (map.getSource("optimized-route") as maplibregl.GeoJSONSource).setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: {},
    });
  } else {
    map.addSource("optimized-route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates,
        },
        properties: {},
      },
    });

    map.addLayer({
      id: "optimized-route-line",
      type: "line",
      source: "optimized-route",
      paint: {
        "line-color": "#22C55E", // Green
        "line-width": 4,
      },
    });
  }
}
