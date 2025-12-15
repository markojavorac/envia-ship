"use client";

import { Check, Loader2, Database, Route as RouteIcon, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptimizationProgress } from "@/lib/admin/route-types";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";

interface RouteOptimizationProgressProps {
  progress: OptimizationProgress | null;
}

interface Phase {
  id: 'distance_matrix' | 'nearest_neighbor' | 'calculating_metrics';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: Phase[] = [
  { id: 'distance_matrix', label: 'Building distance matrix', icon: Database },
  { id: 'nearest_neighbor', label: 'Finding optimal sequence', icon: RouteIcon },
  { id: 'calculating_metrics', label: 'Calculating savings', icon: Calculator },
];

export function RouteOptimizationProgress({ progress }: RouteOptimizationProgressProps) {
  if (!progress) {
    return null;
  }

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === progress.phase);

  return (
    <AdminCard className="py-0">
      <AdminCardContent className="p-6">
        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="space-y-3">
            {PHASES.map((phase, index) => {
              const isCompleted = index < currentPhaseIndex;
              const isCurrent = index === currentPhaseIndex;
              const isPending = index > currentPhaseIndex;

              const Icon = phase.icon;

              return (
                <div
                  key={phase.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 transition-all",
                    isCurrent && "bg-primary/10",
                    isCompleted && "opacity-75"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all",
                      isCompleted && "bg-green-500/20",
                      isCurrent && "bg-primary/20",
                      isPending && "bg-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="text-primary h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className={cn("h-5 w-5", isPending && "text-muted-foreground")} />
                    )}
                  </div>

                  {/* Label and Progress */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCompleted && "text-muted-foreground",
                        isCurrent && "text-primary",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {phase.label}
                    </p>
                    {isCurrent && progress.phase === 'nearest_neighbor' && (
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {progress.currentStep}/{progress.totalSteps} stops optimized
                      </p>
                    )}
                  </div>

                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <div className="text-green-600">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Overall Progress</span>
              <span className="text-primary font-bold">{progress.percent}%</span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              {/* eslint-disable-next-line custom/no-inline-styles */}
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}
