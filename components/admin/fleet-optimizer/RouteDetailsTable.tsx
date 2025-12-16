"use client";

/**
 * Route Details Table
 *
 * Displays detailed breakdown of each vehicle's route with expandable stops.
 */

import { useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MapPin } from "lucide-react";
import type { FleetSolution } from "@/lib/admin/fleet-types";
import { getVehicleRouteStats } from "@/lib/admin/fleet-optimizer/fleet-metrics";

interface RouteDetailsTableProps {
  solution: FleetSolution;
}

export function RouteDetailsTable({ solution }: RouteDetailsTableProps) {
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  const toggleRoute = (vehicleId: string) => {
    const updated = new Set(expandedRoutes);
    if (updated.has(vehicleId)) {
      updated.delete(vehicleId);
    } else {
      updated.add(vehicleId);
    }
    setExpandedRoutes(updated);
  };

  // Show only non-empty routes
  const nonEmptyRoutes = solution.routes.filter((r) => !r.isEmpty);

  if (nonEmptyRoutes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Route Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No routes assigned yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground">
          Route Details
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {nonEmptyRoutes.length} {nonEmptyRoutes.length === 1 ? "route" : "routes"} with stops
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead className="font-semibold text-foreground">Vehicle</TableHead>
              <TableHead className="font-semibold text-foreground">Stops</TableHead>
              <TableHead className="font-semibold text-foreground">Distance</TableHead>
              <TableHead className="font-semibold text-foreground">Time</TableHead>
              <TableHead className="font-semibold text-foreground">Packages</TableHead>
              <TableHead className="font-semibold text-foreground">Utilization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nonEmptyRoutes.map((route) => {
              const stats = getVehicleRouteStats(route);
              const isExpanded = expandedRoutes.has(route.vehicleId);

              return (
                <Fragment key={route.vehicleId}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRoute(route.vehicleId)}>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stats.vehicleColor }}
                        />
                        <span className="font-medium text-foreground">
                          {stats.vehicleLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{stats.stopCount}</TableCell>
                    <TableCell className="text-foreground">{stats.distance}</TableCell>
                    <TableCell className="text-foreground">{stats.time}</TableCell>
                    <TableCell className="text-foreground">
                      {stats.packages} / {stats.capacity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`font-semibold ${stats.utilizationColor}`}
                      >
                        {stats.utilization}
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {/* Expanded stops */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-foreground mb-3">
                            Route Sequence:
                          </h4>
                          {route.stops.map((stop, index) => (
                            <div
                              key={stop.id}
                              className="flex items-start gap-3 p-2 rounded bg-background border border-border"
                            >
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-medium text-foreground">
                                    {stop.address}
                                  </span>
                                </div>
                                {stop.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {stop.notes}
                                  </p>
                                )}
                                {stop.packageCount && stop.packageCount > 1 && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {stop.packageCount} packages
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
