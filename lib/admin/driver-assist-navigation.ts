/**
 * Driver Assist - Navigation Deep Links
 *
 * Generates deep links for Waze and Google Maps navigation.
 * Waze is preferred on mobile, with Google Maps as fallback.
 */

import type { NavigationParams } from "./driver-assist-types";

/**
 * Generate Waze deep link for navigation
 *
 * Official format: https://waze.com/ul?ll=destLat,destLng&navigate=yes
 * This URL automatically opens the Waze app if installed on mobile,
 * or falls back to the web version if not available.
 * Waze will automatically route from the user's current location.
 *
 * Documentation: https://developers.google.com/waze/deeplinks
 */
export function generateWazeUrl(params: NavigationParams): string {
  const { destination } = params;

  // Use universal deep link (works for both app and web)
  // Note: Must be https://waze.com (NOT www.waze.com)
  return `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
}

/**
 * Generate Google Maps deep link for navigation
 *
 * Format: https://www.google.com/maps/dir/?api=1&origin=lat,lng&destination=lat,lng&travelmode=driving
 */
export function generateGoogleMapsUrl(params: NavigationParams): string {
  const { origin, destination } = params;

  const searchParams = new URLSearchParams({
    api: "1",
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${searchParams.toString()}`;
}

/**
 * Detect if user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detect if Waze app is likely installed (mobile only)
 * Note: We can't definitively detect app installation, so we just check mobile OS
 */
export function isWazeAvailable(): boolean {
  return isMobileDevice();
}

/**
 * Open navigation in Waze (mobile) or Google Maps (desktop/fallback)
 *
 * On mobile: Opens Waze app if installed, otherwise opens Waze web
 * On desktop: Opens Google Maps
 *
 * Returns the navigation app/service used: "waze" | "google-maps"
 */
export function openNavigation(params: NavigationParams): "waze" | "google-maps" {
  if (isMobileDevice()) {
    // On mobile, use Waze universal deep link
    // This automatically opens the app if installed, or web if not
    const wazeUrl = generateWazeUrl(params);
    window.location.href = wazeUrl;
    return "waze";
  } else {
    // On desktop, use Google Maps (Waze is primarily mobile)
    const googleMapsUrl = generateGoogleMapsUrl(params);
    window.open(googleMapsUrl, "_blank");
    return "google-maps";
  }
}

/**
 * Open Waze navigation explicitly
 */
export function openWaze(params: NavigationParams): void {
  const wazeUrl = generateWazeUrl(params);
  window.location.href = wazeUrl;
}

/**
 * Open Google Maps navigation explicitly
 */
export function openGoogleMaps(params: NavigationParams): void {
  const googleMapsUrl = generateGoogleMapsUrl(params);
  window.open(googleMapsUrl, "_blank");
}
