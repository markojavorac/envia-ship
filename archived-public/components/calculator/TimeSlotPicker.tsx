"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sunrise, Sun, Moon } from "lucide-react";
import { TIME_SLOT_OPTIONS, TimeSlot } from "@/lib/types";

interface TimeSlotPickerProps {
  label: string;
  value?: TimeSlot;
  onChange: (value: TimeSlot) => void;
  error?: string;
}

export default function TimeSlotPicker({ label, value, onChange, error }: TimeSlotPickerProps) {
  const icons = { sunrise: Sunrise, sun: Sun, moon: Moon };

  return (
    <Card className="border-primary/30 bg-card border-2">
      <CardHeader className="pb-3">
        <Label className="text-primary text-sm font-semibold">{label}</Label>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-3 gap-2">
          {TIME_SLOT_OPTIONS.map((slot) => {
            const Icon = icons[slot.icon as keyof typeof icons];
            return (
              <label
                key={slot.value}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                  value === slot.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "hover:border-primary/50 border-border"
                }`}
              >
                <RadioGroupItem value={slot.value} className="sr-only" />
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">{slot.label}</div>
                  <div className="text-muted-foreground text-xs">{slot.time}</div>
                </div>
              </label>
            );
          })}
        </RadioGroup>
        {error && <p className="text-destructive mt-2 text-xs">{error}</p>}
      </CardContent>
    </Card>
  );
}
