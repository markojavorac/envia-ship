import { MarketplaceView, UserPreferences } from "./types";
import { ServiceType } from "@/lib/types";

// Storage keys
const STORAGE_KEYS = {
  USER_ZONE: "envia_user_delivery_zone",
  UI_PREFERENCE: "envia_marketplace_view",
  SERVICE_PREFERENCE: "envia_service_type",
  ZONE_SET_DATE: "envia_zone_set_date",
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user's delivery zone
 */
export function getUserZone(): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.USER_ZONE);
  } catch {
    return null;
  }
}

/**
 * Set user's delivery zone
 */
export function setUserZone(zone: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ZONE, zone);
    localStorage.setItem(STORAGE_KEYS.ZONE_SET_DATE, new Date().toISOString());
  } catch (error) {
    console.error("Error saving user zone:", error);
  }
}

/**
 * Clear user's delivery zone
 */
export function clearUserZone(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_ZONE);
    localStorage.removeItem(STORAGE_KEYS.ZONE_SET_DATE);
  } catch (error) {
    console.error("Error clearing user zone:", error);
  }
}

/**
 * Check if user has set zone (used for showing modal)
 */
export function hasUserSetZone(): boolean {
  return getUserZone() !== null;
}

/**
 * Get when zone was set
 */
export function getZoneSetDate(): Date | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const dateStr = localStorage.getItem(STORAGE_KEYS.ZONE_SET_DATE);
    return dateStr ? new Date(dateStr) : null;
  } catch {
    return null;
  }
}

/**
 * Get user's preferred marketplace view
 */
export function getPreferredView(): MarketplaceView {
  if (!isLocalStorageAvailable()) return MarketplaceView.AMAZON;
  try {
    const view = localStorage.getItem(STORAGE_KEYS.UI_PREFERENCE);
    return (view as MarketplaceView) || MarketplaceView.AMAZON;
  } catch {
    return MarketplaceView.AMAZON;
  }
}

/**
 * Set user's preferred marketplace view
 */
export function setPreferredView(view: MarketplaceView): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.UI_PREFERENCE, view);
  } catch (error) {
    console.error("Error saving preferred view:", error);
  }
}

/**
 * Get user's preferred service type
 */
export function getPreferredServiceType(): ServiceType {
  if (!isLocalStorageAvailable()) return ServiceType.STANDARD;
  try {
    const serviceType = localStorage.getItem(STORAGE_KEYS.SERVICE_PREFERENCE);
    return (serviceType as ServiceType) || ServiceType.STANDARD;
  } catch {
    return ServiceType.STANDARD;
  }
}

/**
 * Set user's preferred service type
 */
export function setPreferredServiceType(serviceType: ServiceType): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SERVICE_PREFERENCE, serviceType);
  } catch (error) {
    console.error("Error saving preferred service type:", error);
  }
}

/**
 * Get all user preferences at once
 */
export function getUserPreferences(): UserPreferences {
  return {
    deliveryZone: getUserZone(),
    preferredView: getPreferredView(),
    preferredServiceType: getPreferredServiceType(),
  };
}

/**
 * Save all user preferences at once
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (preferences.deliveryZone !== undefined) {
    if (preferences.deliveryZone === null) {
      clearUserZone();
    } else {
      setUserZone(preferences.deliveryZone);
    }
  }
  if (preferences.preferredView !== undefined) {
    setPreferredView(preferences.preferredView);
  }
  if (preferences.preferredServiceType !== undefined) {
    setPreferredServiceType(preferences.preferredServiceType);
  }
}

/**
 * Clear all marketplace preferences
 */
export function clearAllPreferences(): void {
  if (!isLocalStorageAvailable()) return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Error clearing preferences:", error);
  }
}
