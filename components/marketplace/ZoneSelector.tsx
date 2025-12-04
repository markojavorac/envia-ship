"use client";

import { useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { GUATEMALA_ZONES } from "@/lib/types";
import { MarketplaceContext } from "@/contexts/MarketplaceContext";

export function ZoneSelector() {
  const context = useContext(MarketplaceContext);

  // Return null if not in marketplace context
  if (!context) return null;

  const { userZone, setUserZone } = context;

  return (
    <Select value={userZone || ""} onValueChange={setUserZone}>
      <SelectTrigger className="w-48 bg-white text-secondary border-2 border-gray-200 hover:border-primary/50 focus:border-primary focus:ring-primary/20 font-semibold">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        <SelectValue placeholder="Set Zone" />
      </SelectTrigger>
      <SelectContent className="z-[100]">
        {GUATEMALA_ZONES.map((zone) => (
          <SelectItem key={zone.value} value={zone.value}>
            {zone.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
