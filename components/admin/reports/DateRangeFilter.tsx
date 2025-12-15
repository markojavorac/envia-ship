"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { startDate: Date | null; endDate: Date | null }) => void;
}

export function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const handleStartDateChange = (value: string) => {
    onChange({
      startDate: value ? new Date(value) : null,
      endDate,
    });
  };

  const handleEndDateChange = (value: string) => {
    onChange({
      startDate,
      endDate: value ? new Date(value) : null,
    });
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-3">
      {/* Start Date */}
      <div className="space-y-1">
        <Label htmlFor="start-date" className="text-foreground text-xs">
          Start Date
        </Label>
        <Input
          id="start-date"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border-border bg-card text-foreground focus:border-primary focus:ring-primary/20"
        />
      </div>

      {/* End Date */}
      <div className="space-y-1">
        <Label htmlFor="end-date" className="text-foreground text-xs">
          End Date
        </Label>
        <Input
          id="end-date"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={(e) => handleEndDateChange(e.target.value)}
          min={formatDateForInput(startDate)}
          className="border-border bg-card text-foreground focus:border-primary focus:ring-primary/20"
        />
      </div>
    </div>
  );
}
