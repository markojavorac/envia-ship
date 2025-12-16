"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDriverTracking } from "@/hooks/useDriverTracking";
import DriverStatusCards from "./DriverStatusCards";
import MapControls from "./MapControls";
import DriverHighlight from "./DriverHighlight";
import MobileControls from "./MobileControls";
import { DriverStatus, type TrackedDriver } from "@/lib/admin/driver-tracking/types";
import { getDriverColor } from "@/lib/admin/driver-tracking/mock-data";

// Map style options (all free, no API keys required)
const MAP_STYLES = [
  {
    id: "voyager",
    name: "Voyager (Clean)",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    id: "positron",
    name: "Positron (Minimal Light)",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  {
    id: "dark-matter",
    name: "Dark Matter",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    id: "voyager-nolabels",
    name: "Voyager No Labels",
    url: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
  },
  {
    id: "positron-nolabels",
    name: "Positron No Labels",
    url: "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json",
  },
  {
    id: "dark-matter-nolabels",
    name: "Dark Matter No Labels",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
  },
];

export default function DriverTrackingMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const stopMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentStyle, setCurrentStyle] = useState("dark-matter");

  const { drivers, allDrivers, selectedDriver, setSelectedDriver, filters, setFilters, stats } =
    useDriverTracking();

  // Initialize map (only once on mount)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const styleUrl = MAP_STYLES.find((s) => s.id === currentStyle)?.url || MAP_STYLES[0].url;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [-90.5068, 14.6349], // Guatemala City
      zoom: 12.5,
    });

    // Wait for map style to load before allowing source/layer operations
    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Change map style
  const changeMapStyle = useCallback((styleId: string) => {
    if (!mapRef.current) return;

    const styleUrl = MAP_STYLES.find((s) => s.id === styleId)?.url;
    if (!styleUrl) return;

    setCurrentStyle(styleId);
    setMapLoaded(false);

    mapRef.current.setStyle(styleUrl);

    mapRef.current.once("styledata", () => {
      setMapLoaded(true);
    });
  }, []);

  // Create driver marker element
  const createDriverMarker = useCallback((driver: TrackedDriver): HTMLElement => {
    const el = document.createElement("div");
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = getDriverColor(driver.status);
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 3px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)";
    el.style.cursor = "pointer";
    el.style.transition = "transform 0.2s";

    // Pulse animation for active drivers
    if (driver.status === DriverStatus.ACTIVE) {
      el.style.animation = "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite";
    }

    return el;
  }, []);

  // Create stop marker element
  const createStopMarker = useCallback((stopNumber: number, isCompleted: boolean): HTMLElement => {
    const el = document.createElement("div");
    el.style.width = "24px";
    el.style.height = "24px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = isCompleted ? "#22c55e" : "#FF8C00";
    el.style.border = "2px solid white";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.color = "white";
    el.style.fontSize = "12px";
    el.style.fontWeight = "bold";
    el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
    el.textContent = stopNumber.toString();

    return el;
  }, []);

  // Check if driver should be visible based on filters
  const shouldShowDriver = useCallback(
    (driver: TrackedDriver): boolean => {
      switch (driver.status) {
        case DriverStatus.ACTIVE:
          return filters.showActive;
        case DriverStatus.AVAILABLE:
          return filters.showAvailable;
        case DriverStatus.OFFLINE:
          return filters.showOffline;
        default:
          return true;
      }
    },
    [filters]
  );

  // Update driver markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Remove filtered-out markers
    markersRef.current.forEach((marker, driverId) => {
      const driver = allDrivers.find((d) => d.id === driverId);
      if (!driver || !shouldShowDriver(driver)) {
        marker.remove();
        markersRef.current.delete(driverId);
      }
    });

    // Add/update visible markers
    allDrivers.forEach((driver) => {
      if (!shouldShowDriver(driver)) return;

      let marker = markersRef.current.get(driver.id);

      if (!marker) {
        // Create new marker
        const el = createDriverMarker(driver);
        marker = new maplibregl.Marker({ element: el })
          .setLngLat([driver.position.lng, driver.position.lat])
          .addTo(map);

        // Click handler
        el.addEventListener("click", () => setSelectedDriver(driver));

        markersRef.current.set(driver.id, marker);
      } else {
        // Update existing marker position
        marker.setLngLat([driver.position.lng, driver.position.lat]);
      }

      // Highlight selected driver
      const el = marker.getElement();
      if (selectedDriver?.id === driver.id) {
        el.style.transform = "scale(1.5)";
        el.style.zIndex = "1000";
      } else {
        el.style.transform = "scale(1)";
        el.style.zIndex = "auto";
      }
    });
  }, [
    allDrivers,
    selectedDriver,
    filters,
    shouldShowDriver,
    createDriverMarker,
    setSelectedDriver,
    mapLoaded,
  ]);

  // Render route line and stop markers for selected driver
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Remove existing route layer and stop markers
    if (map.getLayer("route-line")) {
      map.removeLayer("route-line");
    }
    if (map.getSource("route-line")) {
      map.removeSource("route-line");
    }
    stopMarkersRef.current.forEach((marker) => marker.remove());
    stopMarkersRef.current = [];

    if (!selectedDriver?.route) return;

    // Build route coordinates
    const coordinates = selectedDriver.route.stops.map((stop) => [
      stop.coordinates.lng,
      stop.coordinates.lat,
    ]);

    // Add route line
    map.addSource("route-line", {
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
      id: "route-line",
      type: "line",
      source: "route-line",
      paint: {
        "line-color": "#FF8C00", // primary orange
        "line-width": 3,
        "line-opacity": 0.8,
      },
    });

    // Add stop markers
    selectedDriver.route.stops.forEach((stop, index) => {
      const el = createStopMarker(index + 1, stop.isCompleted);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.coordinates.lng, stop.coordinates.lat])
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [selectedDriver, createStopMarker, mapLoaded]);

  // Fit all drivers in view on initial load
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || allDrivers.length === 0) return;

    const map = mapRef.current;

    // Only fit bounds once on initial load
    if (markersRef.current.size === 0) {
      const bounds = new maplibregl.LngLatBounds();

      allDrivers.forEach((driver) => {
        bounds.extend([driver.position.lng, driver.position.lat]);
      });

      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 450, right: 100 },
        duration: 1000,
      });
    }
  }, [allDrivers, mapLoaded]);

  // Zoom to selected driver
  const zoomToSelectedDriver = useCallback(() => {
    if (!mapRef.current || !selectedDriver) return;

    mapRef.current.flyTo({
      center: [selectedDriver.position.lng, selectedDriver.position.lat],
      zoom: 14,
      duration: 1000,
      essential: true,
    });
  }, [selectedDriver]);

  // Reset view to fit all drivers
  const resetView = useCallback(() => {
    if (!mapRef.current || allDrivers.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    allDrivers.forEach((driver) => {
      bounds.extend([driver.position.lng, driver.position.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 450, right: 100 },
      duration: 1000,
    });
  }, [allDrivers]);

  return (
    <div className="bg-muted relative h-[calc(100vh-12rem)] overflow-hidden rounded-md md:h-[calc(100vh-10rem)]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

      {/* Desktop Sidebar */}
      <div className="absolute top-4 left-4 z-10 hidden max-h-[calc(100vh-14rem)] w-80 space-y-4 overflow-y-auto md:block">
        <DriverStatusCards stats={stats} />
        {selectedDriver && <DriverHighlight driver={selectedDriver} />}
        <MapControls
          filters={filters}
          onFilterChange={setFilters}
          onZoomToSelected={zoomToSelectedDriver}
          onResetView={resetView}
          hasSelection={!!selectedDriver}
          currentStyle={currentStyle}
          mapStyles={MAP_STYLES}
          onStyleChange={changeMapStyle}
        />
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <MobileControls
          stats={stats}
          selectedDriver={selectedDriver}
          filters={filters}
          onFilterChange={setFilters}
          onZoomToSelected={zoomToSelectedDriver}
          onResetView={resetView}
          currentStyle={currentStyle}
          mapStyles={MAP_STYLES}
          onStyleChange={changeMapStyle}
        />
      </div>
    </div>
  );
}
