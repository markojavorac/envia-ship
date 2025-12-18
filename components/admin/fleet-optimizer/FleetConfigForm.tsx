"use client";

/**
 * Fleet Configuration Form
 *
 * Allows users to configure their fleet by:
 * - Adding/removing vehicles from presets
 * - Setting depot location
 * - Configuring round trip option
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Warehouse } from "lucide-react";
import type { Vehicle, FleetConfig } from "@/lib/admin/fleet-types";
import type { RouteStop } from "@/lib/admin/route-types";
import { VEHICLE_TYPES, createVehicle } from "@/lib/admin/fleet-optimizer/vehicle-presets";

interface FleetConfigFormProps {
  config: FleetConfig | null;
  onChange: (config: FleetConfig) => void;
}

export function FleetConfigForm({ config, onChange }: FleetConfigFormProps) {
  const [depotAddress, setDepotAddress] = useState(config?.depot.address ?? "");
  const [returnToDepot, setReturnToDepot] = useState(config?.returnToDepot ?? true);

  const handleAddVehicle = (typeId: string) => {
    const existing = config?.vehicles ?? [];
    const typeName = VEHICLE_TYPES.find((t) => t.id === typeId)?.name ?? "Vehicle";
    const count = existing.filter((v) => v.vehicleTypeId === typeId).length + 1;

    const newVehicle = createVehicle(typeId, `${typeName} ${count}`);
    const updated = [...existing, newVehicle];

    onChange({
      ...config!,
      vehicles: updated,
    });
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    if (!config) return;

    const updated = config.vehicles.filter((v) => v.id !== vehicleId);
    onChange({
      ...config,
      vehicles: updated,
    });
  };

  const handleDepotChange = () => {
    if (!depotAddress || !config) return;

    // For MVP, just update address (geocoding would be done in main page)
    const updatedDepot: RouteStop = {
      ...config.depot,
      address: depotAddress,
    };

    onChange({
      ...config,
      depot: updatedDepot,
    });
  };

  const handleReturnToDepotChange = (checked: boolean) => {
    setReturnToDepot(checked);

    if (config) {
      onChange({
        ...config,
        returnToDepot: checked,
      });
    }
  };

  const totalCapacity = config?.vehicles.reduce((sum, v) => sum + v.packageCapacity, 0) ?? 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
          <Warehouse className="text-primary h-5 w-5" />
          Fleet Configuration
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Configure your delivery fleet and depot location
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        {/* Depot Configuration */}
        <div className="space-y-2">
          <Label htmlFor="depot" className="text-foreground font-semibold">
            Depot Location
          </Label>
          <div className="flex gap-2">
            <Input
              id="depot"
              value={depotAddress}
              onChange={(e) => setDepotAddress(e.target.value)}
              placeholder="Enter warehouse/depot address"
              className="bg-input border-border focus-visible:border-primary"
            />
            <Button onClick={handleDepotChange} variant="outline" className="font-semibold">
              Set
            </Button>
          </div>
        </div>

        {/* Round Trip Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="round-trip" className="text-foreground font-semibold">
              Return to Depot
            </Label>
            <p className="text-muted-foreground text-sm">
              Vehicles return to depot after completing routes
            </p>
          </div>
          <Switch
            id="round-trip"
            checked={returnToDepot}
            onCheckedChange={handleReturnToDepotChange}
          />
        </div>

        {/* Vehicle Presets */}
        <div className="space-y-3">
          <Label className="text-foreground font-semibold">Add Vehicles</Label>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLE_TYPES.map((type) => (
              <Button
                key={type.id}
                variant="outline"
                size="sm"
                onClick={() => handleAddVehicle(type.id)}
                className="font-semibold"
                style={{ borderColor: type.color }}
              >
                <Plus className="mr-1 h-4 w-4" />
                {type.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Fleet */}
        {config && config.vehicles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-semibold">Current Fleet</Label>
              <Badge variant="secondary" className="font-semibold">
                {totalCapacity} pkg total
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {config.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="border-border bg-background hover:bg-muted/50 flex items-center justify-between rounded-lg border p-2.5 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: vehicle.color }}
                    />
                    <span className="text-foreground truncate text-sm font-medium">
                      {vehicle.label}
                    </span>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {vehicle.packageCapacity}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-1 h-7 w-7 flex-shrink-0 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!config || config.vehicles.length === 0) && (
          <div className="text-muted-foreground py-8 text-center">
            <p>No vehicles added yet. Add vehicles using the buttons above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
