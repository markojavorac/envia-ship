import { Package } from "lucide-react";
import { AdminCard, AdminCardContent } from "@/components/admin/ui";
import type { DriverStats } from "@/lib/admin/driver-tracking/types";

interface DriverStatusCardsProps {
  stats: DriverStats;
}

export default function DriverStatusCards({ stats }: DriverStatusCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Active Drivers */}
      <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
        <AdminCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
            <div>
              <p className="text-foreground text-2xl font-bold">{stats.activeCount}</p>
              <p className="text-muted-foreground text-xs">Active</p>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Available Drivers */}
      <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
        <AdminCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary h-3 w-3 rounded-full" />
            <div>
              <p className="text-foreground text-2xl font-bold">{stats.availableCount}</p>
              <p className="text-muted-foreground text-xs">Available</p>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Offline Drivers */}
      <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
        <AdminCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-muted-foreground h-3 w-3 rounded-full" />
            <div>
              <p className="text-foreground text-2xl font-bold">{stats.offlineCount}</p>
              <p className="text-muted-foreground text-xs">Offline</p>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Total Deliveries */}
      <AdminCard className="bg-card/95 border-border backdrop-blur-sm">
        <AdminCardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="text-primary h-5 w-5" />
            <div>
              <p className="text-foreground text-2xl font-bold">{stats.totalDeliveriesToday}</p>
              <p className="text-muted-foreground text-xs">Deliveries</p>
            </div>
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
