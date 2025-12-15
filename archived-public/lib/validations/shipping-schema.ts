import { z } from "zod";
import { ServiceType, DeliveryTiming, TimeSlot } from "../types";

export const shippingFormSchema = z
  .object({
    // Package dimensions
    length: z
      .number({ message: "Length is required" })
      .min(1, "Length must be at least 1 cm")
      .max(200, "Length cannot exceed 200 cm"),

    width: z
      .number({ message: "Width is required" })
      .min(1, "Width must be at least 1 cm")
      .max(200, "Width cannot exceed 200 cm"),

    height: z
      .number({ message: "Height is required" })
      .min(1, "Height must be at least 1 cm")
      .max(200, "Height cannot exceed 200 cm"),

    weight: z
      .number({ message: "Weight is required" })
      .min(0.1, "Weight must be at least 0.1 kg")
      .max(100, "Weight cannot exceed 100 kg"),

    // Pickup location
    pickupZone: z.string().min(1, "Pickup zone is required"),
    pickupAddress: z.string().optional(),

    // Dropoff location
    dropoffZone: z.string().min(1, "Drop-off zone is required"),
    dropoffAddress: z.string().optional(),

    // Service type
    serviceType: z.nativeEnum(ServiceType, {
      message: "Service type is required",
    }),

    // Delivery timing
    deliveryTiming: z.nativeEnum(DeliveryTiming),
    scheduledDate: z.date().optional(),
    pickupTimeSlot: z.nativeEnum(TimeSlot).optional(),
    deliveryTimeSlot: z.nativeEnum(TimeSlot).optional(),
  })
  .refine(
    (data) => {
      // If scheduled delivery, date must be provided and in the future
      if (data.deliveryTiming === DeliveryTiming.SCHEDULED) {
        if (!data.scheduledDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return data.scheduledDate >= today;
      }
      return true;
    },
    {
      message: "Scheduled date must be today or in the future",
      path: ["scheduledDate"],
    }
  );

export type ShippingFormValues = z.infer<typeof shippingFormSchema>;
