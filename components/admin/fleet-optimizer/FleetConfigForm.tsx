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
import {
  VEHICLE_TYPES,
  createVehicle,
} from "@/lib/admin/fleet-optimizer/vehicle-presets";

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

  const totalCapacity =
    config?.vehicles.reduce((sum, v) => sum + v.packageCapacity, 0) ?? 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <Warehouse className="h-5 w-5 text-primary" />
          Fleet Configuration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your delivery fleet and depot location
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {/* Depot Configuration */}
        <div className="space-y-2">
          <Label htmlFor="depot" className="font-semibold text-foreground">
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
            <Label htmlFor="round-trip" className="font-semibold text-foreground">
              Return to Depot
            </Label>
            <p className="text-sm text-muted-foreground">
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
          <Label className="font-semibold text-foreground">Add Vehicles</Label>
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
                <Plus className="h-4 w-4 mr-1" />
                {type.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Fleet */}
        {config && config.vehicles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-foreground">Current Fleet</Label>
              <Badge variant="secondary" className="font-semibold">
                {totalCapacity} pkg total
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {config.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: vehicle.color }}
                    />
                    <span className="font-medium text-foreground text-sm truncate">{vehicle.label}</span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {vehicle.packageCapacity}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveVehicle(vehicle.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-1"
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
          <div className="text-center py-8 text-muted-foreground">
            <p>No vehicles added yet. Add vehicles using the buttons above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
