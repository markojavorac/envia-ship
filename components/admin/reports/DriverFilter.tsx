"use client";

import { useState, useEffect } from "react";
import { User, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Driver {
  id: string;
  name: string;
  role: string;
}

interface DriverFilterProps {
  selectedDriverId: string | null;
  onChange: (driverId: string | null) => void;
}

export function DriverFilter({ selectedDriverId, onChange }: DriverFilterProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all drivers (hardcoded for now - could be API endpoint)
    const mockDrivers: Driver[] = [
      { id: "driver-001", name: "Carlos Mendez", role: "driver" },
      { id: "driver-002", name: "Maria Lopez", role: "driver" },
      { id: "driver-003", name: "Juan Garcia", role: "driver" },
    ];

    setDrivers(mockDrivers);
    setIsLoading(false);
  }, []);

  const handleClear = () => {
    onChange(null);
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading drivers...</div>;
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-full space-y-1 md:w-48">
        <Label htmlFor="driver-filter" className="text-foreground text-xs">
          Filter by Driver
        </Label>
        <Select
          value={selectedDriverId || "all"}
          onValueChange={(value) => onChange(value === "all" ? null : value)}
        >
          <SelectTrigger
            id="driver-filter"
            className="border-border bg-card text-foreground focus:border-primary focus:ring-primary/20"
          >
            <SelectValue placeholder="All drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <User className="text-primary h-4 w-4" />
                <span>All Drivers</span>
              </div>
            </SelectItem>
            {drivers.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span>{driver.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDriverId && (
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
