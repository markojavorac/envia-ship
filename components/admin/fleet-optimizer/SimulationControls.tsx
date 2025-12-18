"use client";

/**
 * Simulation Controls Component
 *
 * Play/pause, speed selector, ticket generation toggle, and time display.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Ticket, RefreshCw, Clock } from "lucide-react";
import { format } from "date-fns";
import type { FleetSimulationState } from "@/lib/admin/fleet-optimizer/simulation-types";

interface SimulationControlsProps {
  simState: FleetSimulationState | null;
  onStart: () => void;
  onPause: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleTicketGeneration: () => void;
  onManualReoptimize: () => void;
}

export function SimulationControls({
  simState,
  onStart,
  onPause,
  onSpeedChange,
  onToggleTicketGeneration,
  onManualReoptimize,
}: SimulationControlsProps) {
  if (!simState) return null;

  const { isRunning, simulationSpeed, currentTime, ticketGenerationEnabled } = simState;

  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Play/Pause */}
          <Button
            onClick={isRunning ? onPause : onStart}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>

          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-semibold">Speed:</span>
            <Select
              value={simulationSpeed.toString()}
              onValueChange={(value) => onSpeedChange(Number(value))}
            >
              <SelectTrigger className="bg-card border-border w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Generation Toggle */}
          <Button variant="outline" onClick={onToggleTicketGeneration} className="border-border">
            <Ticket className="mr-2 h-4 w-4" />
            Tickets: {ticketGenerationEnabled ? "ON" : "OFF"}
          </Button>

          {/* Manual Reoptimize */}
          <Button variant="outline" onClick={onManualReoptimize} className="border-border">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reoptimize Now
          </Button>

          {/* Simulation Time */}
          <div className="ml-auto flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground font-mono text-sm">
              {format(currentTime, "HH:mm:ss")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
