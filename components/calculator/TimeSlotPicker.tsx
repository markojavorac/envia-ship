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
    <Card className="border-2 border-primary/30 bg-white">
      <CardHeader className="pb-3">
        <Label className="text-sm font-semibold text-primary">{label}</Label>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-3 gap-2">
          {TIME_SLOT_OPTIONS.map((slot) => {
            const Icon = icons[slot.icon as keyof typeof icons];
            return (
              <label
                key={slot.value}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  value === slot.value
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={slot.value} className="sr-only" />
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">{slot.label}</div>
                  <div className="text-xs text-muted-foreground">{slot.time}</div>
                </div>
              </label>
            );
          })}
        </RadioGroup>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
