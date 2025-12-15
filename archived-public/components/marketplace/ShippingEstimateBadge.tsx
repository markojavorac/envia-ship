import { Badge } from "@/components/ui/badge";
import { Truck, MapPin } from "lucide-react";
import { ShippingEstimate } from "@/lib/marketplace/types";
import { formatPrice, getDeliveryTimeDescription } from "@/lib/marketplace/shipping-integration";

interface ShippingEstimateBadgeProps {
  estimate: ShippingEstimate | null;
  showDetails?: boolean;
  compact?: boolean;
}

export function ShippingEstimateBadge({
  estimate,
  showDetails = false,
  compact = false,
}: ShippingEstimateBadgeProps) {
  if (!estimate) {
    return (
      <Badge variant="secondary" className="text-xs">
        <MapPin className="mr-1 h-3 w-3" />
        Set zone to see shipping
      </Badge>
    );
  }

  const isToday = estimate.estimatedDays <= 1;

  if (compact) {
    return (
      <Badge className={`text-xs ${isToday ? "bg-primary text-white" : "bg-secondary text-white"}`}>
        <Truck className="mr-1 h-3 w-3" />
        {formatPrice(estimate.cost)}
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge className={`${isToday ? "bg-primary text-white" : "bg-secondary text-white"}`}>
        <Truck className="mr-1 h-3 w-3" />
        {formatPrice(estimate.cost)} shipping
      </Badge>
      {showDetails && (
        <span className="text-muted-foreground text-xs">
          {getDeliveryTimeDescription(estimate.estimatedDays)} delivery
        </span>
      )}
    </div>
  );
}
