"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  DriverStatus,
  type TrackedDriver,
  type MapFilters,
  type SimulationState,
  type DriverStats,
} from "@/lib/admin/driver-tracking/types";
import { generateMockDrivers } from "@/lib/admin/driver-tracking/mock-data";
import { updateDriverPosition, clearSimulationState } from "@/lib/admin/driver-tracking/simulation";

/**
 * Custom hook for driver tracking state management
 * Manages drivers, simulation, filters, and computed stats
 */
export function useDriverTracking() {
  // Driver state
  const [drivers, setDrivers] = useState<TrackedDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<TrackedDriver | null>(null);

  // Filter state
  const [filters, setFilters] = useState<MapFilters>({
    showActive: true,
    showAvailable: true,
    showOffline: true,
  });

  // Simulation state
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: true,
    updateInterval: 2500, // 2.5 seconds
    speedMultiplier: 1,
  });

  // Initialize drivers on mount
  useEffect(() => {
    const mockDrivers = generateMockDrivers();
    setDrivers(mockDrivers);

    // Auto-select first active driver
    const firstActive = mockDrivers.find((d) => d.status === DriverStatus.ACTIVE);
    if (firstActive) {
      setSelectedDriver(firstActive);
    }

    return () => {
      clearSimulationState();
    };
  }, []);

  // Simulation loop - update driver positions
  useEffect(() => {
    if (!simulation.isRunning) return;

    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => updateDriverPosition(driver, simulation.updateInterval))
      );
    }, simulation.updateInterval);

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.updateInterval]);

  // Update selected driver when drivers state changes
  useEffect(() => {
    if (!selectedDriver) return;

    const updatedDriver = drivers.find((d) => d.id === selectedDriver.id);
    if (updatedDriver) {
      setSelectedDriver(updatedDriver);
    }
  }, [drivers, selectedDriver]);

  // Computed: Filtered drivers based on status filters
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
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
    });
  }, [drivers, filters]);

  // Computed: Driver statistics
  const stats = useMemo<DriverStats>(() => {
    return {
      activeCount: drivers.filter((d) => d.status === DriverStatus.ACTIVE).length,
      availableCount: drivers.filter((d) => d.status === DriverStatus.AVAILABLE).length,
      offlineCount: drivers.filter((d) => d.status === DriverStatus.OFFLINE).length,
      totalDeliveriesToday: drivers.reduce((sum, d) => sum + (d.route?.deliveriesToday || 0), 0),
    };
  }, [drivers]);

  // Toggle simulation running state
  const toggleSimulation = useCallback(() => {
    setSimulation((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }, []);

  // Update filter for specific status
  const updateFilter = useCallback((status: keyof MapFilters, value: boolean) => {
    setFilters((prev) => ({ ...prev, [status]: value }));
  }, []);

  // Toggle all filters on/off
  const toggleAllFilters = useCallback((enabled: boolean) => {
    setFilters({
      showActive: enabled,
      showAvailable: enabled,
      showOffline: enabled,
    });
  }, []);

  // Select a driver by ID
  const selectDriverById = useCallback(
    (driverId: string) => {
      const driver = drivers.find((d) => d.id === driverId);
      setSelectedDriver(driver || null);
    },
    [drivers]
  );

  // Clear selected driver
  const clearSelection = useCallback(() => {
    setSelectedDriver(null);
  }, []);

  return {
    // Driver data
    drivers: filteredDrivers,
    allDrivers: drivers,
    selectedDriver,
    setSelectedDriver,
    selectDriverById,
    clearSelection,

    // Filters
    filters,
    setFilters,
    updateFilter,
    toggleAllFilters,

    // Stats
    stats,

    // Simulation controls
    simulation,
    setSimulation,
    toggleSimulation,
  };
}
