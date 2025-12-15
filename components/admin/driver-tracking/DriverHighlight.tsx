import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { TrackedDriver } from "@/lib/admin/driver-tracking/types";
import { getStatusBadgeClass } from "@/lib/admin/driver-tracking/mock-data";

interface DriverHighlightProps {
  driver: TrackedDriver;
}

export default function DriverHighlight({ driver }: DriverHighlightProps) {
  const route = driver.route;
  const progressPercent = route ? Math.round((route.stopsCompleted / route.stops.length) * 100) : 0;

  return (
    <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
      <AdminCardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-foreground font-bold">{driver.name}</h3>
          <Badge className={getStatusBadgeClass(driver.status)}>{driver.status}</Badge>
        </div>

        {route && (
          <div className="space-y-2">
            {/* Progress Bar */}
            <div>
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>
                  {route.stopsCompleted} / {route.stops.length} stops
                </span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Next Stop */}
            <div className="text-xs">
              <p className="text-muted-foreground">Next stop:</p>
              <p className="text-foreground font-medium">
                {route.stops[route.currentStopIndex + 1]?.address || "Route complete"}
              </p>
            </div>
          </div>
        )}

        {!route && <p className="text-muted-foreground text-xs">No active route assigned</p>}
      </AdminCardContent>
    </AdminCard>
  );
}
