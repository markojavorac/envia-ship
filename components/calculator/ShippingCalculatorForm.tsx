"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Package2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ShippingFormValues,
  shippingFormSchema,
} from "@/lib/validations/shipping-schema";
import {
  GUATEMALA_ZONES,
  SERVICE_OPTIONS,
  DeliveryTiming,
  PricingResult,
} from "@/lib/types";
import { calculateShippingPrice } from "@/lib/shipping-calculator";
import { cn } from "@/lib/utils";
import PricingResultsCard from "./PricingResultsCard";
import TimeSlotPicker from "./TimeSlotPicker";

interface ShippingCalculatorFormProps {
  initialValues?: Partial<ShippingFormValues>;
}

export default function ShippingCalculatorForm({
  initialValues,
}: ShippingCalculatorFormProps = {}) {
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(
    null
  );
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      deliveryTiming: DeliveryTiming.ASAP,
      ...initialValues,
    },
  });

  // Update form when initialValues change (from AI analysis)
  useEffect(() => {
    if (initialValues) {
      Object.entries(initialValues).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof ShippingFormValues, value);
        }
      });
    }
  }, [initialValues, setValue]);

  const deliveryTiming = watch("deliveryTiming");
  const scheduledDate = watch("scheduledDate");

  const onSubmit = async (data: ShippingFormValues) => {
    setIsCalculating(true);

    // Simulate API delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = calculateShippingPrice(
      {
        length: data.length,
        width: data.width,
        height: data.height,
        weight: data.weight,
      },
      data.serviceType,
      data.deliveryTiming,
      data.scheduledDate
    );

    setPricingResult(result);
    setIsCalculating(false);
  };

  return (
    <div className="space-y-4">
      {/* Form Section */}
      <Card className="border-2 shadow-lg bg-white border-secondary/25">
        <CardHeader className="pb-3 border-b border-secondary/20">
          <CardTitle className="flex items-center gap-2 text-lg text-secondary font-bold">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-primary">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            Package Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Dimensions Section */}
            <Card className="border-2 bg-white border-primary/30">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold text-primary">Dimensions</h3>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="length" className="text-xs font-semibold">
                      L (cm)
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      placeholder="50"
                      {...register("length", { valueAsNumber: true })}
                    />
                    {errors.length && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.length.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs font-semibold">
                      W (cm)
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      placeholder="40"
                      {...register("width", { valueAsNumber: true })}
                    />
                    {errors.width && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.width.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs font-semibold">
                      H (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="30"
                      {...register("height", { valueAsNumber: true })}
                    />
                    {errors.height && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.height.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor="weight" className="text-xs font-semibold">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="5.0"
                    {...register("weight", { valueAsNumber: true })}
                  />
                  {errors.weight && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.weight.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Locations Section */}
            <Card className="border-2 bg-white border-primary/30">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold text-primary">Locations</h3>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pickupZone" className="text-xs font-semibold">
                    Pickup Location
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("pickupZone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {GUATEMALA_ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.pickupZone && (
                    <p className="text-xs text-destructive">
                      {errors.pickupZone.message}
                    </p>
                  )}
                  <Input
                    placeholder="Street address (optional)"
                    className="text-sm"
                    {...register("pickupAddress")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoffZone" className="text-xs font-semibold">
                    Drop-off Location
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("dropoffZone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {GUATEMALA_ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dropoffZone && (
                    <p className="text-xs text-destructive">
                      {errors.dropoffZone.message}
                    </p>
                  )}
                  <Input
                    placeholder="Street address (optional)"
                    className="text-sm"
                    {...register("dropoffAddress")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Type */}
            <Card className="border-2 bg-white border-primary/30">
              <CardHeader className="pb-3">
                <Label className="text-sm font-semibold text-primary">Service Type</Label>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ToggleGroup
                  type="single"
                  defaultValue={SERVICE_OPTIONS[1].value}
                  onValueChange={(value) => {
                    if (value) setValue("serviceType", value as any);
                  }}
                  className="grid grid-cols-3 gap-2"
                >
                  {SERVICE_OPTIONS.map((service) => (
                    <ToggleGroupItem
                      key={service.value}
                      value={service.value}
                      className="flex-col py-4 h-auto border-2 border-gray-200 bg-white data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary hover:border-primary/50"
                    >
                      <div className="text-sm font-semibold">
                        {service.label}
                      </div>
                      <div className="text-xs opacity-90">
                        {service.description.split(".")[0]}
                      </div>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {errors.serviceType && (
                  <p className="text-xs text-destructive mt-2">
                    {errors.serviceType.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Timing */}
            <Card className="border-2 bg-white border-primary/30">
              <CardHeader className="pb-3">
                <Label className="text-sm font-semibold text-primary">Delivery Timing</Label>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <RadioGroup
                  defaultValue={DeliveryTiming.ASAP}
                  onValueChange={(value) =>
                    setValue("deliveryTiming", value as DeliveryTiming)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={DeliveryTiming.ASAP} id="asap" />
                    <Label
                      htmlFor="asap"
                      className="text-sm font-normal cursor-pointer"
                    >
                      As soon as possible
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={DeliveryTiming.SCHEDULED}
                      id="scheduled"
                    />
                    <Label
                      htmlFor="scheduled"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Schedule for later
                    </Label>
                  </div>
                </RadioGroup>

                {deliveryTiming === DeliveryTiming.SCHEDULED && (
                  <div className="pt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !scheduledDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? (
                            format(scheduledDate, "PPP")
                          ) : (
                            <span>Pick a delivery date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={(date) => setValue("scheduledDate", date)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.scheduledDate && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.scheduledDate.message}
                      </p>
                    )}

                    {/* Time Slot Pickers */}
                    <div className="space-y-3 pt-3">
                      <TimeSlotPicker
                        label="Pickup Time"
                        value={watch("pickupTimeSlot")}
                        onChange={(value) => setValue("pickupTimeSlot", value)}
                        error={errors.pickupTimeSlot?.message}
                      />

                      <TimeSlotPicker
                        label="Delivery Time"
                        value={watch("deliveryTimeSlot")}
                        onChange={(value) => setValue("deliveryTimeSlot", value)}
                        error={errors.deliveryTimeSlot?.message}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full shadow-lg bg-primary text-white hover:bg-primary/90"
              size="lg"
              disabled={isCalculating}
            >
              {isCalculating ? "Calculating..." : "Calculate Shipping Cost"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <PricingResultsCard result={pricingResult} />
    </div>
  );
}
