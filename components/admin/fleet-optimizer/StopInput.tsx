"use client";

/**
 * Stop Input Component
 *
 * Simple address input for adding delivery stops to fleet optimizer.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, MapPin } from "lucide-react";
import type { RouteStop, GeocodingResult } from "@/lib/admin/route-types";
import { AddressAutocomplete } from "../routes/AddressAutocomplete";
import { generateStopId } from "@/lib/admin/route-utils";

interface StopInputProps {
  onAddStop: (stop: RouteStop) => void;
  disabled?: boolean;
  maxStops: number;
  currentCount: number;
}

export function StopInput({
  onAddStop,
  disabled = false,
  maxStops,
  currentCount,
}: StopInputProps) {
  const [address, setAddress] = useState("");
  const [packageCount, setPackageCount] = useState("1");

  const handleAddressSelect = (result: GeocodingResult) => {
    const stop: RouteStop = {
      id: generateStopId(),
      address: result.address,
      coordinates: result.coordinates,
      zone: result.zone,
      packageCount: parseInt(packageCount) || 1,
    };

    onAddStop(stop);
    setAddress("");
    setPackageCount("1");
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Add Stop
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {currentCount} / {maxStops} stops added
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Address Input */}
          <div className="space-y-2">
            <Label htmlFor="stop-address" className="font-semibold text-foreground">
              Address
            </Label>
            <AddressAutocomplete
              id="stop-address"
              value={address}
              onChange={setAddress}
              onSelect={handleAddressSelect}
              placeholder="Enter delivery address"
              disabled={disabled}
              className="bg-input border-border focus-visible:border-primary"
            />
          </div>

          {/* Package Count */}
          <div className="space-y-2">
            <Label htmlFor="package-count" className="font-semibold text-foreground">
              Packages
            </Label>
            <Input
              id="package-count"
              type="number"
              min="1"
              max="100"
              value={packageCount}
              onChange={(e) => setPackageCount(e.target.value)}
              disabled={disabled}
              className="bg-input border-border focus-visible:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              Number of packages to deliver at this stop
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
