import { z } from "zod";
import { ProductCategory } from "@/lib/marketplace/types";

/**
 * Validation schema for product onboarding form
 * Used in ReviewEditStep to validate seller inputs before saving
 */
export const productOnboardingSchema = z.object({
  // Basic product info
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .trim(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .trim(),

  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description cannot exceed 200 characters")
    .trim(),

  // Pricing (required - user must enter)
  price: z
    .number({
      message: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .max(999999, "Price cannot exceed Q999,999"),

  // Category
  category: z.nativeEnum(ProductCategory, {
    message: "Invalid category selected",
  }),

  // Images
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),

  thumbnail: z.string().url("Invalid thumbnail URL"),

  // Physical characteristics
  weight: z
    .number({
      message: "Weight must be a number",
    })
    .positive("Weight must be greater than 0")
    .max(1000, "Weight cannot exceed 1000kg"),

  dimensions: z.object({
    length: z
      .number({ message: "Length must be a number" })
      .positive("Length must be greater than 0")
      .max(500, "Length cannot exceed 500cm"),
    width: z
      .number({ message: "Width must be a number" })
      .positive("Width must be greater than 0")
      .max(500, "Width cannot exceed 500cm"),
    height: z
      .number({ message: "Height must be a number" })
      .positive("Height must be greater than 0")
      .max(500, "Height cannot exceed 500cm"),
  }),

  // Tags
  tags: z
    .array(z.string().trim().min(2).max(20))
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),

  // Inventory
  stock: z
    .number({
      message: "Stock must be a number",
    })
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative")
    .max(999999, "Stock cannot exceed 999,999"),

  // Location
  originZone: z
    .string({ message: "Origin zone must be a string" })
    .min(1, "Origin zone is required"),

  // Seller info (optional - can be auto-filled from admin context)
  seller: z
    .object({
      name: z.string().min(2).max(100),
      rating: z.number().min(0).max(5),
      verified: z.boolean(),
    })
    .optional(),
});

export type ProductOnboardingFormData = z.infer<typeof productOnboardingSchema>;

/**
 * Partial schema for validating individual fields during editing
 */
export const partialProductOnboardingSchema = productOnboardingSchema.partial();

/**
 * Schema for image upload validation
 */
export const imageUploadSchema = z.object({
  files: z
    .array(
      z
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, {
          message: "Each image must be less than 10MB",
        })
        .refine(
          (file) =>
            ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
          {
            message: "Only JPEG, PNG, and WebP images are allowed",
          }
        )
    )
    .min(1, "At least one image is required")
    .max(5, "Maximum 5 images allowed"),
});

export type ImageUploadData = z.infer<typeof imageUploadSchema>;
