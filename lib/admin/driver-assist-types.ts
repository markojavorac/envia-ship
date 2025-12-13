/**
 * Driver Assist - Type Definitions
 *
 * Types for the driver assist system that helps drivers process
 * delivery tickets and navigate to destinations using Waze/Google Maps.
 */

export interface DeliveryTicket {
  /** Unique identifier (UUID) */
  id: string;

  /** Driver ID (foreign key to drivers table) */
  driverId?: string;

  /** ENVÍA ticket barcode number (e.g., DTLNO1251452370) */
  ticketNumber?: string;

  /** Origin address from "Lugar de Recepción" section */
  originAddress: string;

  /** Destination address from "DESTINATARIO - Direccion" section */
  destinationAddress: string;

  /** Optional recipient name from DESTINATARIO section */
  recipientName?: string;

  /** Optional recipient phone from DESTINATARIO section */
  recipientPhone?: string;

  /** Package details or driver notes (from "Observaciones" or custom) */
  notes?: string;

  /** Base64 or object URL of uploaded ticket image/PDF */
  ticketImageUrl?: string;

  /** Cached geocoding result for origin (to avoid re-geocoding) */
  originCoordinates?: Coordinates;

  /** Cached geocoding result for destination (to avoid re-geocoding) */
  destinationCoordinates?: Coordinates;

  /** Whether the ticket has been marked as complete */
  isCompleted: boolean;

  /** Timestamp when ticket was created */
  createdAt: Date;

  /** Timestamp when navigation was started (for timer tracking) */
  navigationStartedAt?: Date;

  /** Timestamp when ticket was marked complete */
  completedAt?: Date;

  /** Optional sequence number for route optimization */
  sequenceNumber?: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingCache {
  [address: string]: {
    coordinates: Coordinates;
    cachedAt: number; // Timestamp
  };
}

export interface GeocodeResult {
  success: boolean;
  coordinates: Coordinates | null;
  error?: string;
}

export interface NavigationParams {
  origin: Coordinates;
  destination: Coordinates;
  originName?: string;
  destinationName?: string;
}
