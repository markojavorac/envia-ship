"use client";

/**
 * Fleet Simulation Map Component
 *
 * MapLibre GL map showing live vehicle positions, routes, and stops.
 * Based on driver-tracking/DriverTrackingMap.tsx pattern.
 */

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { RouteStop } from "@/lib/admin/route-types";
import type {
  FleetSimulationState,
  SimulatedVehicle,
} from "@/lib/admin/fleet-optimizer/simulation-types";
import {
  getActiveVehicles,
  getAvailableVehicles,
} from "@/lib/admin/fleet-optimizer/fleet-simulation";

// CartoDB Dark Matter style (free, no API key)
const CARTO_DARK_MATTER =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface FleetSimulationMapProps {
  simState: FleetSimulationState | null;
  depot: RouteStop;
}

export function FleetSimulationMap({ simState, depot }: FleetSimulationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [isMounted, setIsMounted] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Client-side only mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current || mapRef.current) return;

    console.log("Initializing map...");

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_MATTER,
      center: [depot.coordinates.lng, depot.coordinates.lat],
      zoom: 12,
    });

    map.on("load", () => {
      console.log("Map loaded successfully");
      setIsMapLoaded(true);

      // Add depot marker
      const depotEl = document.createElement("div");
      depotEl.className = "depot-marker";
      depotEl.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #FF8C00;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      `;

      new maplibregl.Marker({ element: depotEl })
        .setLngLat([depot.coordinates.lng, depot.coordinates.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setText("Depot: " + depot.address)
        )
        .addTo(map);
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
    });

    mapRef.current = map;

    return () => {
      console.log("Cleaning up map");
      setIsMapLoaded(false);
      map.remove();
      mapRef.current = null;
    };
  }, [isMounted, depot]);

  // Update vehicle markers
  useEffect(() => {
    if (!mapRef.current || !simState || !isMapLoaded) return;

    const map = mapRef.current;
    const activeVehicles = getActiveVehicles(simState);
    const availableVehicles = getAvailableVehicles(simState);
    const allVehicles = [...activeVehicles, ...availableVehicles];

    console.log("Updating vehicle markers:", allVehicles.length);

    // Update/create markers for all vehicles
    allVehicles.forEach((vehicle) => {
      let marker = vehicleMarkersRef.current.get(vehicle.id);

      if (!marker) {
        const el = createVehicleMarker(vehicle);
        marker = new maplibregl.Marker({ element: el })
          .setLngLat([vehicle.position.lng, vehicle.position.lat])
          .addTo(map);
        vehicleMarkersRef.current.set(vehicle.id, marker);
      } else {
        // Update position
        marker.setLngLat([vehicle.position.lng, vehicle.position.lat]);

        // Update marker appearance
        const el = marker.getElement();
        el.style.backgroundColor = vehicle.color;
      }
    });

    // Remove markers for vehicles that no longer exist
    const currentVehicleIds = new Set(allVehicles.map((v) => v.id));
    vehicleMarkersRef.current.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        marker.remove();
        vehicleMarkersRef.current.delete(id);
      }
    });
  }, [simState, isMapLoaded]);

  // Update route polylines
  useEffect(() => {
    if (!mapRef.current || !simState || !isMapLoaded) return;

    const map = mapRef.current;
    const activeVehicles = getActiveVehicles(simState);

    // Remove existing route layers
    for (let i = 0; i < 20; i++) {
      const layerId = `route-${i}`;
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(layerId)) {
        map.removeSource(layerId);
      }
    }

    // Add route layers for active vehicles
    activeVehicles.forEach((vehicle, index) => {
      if (!vehicle.assignedRoute) return;

      // Determine coordinates: use OSRM geometry if available, otherwise straight lines
      let coordinates: [number, number][];

      if (vehicle.assignedRoute.geometry && vehicle.assignedRoute.geometry.coordinates.length > 0) {
        // Use actual road geometry from OSRM
        coordinates = vehicle.assignedRoute.geometry.coordinates;
        console.log(
          `[Map] Using OSRM geometry for ${vehicle.label}: ${coordinates.length} road coordinates`
        );
      } else {
        // Fallback to straight lines between stops
        coordinates = vehicle.assignedRoute.stops.map((stop) => [
          stop.coordinates.lng,
          stop.coordinates.lat,
        ]);
        console.warn(
          `[Map] No geometry for ${vehicle.label}, using straight lines (${coordinates.length} stops)`
        );
      }

      const sourceId = `route-${index}`;

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      });

      map.addLayer({
        id: sourceId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": vehicle.color,
          "line-width": 3, // Increased from 2
          "line-opacity": 0.7, // Increased from 0.4 for better visibility
          "line-dasharray": [5, 3], // Increased from [2, 2] for clearer dashes
        },
      });
    });
  }, [simState, isMapLoaded]);

  if (!isMounted) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-background border border-border rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] bg-muted border border-border rounded-lg overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

/**
 * Create vehicle marker DOM element
 */
function createVehicleMarker(vehicle: SimulatedVehicle): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "vehicle-marker";

  const size = vehicle.status === "idle" || vehicle.status === "completed" ? "24px" : "28px";

  el.style.cssText = `
    width: ${size};
    height: ${size};
    background-color: ${vehicle.color};
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  // Add pulse animation for active vehicles
  if (vehicle.status === "en_route" || vehicle.status === "servicing") {
    el.style.animation = "pulse 2s infinite";
  }

  return el;
}
