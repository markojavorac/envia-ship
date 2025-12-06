"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, MapPinned, FlagIcon } from "lucide-react";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { RouteStop, RouteConfig, GeocodingResult } from "@/lib/admin/route-types";
import { generateStopId } from "@/lib/admin/route-utils";

interface RouteBuilderFormProps {
  /** Current route configuration */
  config: RouteConfig;
  /** Callback when configuration changes */
  onConfigChange: (config: RouteConfig) => void;
  /** Callback when a new stop is added */
  onAddStop: (stop: RouteStop) => void;
  /** Current number of stops */
  currentStopCount: number;
  /** Maximum stops allowed */
  maxStops?: number;
}

export function RouteBuilderForm({
  config,
  onConfigChange,
  onAddStop,
  currentStopCount,
  maxStops = 25,
}: RouteBuilderFormProps) {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [stopAddress, setStopAddress] = useState("");

  const canAddStop = currentStopCount < maxStops;

  const handleStartSelect = (result: GeocodingResult) => {
    const startPoint: RouteStop = {
      id: generateStopId(),
      address: result.address,
      coordinates: result.coordinates,
      zone: result.zone,
    };

    onConfigChange({
      ...config,
      startPoint,
    });

    setStartAddress(result.displayName);
  };

  const handleEndSelect = (result: GeocodingResult) => {
    const endPoint: RouteStop = {
      id: generateStopId(),
      address: result.address,
      coordinates: result.coordinates,
      zone: result.zone,
    };

    onConfigChange({
      ...config,
      endPoint,
    });

    setEndAddress(result.displayName);
  };

  const handleStopSelect = (result: GeocodingResult) => {
    const newStop: RouteStop = {
      id: generateStopId(),
      address: result.address,
      coordinates: result.coordinates,
      zone: result.zone,
    };

    onAddStop(newStop);
    setStopAddress(""); // Clear input after adding
  };

  const handleRoundTripChange = (checked: boolean) => {
    onConfigChange({
      ...config,
      isRoundTrip: checked,
    });
  };

  const handleClearStart = () => {
    onConfigChange({
      ...config,
      startPoint: undefined,
    });
    setStartAddress("");
  };

  const handleClearEnd = () => {
    onConfigChange({
      ...config,
      endPoint: undefined,
    });
    setEndAddress("");
  };

  return (
    <div className="space-y-4">
      {/* Route Configuration Card */}
      <Card className="bg-card border-border border">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
            <MapPinned className="h-5 w-5" />
            Route Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Start Point */}
          <div className="space-y-2">
            <Label htmlFor="start-point" className="text-foreground font-semibold">
              Start Point (Optional)
            </Label>
            <div className="flex gap-2">
              <AddressAutocomplete
                value={startAddress}
                onChange={setStartAddress}
                onSelect={handleStartSelect}
                placeholder="Enter starting location..."
                className="flex-1"
              />
              {config.startPoint && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearStart}
                  className="border-border border"
                >
                  Clear
                </Button>
              )}
            </div>
            {config.startPoint && (
              <p className="text-xs text-green-500">
                ✓ Start point set: {config.startPoint.address}
              </p>
            )}
            {!config.startPoint && (
              <p className="text-muted-foreground text-xs">
                If not set, first stop will be used as starting point
              </p>
            )}
          </div>

          {/* Round Trip Toggle */}
          <div className="bg-muted flex items-center justify-between rounded-md p-3">
            <div className="space-y-0.5">
              <Label htmlFor="round-trip" className="text-foreground font-semibold">
                Round Trip
              </Label>
              <p className="text-muted-foreground text-xs">
                Return to start point after completing all stops
              </p>
            </div>
            <Switch
              id="round-trip"
              checked={config.isRoundTrip}
              onCheckedChange={handleRoundTripChange}
            />
          </div>

          {/* End Point (only if not round trip) */}
          {!config.isRoundTrip && (
            <div className="space-y-2">
              <Label
                htmlFor="end-point"
                className="text-foreground flex items-center gap-2 font-semibold"
              >
                <FlagIcon className="h-4 w-4" />
                End Point (Optional)
              </Label>
              <div className="flex gap-2">
                <AddressAutocomplete
                  value={endAddress}
                  onChange={setEndAddress}
                  onSelect={handleEndSelect}
                  placeholder="Enter ending location..."
                  className="flex-1"
                />
                {config.endPoint && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearEnd}
                    className="border-border border"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {config.endPoint && (
                <p className="text-xs text-green-500">✓ End point set: {config.endPoint.address}</p>
              )}
            </div>
          )}

          {config.isRoundTrip && (
            <div className="bg-primary/10 border-primary rounded-md border-l-4 p-3">
              <p className="text-primary text-xs">
                ℹ️ Round trip enabled - route will return to start point
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Destinations Card */}
      <Card className="bg-card border-border border">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary flex items-center gap-2 text-lg font-bold">
            <Plus className="h-5 w-5" />
            Add Destinations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="add-stop" className="text-foreground font-semibold">
              Delivery Address
            </Label>
            <div className="flex gap-2">
              <AddressAutocomplete
                value={stopAddress}
                onChange={setStopAddress}
                onSelect={handleStopSelect}
                placeholder="Enter delivery address..."
                disabled={!canAddStop}
                className="flex-1"
              />
            </div>

            {/* Stop counter */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Stops: {currentStopCount} / {maxStops}
              </p>
              {currentStopCount < 2 && (
                <p className="text-primary font-medium">Add at least 2 stops to optimize</p>
              )}
              {!canAddStop && <p className="text-destructive font-medium">Maximum stops reached</p>}
            </div>
          </div>

          {/* Helper text */}
          <div className="bg-primary/10 border-primary rounded-md border-l-4 p-3">
            <p className="text-foreground text-xs">
              💡 <strong>Tip:</strong> Add stops in any order. The optimization algorithm will find
              the best route to visit all locations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
