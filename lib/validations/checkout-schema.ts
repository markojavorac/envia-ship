import { z } from "zod";
import { ServiceType } from "@/lib/types";

export const checkoutSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
  deliveryZone: z.string().min(1, "Delivery zone is required"),
  deliveryAddress: z
    .string()
    .min(10, "Please enter a complete delivery address")
    .max(200, "Address is too long"),
  serviceType: z.nativeEnum(ServiceType, {
    errorMap: () => ({ message: "Please select a service type" }),
  }),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  customerPhone: z
    .string()
    .regex(/^[0-9]{8}$/, "Phone number must be 8 digits"),
  customerEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
