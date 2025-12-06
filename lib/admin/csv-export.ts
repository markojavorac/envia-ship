/**
 * CSV Export Utility for Route Planner
 *
 * Exports optimized routes to CSV format for driver use
 */

import { OptimizedRoute } from "./route-types";
import { haversineDistance } from "./route-utils";

/**
 * Export an optimized route to CSV file
 *
 * Format includes:
 * - Sequence number
 * - Address
 * - Zone
 * - Coordinates (lat/lng)
 * - Distance to next stop
 * - Estimated time to next stop
 * - Notes
 * - Summary section with totals
 */
export function exportRouteToCSV(optimizedRoute: OptimizedRoute): void {
  // Build CSV content
  const csvContent = generateCSVContent(optimizedRoute);

  // Generate filename with timestamp
  const fileName = generateFileName();

  // Trigger download
  downloadCSV(csvContent, fileName);
}

/**
 * Generate CSV content from optimized route
 */
function generateCSVContent(optimizedRoute: OptimizedRoute): string {
  const rows: string[][] = [];

  // Header row
  rows.push([
    "Sequence",
    "Address",
    "Zone",
    "Latitude",
    "Longitude",
    "Distance to Next (km)",
    "Est. Time (min)",
    "Notes",
  ]);

  // Stop rows
  optimizedRoute.optimizedStops.forEach((stop, index) => {
    const nextStop = optimizedRoute.optimizedStops[index + 1];

    // Calculate distance and time to next stop
    const distanceToNext = nextStop ? haversineDistance(stop.coordinates, nextStop.coordinates) : 0;
    const timeToNext = nextStop ? Math.round((distanceToNext / 30) * 60) : 0;

    rows.push([
      (index + 1).toString(),
      stop.address,
      stop.zone || "",
      stop.coordinates.lat.toFixed(6),
      stop.coordinates.lng.toFixed(6),
      distanceToNext > 0 ? distanceToNext.toFixed(1) : "",
      timeToNext > 0 ? timeToNext.toString() : "",
      stop.notes || "",
    ]);
  });

  // Empty row separator
  rows.push(["", "", "", "", "", "", "", ""]);

  // Summary section
  rows.push(["SUMMARY", "", "", "", "", "", "", ""]);
  rows.push([
    "Total Stops",
    optimizedRoute.optimizedStops.length.toString(),
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Total Distance",
    `${optimizedRoute.totalDistance.toFixed(1)} km`,
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push(["Total Time", `${optimizedRoute.totalTime} minutes`, "", "", "", "", "", ""]);
  rows.push([
    "Distance Saved",
    optimizedRoute.distanceSaved ? `${optimizedRoute.distanceSaved.toFixed(1)} km` : "N/A",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Time Saved",
    optimizedRoute.timeSaved ? `${optimizedRoute.timeSaved} minutes` : "N/A",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Improvement",
    optimizedRoute.improvementPercent ? `${optimizedRoute.improvementPercent.toFixed(1)}%` : "N/A",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push(["Optimized At", optimizedRoute.optimizedAt.toLocaleString(), "", "", "", "", "", ""]);
  rows.push(["Optimization Mode", optimizedRoute.optimizationMode, "", "", "", "", "", ""]);

  // Convert to CSV string
  return rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const cellStr = cell.toString();
          if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(",")
    )
    .join("\n");
}

/**
 * Generate filename with timestamp
 */
function generateFileName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `route-optimized-${year}-${month}-${day}-${hours}${minutes}.csv`;
}

/**
 * Trigger browser download of CSV file
 */
function downloadCSV(csvContent: string, fileName: string): void {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create temporary download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
