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
 * Mobile format: waze://?ll=destLat,destLng&navigate=yes
 * Web fallback: https://www.waze.com/ul?ll=destLat,destLng&navigate=yes
 * Waze will automatically route from the user's current location
 */
export function generateWazeUrl(params: NavigationParams, useMobileScheme = false): string {
  const { destination } = params;

  if (useMobileScheme) {
    // Use waze:// scheme for mobile apps
    return `waze://?ll=${destination.lat},${destination.lng}&navigate=yes`;
  } else {
    // Use web URL that redirects to app or opens in browser
    return `https://www.waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
  }
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
 * Returns the navigation app/service used: "waze" | "google-maps"
 */
export function openNavigation(params: NavigationParams): "waze" | "google-maps" {
  const googleMapsUrl = generateGoogleMapsUrl(params);

  if (isMobileDevice()) {
    // On mobile, use waze:// scheme first, with web fallback
    const wazeUrl = generateWazeUrl(params, true);

    // Try to open Waze app
    window.location.href = wazeUrl;

    // Fallback to web Waze after a short delay if app doesn't open
    setTimeout(() => {
      const wazeWebUrl = generateWazeUrl(params, false);
      window.open(wazeWebUrl, "_blank");
    }, 1000);

    return "waze";
  } else {
    // On desktop, use Google Maps (Waze is primarily mobile)
    window.open(googleMapsUrl, "_blank");
    return "google-maps";
  }
}

/**
 * Open Waze navigation explicitly
 */
export function openWaze(params: NavigationParams): void {
  if (isMobileDevice()) {
    const wazeUrl = generateWazeUrl(params, true);
    window.location.href = wazeUrl;
  } else {
    const wazeUrl = generateWazeUrl(params, false);
    window.open(wazeUrl, "_blank");
  }
}

/**
 * Open Google Maps navigation explicitly
 */
export function openGoogleMaps(params: NavigationParams): void {
  const googleMapsUrl = generateGoogleMapsUrl(params);
  window.open(googleMapsUrl, "_blank");
}
