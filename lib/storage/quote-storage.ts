import type { PricingResult, ShippingFormData } from "@/lib/types";

export interface SavedQuote {
  id: string;
  timestamp: number;
  formData: Partial<ShippingFormData>;
  quote: PricingResult;
}

const STORAGE_KEY = "envia-saved-quotes";
const MAX_QUOTES = 10;

export function saveQuote(formData: Partial<ShippingFormData>, quote: PricingResult): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getSavedQuotes();
    const newQuote: SavedQuote = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      formData,
      quote,
    };

    const updated = [newQuote, ...existing].slice(0, MAX_QUOTES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save quote:", error);
  }
}

export function getSavedQuotes(): SavedQuote[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load saved quotes:", error);
    return [];
  }
}

export function deleteSavedQuote(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getSavedQuotes();
    const updated = existing.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete quote:", error);
  }
}
