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
const CARTO_DARK_MATTER = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface FleetSimulationMapProps {
  simState: FleetSimulationState | null;
  depot: RouteStop;
}

export function FleetSimulationMap({ simState, depot }: FleetSimulationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const renderedRoutesRef = useRef<Map<string, string>>(new Map()); // routeKey -> vehicleId
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
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText("Depot: " + depot.address))
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

  // Helper: Generate stable route key
  const getRouteKey = (vehicle: SimulatedVehicle): string | null => {
    if (!vehicle.assignedRoute || vehicle.assignedRoute.stops.length === 0) {
      return null;
    }
    // Create key from vehicle ID + route stop IDs
    const stopIds = vehicle.assignedRoute.stops.map((s) => s.id).join(",");
    return `${vehicle.id}-${stopIds}`;
  };

  // Helper: Add route layer to map
  const addRouteLayer = (map: maplibregl.Map, vehicle: SimulatedVehicle, layerId: string) => {
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

    map.addSource(layerId, {
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
      id: layerId,
      type: "line",
      source: layerId,
      paint: {
        "line-color": vehicle.color,
        "line-width": 3,
        "line-opacity": 0.7,
        "line-dasharray": [5, 3],
      },
    });
  };

  // Helper: Remove route layer from map
  const removeRouteLayer = (map: maplibregl.Map, layerId: string) => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(layerId)) {
      map.removeSource(layerId);
    }
  };

  // Update route polylines (smart updates - only when routes change)
  useEffect(() => {
    if (!mapRef.current || !simState || !isMapLoaded) return;

    const map = mapRef.current;
    const activeVehicles = getActiveVehicles(simState);

    // Build current route keys
    const currentRouteKeys = new Map<string, SimulatedVehicle>();
    activeVehicles.forEach((vehicle) => {
      const key = getRouteKey(vehicle);
      if (key) {
        currentRouteKeys.set(key, vehicle);
      }
    });

    // Remove routes that no longer exist
    const keysToRemove: string[] = [];
    renderedRoutesRef.current.forEach((vehicleId, routeKey) => {
      if (!currentRouteKeys.has(routeKey)) {
        const layerId = `route-${vehicleId}`;
        removeRouteLayer(map, layerId);
        keysToRemove.push(routeKey);
      }
    });
    keysToRemove.forEach((key) => renderedRoutesRef.current.delete(key));

    // Add new routes
    let boundsChanged = false;
    currentRouteKeys.forEach((vehicle, routeKey) => {
      if (!renderedRoutesRef.current.has(routeKey)) {
        const layerId = `route-${vehicle.id}`;
        addRouteLayer(map, vehicle, layerId);
        renderedRoutesRef.current.set(routeKey, vehicle.id);
        boundsChanged = true;
      }
    });

    // Auto-fit bounds when routes are first added
    if (boundsChanged && activeVehicles.length > 0) {
      const allCoordinates: [number, number][] = [];

      // Collect all route coordinates
      activeVehicles.forEach((vehicle) => {
        if (vehicle.assignedRoute?.geometry?.coordinates) {
          allCoordinates.push(...vehicle.assignedRoute.geometry.coordinates);
        } else if (vehicle.assignedRoute?.stops) {
          vehicle.assignedRoute.stops.forEach((stop) => {
            allCoordinates.push([stop.coordinates.lng, stop.coordinates.lat]);
          });
        }
      });

      // Add depot
      allCoordinates.push([depot.coordinates.lng, depot.coordinates.lat]);

      if (allCoordinates.length > 0) {
        // Calculate bounds
        const lngs = allCoordinates.map((c) => c[0]);
        const lats = allCoordinates.map((c) => c[1]);
        const bounds: [[number, number], [number, number]] = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ];

        // Fit map to bounds with padding
        map.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14,
          duration: 1000,
        });

        console.log("[Map] Auto-fitted bounds to show all routes");
      }
    }
  }, [
    simState?.vehicles
      .map((v) => getRouteKey(v))
      .filter(Boolean)
      .join("|"),
    isMapLoaded,
    depot,
  ]);

  if (!isMounted) {
    return (
      <div className="bg-background border-border flex h-[600px] items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="bg-muted border-border relative h-[600px] overflow-hidden rounded-lg border">
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

  // Different border color for waiting status
  const borderColor = vehicle.status === "waiting" ? "#fbbf24" : "white"; // Yellow border for waiting

  el.style.cssText = `
    width: ${size};
    height: ${size};
    background-color: ${vehicle.color};
    border: 2px solid ${borderColor};
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  `;

  // Add pulse animation for active vehicles
  if (vehicle.status === "en_route" || vehicle.status === "servicing") {
    el.style.animation = "pulse 2s infinite";
  }

  // Add different animation for waiting
  if (vehicle.status === "waiting") {
    el.style.animation = "pulse 3s infinite"; // Slower pulse
    el.style.opacity = "0.8";
  }

  return el;
}
