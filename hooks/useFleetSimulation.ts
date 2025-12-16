/**
 * Fleet Simulation Hook
 *
 * Central state management for real-time fleet simulation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type { FleetSolution, FleetConfig } from "@/lib/admin/fleet-types";
import type { RouteStop } from "@/lib/admin/route-types";
import type {
  FleetSimulationState,
  SimulationConfig,
  QueuedTicket,
} from "@/lib/admin/fleet-optimizer/simulation-types";
import {
  initializeSimulation,
  updateSimulation,
  addTicketToQueue,
  shouldReoptimize,
  getAvailableVehicles,
  getActiveVehicles,
} from "@/lib/admin/fleet-optimizer/fleet-simulation";
import {
  reoptimizeWithQueue,
  applyReoptimization,
} from "@/lib/admin/fleet-optimizer/dynamic-reoptimization";
import { generateRandomTicket } from "@/lib/admin/fleet-optimizer/load-test-data";

export interface UseFleetSimulationProps {
  solution: FleetSolution | null;
  config: SimulationConfig;
  depot: RouteStop;
  fleetConfig: FleetConfig;
}

export function useFleetSimulation({
  solution,
  config,
  depot,
  fleetConfig,
}: UseFleetSimulationProps) {
  const [simState, setSimState] = useState<FleetSimulationState | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ticket generation timer
  const ticketTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize simulation from solution
  useEffect(() => {
    if (!solution || isInitialized) return;

    const state = initializeSimulation(solution, config, depot.coordinates);
    setSimState(state);
    setIsInitialized(true);
  }, [solution, config, depot.coordinates, isInitialized]);

  // Main simulation loop (1 second updates)
  useEffect(() => {
    if (!simState || !simState.isRunning) return;

    const interval = setInterval(() => {
      setSimState((prevState) => {
        if (!prevState) return null;

        const deltaTime = 1000; // 1 second
        const updated = updateSimulation(prevState, deltaTime, config, depot.coordinates);

        // Check if reoptimization needed
        if (shouldReoptimize(updated)) {
          // Trigger reoptimization asynchronously
          handleReoptimize(updated);
        }

        return updated;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [simState?.isRunning, config, depot.coordinates]);

  // Ticket generation loop
  useEffect(() => {
    if (!simState || !simState.ticketGenerationEnabled) {
      // Clear timer if disabled
      if (ticketTimerRef.current) {
        clearTimeout(ticketTimerRef.current);
        ticketTimerRef.current = null;
      }
      return;
    }

    const scheduleNextTicket = () => {
      const [min, max] = [config.ticketGenerationMin, config.ticketGenerationMax];
      const delay = Math.random() * (max - min) + min;

      ticketTimerRef.current = setTimeout(() => {
        const ticket: QueuedTicket = {
          id: `ticket-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          stop: generateRandomTicket(),
          addedAt: new Date(),
          priority: Math.random() < 0.2 ? "urgent" : "normal",
        };

        setSimState((prev) => (prev ? addTicketToQueue(prev, ticket) : null));
        scheduleNextTicket();
      }, delay);
    };

    scheduleNextTicket();

    return () => {
      if (ticketTimerRef.current) {
        clearTimeout(ticketTimerRef.current);
      }
    };
  }, [simState?.ticketGenerationEnabled, config]);

  // Handle reoptimization
  const handleReoptimize = useCallback(
    async (state: FleetSimulationState) => {
      // Pause simulation during reoptimization
      setSimState((prev) => (prev ? { ...prev, isRunning: false } : null));

      try {
        const { newRoutes, assignedTickets, remainingQueue } = await reoptimizeWithQueue(
          state,
          depot,
          fleetConfig
        );

        setSimState((prev) => {
          if (!prev) return null;

          const updated = applyReoptimization(
            prev,
            newRoutes,
            assignedTickets,
            remainingQueue,
            depot
          );

          // Resume simulation
          return { ...updated, isRunning: true };
        });
      } catch (error) {
        console.error("Reoptimization error:", error);

        // Resume simulation even if reoptimization failed
        setSimState((prev) => (prev ? { ...prev, isRunning: true } : null));
      }
    },
    [depot, fleetConfig]
  );

  // Control functions
  const start = useCallback(() => {
    setSimState((prev) => (prev ? { ...prev, isRunning: true } : null));
  }, []);

  const pause = useCallback(() => {
    setSimState((prev) => (prev ? { ...prev, isRunning: false } : null));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setSimState((prev) => (prev ? { ...prev, simulationSpeed: speed } : null));
  }, []);

  const toggleTicketGeneration = useCallback(() => {
    setSimState((prev) =>
      prev
        ? {
            ...prev,
            ticketGenerationEnabled: !prev.ticketGenerationEnabled,
          }
        : null
    );
  }, []);

  const manualReoptimize = useCallback(() => {
    if (simState) {
      handleReoptimize(simState);
    }
  }, [simState, handleReoptimize]);

  // Computed values
  const activeVehicles = simState ? getActiveVehicles(simState) : [];
  const availableVehicles = simState ? getAvailableVehicles(simState) : [];

  return {
    simState,
    isInitialized,
    activeVehicles,
    availableVehicles,
    start,
    pause,
    setSpeed,
    toggleTicketGeneration,
    manualReoptimize,
  };
}
