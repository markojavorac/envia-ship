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
        <MapPin className="h-3 w-3 mr-1" />
        Set zone to see shipping
      </Badge>
    );
  }

  const isToday = estimate.estimatedDays <= 1;

  if (compact) {
    return (
      <Badge
        className={`text-xs ${isToday ? "bg-primary text-white" : "bg-secondary text-white"}`}
      >
        <Truck className="h-3 w-3 mr-1" />
        {formatPrice(estimate.cost)}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge
        className={`${isToday ? "bg-primary text-white" : "bg-secondary text-white"}`}
      >
        <Truck className="h-3 w-3 mr-1" />
        {formatPrice(estimate.cost)} shipping
      </Badge>
      {showDetails && (
        <span className="text-xs text-gray-600">
          {getDeliveryTimeDescription(estimate.estimatedDays)} delivery
        </span>
      )}
    </div>
  );
}
