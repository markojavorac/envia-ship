/**
 * CSV Parser Utility for Route Planner
 *
 * Parses and validates CSV files for route import
 */

import Papa from "papaparse";

/**
 * Row structure from CSV file
 */
export interface CSVRow {
  address: string;
  notes?: string;
  zone?: string;
}

/**
 * Parse result with data and validation errors
 */
export interface ParseResult {
  success: boolean;
  data: CSVRow[];
  errors: string[];
}

/**
 * Parse a CSV file for route import
 *
 * Expected format:
 * - Required column: "address"
 * - Optional columns: "notes", "zone"
 *
 * @param file CSV file to parse
 * @returns Promise with parsed data and validation errors
 */
export function parseRouteCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      transform: (value) => value.trim(),
      complete: (results) => {
        const errors: string[] = [];
        const data: CSVRow[] = [];

        // Check for parsing errors
        if (results.errors.length > 0) {
          results.errors.forEach((error) => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }

        // Validate required "address" column exists
        if (results.data.length > 0) {
          const firstRow = results.data[0];
          if (!("address" in firstRow)) {
            errors.push(
              'Missing required column "address". Please ensure your CSV has an "address" header.'
            );
            resolve({ success: false, data: [], errors });
            return;
          }
        }

        // Validate and transform rows
        results.data.forEach((row, index) => {
          const address = row.address;
          const notes = row.notes;
          const zone = row.zone;

          // Validate address is not empty
          if (!address || address.trim().length === 0) {
            errors.push(`Row ${index + 2}: Address is empty`);
            return;
          }

          // Validate address length
          if (address.length < 3) {
            errors.push(`Row ${index + 2}: Address too short (minimum 3 characters)`);
            return;
          }

          // Add valid row
          data.push({
            address,
            notes: notes && notes.length > 0 ? notes : undefined,
            zone: zone && zone.length > 0 ? zone : undefined,
          });
        });

        // Check if we have any valid data
        if (data.length === 0 && errors.length === 0) {
          errors.push("CSV file is empty or contains no valid addresses");
        }

        // Check for duplicates
        const addresses = data.map((row) => row.address.toLowerCase());
        const duplicates = addresses.filter((addr, index) => addresses.indexOf(addr) !== index);
        if (duplicates.length > 0) {
          errors.push(
            `Warning: Found ${duplicates.length} duplicate address(es). They will all be imported.`
          );
        }

        resolve({
          success: errors.length === 0 || data.length > 0,
          data,
          errors,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse CSV: ${error.message}`],
        });
      },
    });
  });
}

/**
 * Validate CSV row count against max stops limit
 */
export function validateStopCount(
  currentStops: number,
  newStops: number,
  maxStops: number = 25
): { valid: boolean; error?: string } {
  const totalStops = currentStops + newStops;

  if (totalStops > maxStops) {
    return {
      valid: false,
      error: `Total stops would be ${totalStops}, which exceeds the maximum of ${maxStops}. Please remove ${totalStops - maxStops} stops first.`,
    };
  }

  if (newStops > maxStops) {
    return {
      valid: false,
      error: `CSV contains ${newStops} addresses, but maximum is ${maxStops}. Please reduce the number of addresses.`,
    };
  }

  return { valid: true };
}
