"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ZoneMetrics, HeatmapMetric } from "@/lib/admin/zone-analytics/types";
import { getZonePointsGeoJSON, getMetricValue } from "@/lib/admin/zone-analytics/aggregators";
import { GUATEMALA_CITY_BOUNDS } from "@/lib/admin/zone-analytics/zone-boundaries";
import { HeatmapLegend } from "./HeatmapLegend";

interface ZoneHeatmapMapProps {
  zoneMetrics: ZoneMetrics[];
  selectedMetric: HeatmapMetric;
  onZoneClick: (zoneId: string) => void;
  selectedZone?: string | null;
}

/**
 * Zone Heatmap Map Component
 *
 * Interactive radial heatmap using MapLibre GL native heatmap layer.
 * Shows Guatemala City zones with smooth circular gradients.
 */
export function ZoneHeatmapMap({
  zoneMetrics,
  selectedMetric,
  onZoneClick,
  selectedZone,
}: ZoneHeatmapMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Calculate map bounds
    const bounds = new maplibregl.LngLatBounds(
      [GUATEMALA_CITY_BOUNDS.southwest.lng, GUATEMALA_CITY_BOUNDS.southwest.lat],
      [GUATEMALA_CITY_BOUNDS.northeast.lng, GUATEMALA_CITY_BOUNDS.northeast.lat]
    );

    // CartoDB Dark Matter style
    const mapStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

    // Initialize map with flexible zoom and pan controls
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-90.523, 14.608], // Center on Guatemala City
      zoom: 11, // Start zoomed in for better heatmap visibility
      minZoom: 6, // Allow zooming out for context (more flexible)
      maxZoom: 18, // Allow zooming in for detail
      // maxBounds removed for full pan freedom
    });

    mapRef.current = map;

    // Wait for map to load
    map.on("load", () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update heatmap when data or metric changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || zoneMetrics.length === 0) return;

    const map = mapRef.current;

    // Create GeoJSON with Point features and normalized values
    const geojson = getZonePointsGeoJSON(zoneMetrics, selectedMetric.id);

    // Add or update source
    if (map.getSource("zone-points")) {
      const source = map.getSource("zone-points") as maplibregl.GeoJSONSource;
      source.setData(geojson);
    } else {
      map.addSource("zone-points", {
        type: "geojson",
        data: geojson,
      });

      // Add heatmap layer with radial gradients
      map.addLayer({
        id: "zone-heatmap",
        type: "heatmap",
        source: "zone-points",
        paint: {
          // Weight based on normalized metric value (0-1)
          "heatmap-weight": ["interpolate", ["linear"], ["get", "normalizedValue"], 0, 0, 1, 1],

          // Intensity increases with zoom (higher values for stronger blending)
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 8, 3, 10, 5, 12, 7],

          // Radius of influence (larger values for smooth blending)
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 80, 10, 120, 12, 150],

          // Color gradient (green→yellow→red - low to high activity)
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(34, 139, 34, 0)", // Transparent green
            0.2,
            "rgba(50, 205, 50, 0.5)", // Light green
            0.4,
            "rgba(154, 205, 50, 0.7)", // Yellow-green
            0.5,
            "rgba(255, 215, 0, 0.8)", // Yellow
            0.7,
            "rgba(255, 140, 0, 0.9)", // Orange
            0.85,
            "rgba(255, 69, 0, 0.95)", // Red-orange
            1,
            "rgba(220, 20, 60, 1)", // Crimson red
          ],

          // Constant opacity (no fade - keep heatmap visible)
          "heatmap-opacity": 0.85,
        },
      });

      // Add invisible zone label circles (for click handlers only)
      map.addLayer({
        id: "zone-labels",
        type: "circle",
        source: "zone-points",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 8, 9, 20],
          "circle-color": "hsl(33 100% 50%)", // Primary orange
          "circle-stroke-width": 0,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0, // Invisible but still clickable
        },
      });

      // Add zone name text labels
      map.addLayer({
        id: "zone-text",
        type: "symbol",
        source: "zone-points",
        layout: {
          "text-field": ["get", "zoneName"],
          "text-size": 12,
          "text-offset": [0, 2],
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1,
        },
      });

      // Add click handler for zone labels
      map.on("click", "zone-labels", (e) => {
        if (e.features && e.features.length > 0) {
          const zoneId = e.features[0].properties.zoneId;
          onZoneClick(zoneId);
        }
      });

      // Add hover cursor for zone labels
      map.on("mouseenter", "zone-labels", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "zone-labels", () => {
        map.getCanvas().style.cursor = "";
      });

      // Add hover popup for zone labels
      map.on("mousemove", "zone-labels", (e) => {
        if (e.features && e.features.length > 0) {
          const properties = e.features[0].properties;

          // Remove existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          // Create popup
          const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 10,
          })
            .setLngLat(e.lngLat)
            .setHTML(
              `
              <div class="p-3 text-sm">
                <strong class="text-base">${properties.zoneName}</strong><br/>
                <div class="mt-2 space-y-1">
                  <div><span class="text-muted-foreground">Orders:</span> <strong>${properties.orderCount}</strong></div>
                  <div><span class="text-muted-foreground">Revenue:</span> <strong>Q${properties.revenue.toFixed(2)}</strong></div>
                </div>
              </div>
            `
            )
            .addTo(map);

          popupRef.current = popup;
        }
      });

      map.on("mouseleave", "zone-labels", () => {
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      });
    }

    // Note: Zone selection highlighting removed since circles are now invisible
    // Zone selection state is still tracked and shown in ZoneDetailsPanel
  }, [mapLoaded, zoneMetrics, selectedMetric, selectedZone, onZoneClick]);

  return (
    <div className="border-border bg-muted relative h-[500px] w-full overflow-hidden rounded-md border-2">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Legend Overlay */}
      {zoneMetrics.length > 0 && (
        <HeatmapLegend metric={selectedMetric} zoneMetrics={zoneMetrics} />
      )}

      {/* No Data Message */}
      {zoneMetrics.length === 0 && (
        <div className="bg-muted/90 absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No data available for selected date range</p>
        </div>
      )}
    </div>
  );
}
