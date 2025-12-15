"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Driver {
  id: string;
  name: string;
  phone: string;
  is_active: number;
}

interface DriverSelectProps {
  value: string | null;
  onValueChange: (driverId: string) => void;
}

/**
 * DriverSelect Component
 *
 * Dropdown to select a driver for route assignment
 * Fetches active drivers from the database
 */
export function DriverSelect({ value, onValueChange }: DriverSelectProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drivers");
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();
      setDrivers(data.drivers || []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError("Failed to load drivers");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading drivers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted p-3">
        <p className="text-sm text-muted-foreground">
          No active drivers available. Please create a driver first.
        </p>
      </div>
    );
  }

  const activeDrivers = drivers.filter((d) => d.is_active === 1);

  return (
    <div className="space-y-2">
      <Label htmlFor="driver-select" className="text-foreground font-semibold">
        Assign to Driver
      </Label>
      <Select value={value || undefined} onValueChange={onValueChange}>
        <SelectTrigger
          id="driver-select"
          className="border-border bg-card focus:border-primary focus:ring-primary/20 w-full border-2"
        >
          <SelectValue placeholder="Select a driver" />
        </SelectTrigger>
        <SelectContent>
          {activeDrivers.map((driver) => (
            <SelectItem key={driver.id} value={driver.id}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{driver.name}</span>
                <span className="text-muted-foreground text-xs">{driver.phone}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <p className="text-muted-foreground text-xs">
          Route will be assigned to {activeDrivers.find((d) => d.id === value)?.name}
        </p>
      )}
    </div>
  );
}
