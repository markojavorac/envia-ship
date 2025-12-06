"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizedRoute } from "@/lib/admin/route-types";
import { RouteComparisonCard } from "./RouteComparisonCard";
import { formatDistance, formatDuration, haversineDistance } from "@/lib/admin/route-utils";
import { exportRouteToCSV } from "@/lib/admin/csv-export";
import { ArrowRight, Download, MapIcon, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptimizedRouteViewProps {
  /** Optimized route to display */
  optimizedRoute: OptimizedRoute;
  /** Callback when save as template is clicked */
  onSaveTemplate?: () => void;
}

export function OptimizedRouteView({ optimizedRoute, onSaveTemplate }: OptimizedRouteViewProps) {
  const { toast } = useToast();

  const handleExportCSV = () => {
    try {
      exportRouteToCSV(optimizedRoute);
      toast({
        title: "Route Exported",
        description: "CSV file has been downloaded successfully.",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewMap = () => {
    toast({
      title: "Coming Soon",
      description: "Map visualization will be available in a future update.",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Coming Soon",
      description: "Print functionality will be available in a future update.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Comparison Card */}
      <RouteComparisonCard optimizedRoute={optimizedRoute} />

      {/* Optimized Route Details */}
      <Card className="bg-card border-border border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary text-lg font-bold">Optimized Route Order</CardTitle>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="border-border border"
              >
                <Download className="mr-1 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleViewMap}
                className="border-border border"
              >
                <MapIcon className="mr-1 h-4 w-4" />
                View Map
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-border border"
              >
                <Printer className="mr-1 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizedRoute.optimizedStops.map((stop, index) => {
              // Calculate distance to next stop
              const nextStop = optimizedRoute.optimizedStops[index + 1];
              const distanceToNext = nextStop
                ? haversineDistance(stop.coordinates, nextStop.coordinates)
                : 0;

              const isLastStop = index === optimizedRoute.optimizedStops.length - 1;

              return (
                <div key={stop.id}>
                  {/* Stop card */}
                  <div className="bg-muted border-border flex items-start gap-3 rounded-lg border p-4">
                    {/* Sequence number */}
                    <div className="bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
                      {index + 1}
                    </div>

                    {/* Stop details */}
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-semibold">{stop.address}</p>
                      {stop.zone && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {stop.zone.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow and distance to next stop */}
                  {!isLastStop && (
                    <div className="text-muted-foreground my-2 ml-5 flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {formatDistance(distanceToNext)}
                        {" · "}
                        {formatDuration(Math.round((distanceToNext / 30) * 60))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save as Template button */}
          {onSaveTemplate && (
            <div className="border-border mt-6 border-t pt-6">
              <Button
                type="button"
                onClick={onSaveTemplate}
                className="bg-secondary hover:bg-secondary/90 w-full font-semibold text-white"
              >
                Save as Template
              </Button>
              <p className="text-muted-foreground mt-2 text-center text-xs">
                Save this route to reuse it in the future
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
