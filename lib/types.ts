export interface Theme {
  name: string;
  displayName: string;
  companyName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  phone: string;
  email: string;
}

// Guatemala City zones
export const GUATEMALA_ZONES = [
  { value: "zona-1", label: "Zona 1 - Centro Histórico" },
  { value: "zona-4", label: "Zona 4" },
  { value: "zona-9", label: "Zona 9" },
  { value: "zona-10", label: "Zona 10 - Business District" },
  { value: "zona-11", label: "Zona 11" },
  { value: "zona-12", label: "Zona 12" },
  { value: "zona-13", label: "Zona 13" },
  { value: "zona-14", label: "Zona 14" },
  { value: "zona-15", label: "Zona 15" },
  { value: "zona-16", label: "Zona 16" },
] as const;

// Service types based on Envia offerings
export enum ServiceType {
  EXPRESS = "express",
  STANDARD = "standard",
  INTERNATIONAL = "international",
}

export const SERVICE_OPTIONS = [
  {
    value: ServiceType.EXPRESS,
    label: "Express (1-2 days)",
    description: "Fastest delivery for urgent packages",
    multiplier: 2.0,
  },
  {
    value: ServiceType.STANDARD,
    label: "Standard (3-5 days)",
    description: "Reliable delivery at standard rates",
    multiplier: 1.0,
  },
  {
    value: ServiceType.INTERNATIONAL,
    label: "International (5-10 days)",
    description: "Cross-border shipping services",
    multiplier: 3.5,
  },
] as const;

// Delivery timing options
export enum DeliveryTiming {
  ASAP = "asap",
  SCHEDULED = "scheduled",
}

// Package dimensions interface
export interface PackageDimensions {
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
}

// Shipping form data interface
export interface ShippingFormData {
  // Package details
  dimensions: PackageDimensions;

  // Locations
  pickupZone: string;
  pickupAddress?: string;
  dropoffZone: string;
  dropoffAddress?: string;

  // Service selection
  serviceType: ServiceType;

  // Delivery timing
  deliveryTiming: DeliveryTiming;
  scheduledDate?: Date;
  pickupTimeSlot?: TimeSlot;      // NEW
  deliveryTimeSlot?: TimeSlot;    // NEW
}

// Pricing calculation result
export interface PricingResult {
  basePrice: number;
  serviceMultiplier: number;
  dimensionalWeight: number;
  chargeableWeight: number;
  totalPrice: number;
  estimatedDelivery: string;
  breakdown: {
    label: string;
    value: string;
  }[];
}

// Time slot options
export enum TimeSlot {
  MORNING = "morning",      // 8am-12pm
  AFTERNOON = "afternoon",  // 12pm-5pm
  EVENING = "evening"       // 5pm-8pm
}

export const TIME_SLOT_OPTIONS = [
  { value: TimeSlot.MORNING, label: "Morning", time: "8:00 AM - 12:00 PM", icon: "sunrise" },
  { value: TimeSlot.AFTERNOON, label: "Afternoon", time: "12:00 PM - 5:00 PM", icon: "sun" },
  { value: TimeSlot.EVENING, label: "Evening", time: "5:00 PM - 8:00 PM", icon: "moon" },
] as const;
