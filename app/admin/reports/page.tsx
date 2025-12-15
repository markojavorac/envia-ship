"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCcw,
  Calendar,
  FileText,
  Download,
  Database,
  TestTube,
} from "lucide-react";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { Button } from "@/components/ui/button";
import { TripHistoryTable } from "@/components/admin/reports/TripHistoryTable";
import { DateRangeFilter } from "@/components/admin/reports/DateRangeFilter";
import { DriverFilter } from "@/components/admin/reports/DriverFilter";
import { toast } from "sonner";
import Papa from "papaparse";
import { generatePDFReport } from "@/lib/reports/pdf-export";
import { getMockTrips } from "@/lib/admin/mock-driver-assist";
import { AdminInfoBox } from "@/components/admin/ui";

interface TripData {
  id: string;
  ticketNumber?: string;
  driverName: string;
  driverId: string;
  originAddress: string;
  destinationAddress: string;
  createdAt: Date;
  navigationStartedAt?: Date;
  completedAt?: Date;
  durationMs: number | null;
  durationMinutes: number | null;
}

/**
 * Admin Reports Dashboard
 *
 * Displays trip history with:
 * - Data source toggle (Mock/Database)
 * - Filterable trip history table (by driver and date range)
 * - CSV and PDF export capability
 * - Auto-refresh
 */
export default function ReportsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data source toggle: 'mock' or 'database'
  const [dataSource, setDataSource] = useState<"mock" | "database">("mock");

  // Filters
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Fetch data from either mock or database
  const fetchData = useCallback(
    async (showRefreshToast = false) => {
      setIsRefreshing(true);

      try {
        if (dataSource === "mock") {
          // Load mock data
          let allTrips = getMockTrips();

          // Apply driver filter
          if (selectedDriverId) {
            allTrips = allTrips.filter((trip: any) => trip.driverId === selectedDriverId);
          }

          // Apply date range filter
          if (dateRange.startDate || dateRange.endDate) {
            allTrips = allTrips.filter((trip: any) => {
              const completedDate = trip.completedAt;
              if (!completedDate) return false;

              if (dateRange.startDate && completedDate < dateRange.startDate) {
                return false;
              }
              if (dateRange.endDate && completedDate > dateRange.endDate) {
                return false;
              }
              return true;
            });
          }

          setTrips(allTrips);
        } else {
          // Load from database via API
          const params = new URLSearchParams();
          if (selectedDriverId) params.append("driverId", selectedDriverId);
          if (dateRange.startDate) params.append("startDate", dateRange.startDate.toISOString());
          if (dateRange.endDate) params.append("endDate", dateRange.endDate.toISOString());

          const tripsResponse = await fetch(`/api/reports/trips?${params}`);

          if (!tripsResponse.ok) {
            throw new Error("Failed to fetch data from database");
          }

          const tripsData = await tripsResponse.json();

          // Convert date strings to Date objects
          const parsedTrips = tripsData.trips.map((trip: any) => ({
            ...trip,
            createdAt: new Date(trip.createdAt),
            navigationStartedAt: trip.navigationStartedAt
              ? new Date(trip.navigationStartedAt)
              : undefined,
            completedAt: trip.completedAt ? new Date(trip.completedAt) : undefined,
          }));

          setTrips(parsedTrips);
        }

        if (showRefreshToast) {
          toast.success("Reports refreshed");
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [dataSource, selectedDriverId, dateRange]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CSV Export
  const handleExportCSV = () => {
    if (trips.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const csvData = trips.map((trip) => ({
      "Ticket Number": trip.ticketNumber || "N/A",
      Driver: trip.driverName,
      "Origin Address": trip.originAddress,
      "Destination Address": trip.destinationAddress,
      "Created At": trip.createdAt.toLocaleString(),
      "Navigation Started": trip.navigationStartedAt?.toLocaleString() || "N/A",
      "Completed At": trip.completedAt?.toLocaleString() || "N/A",
      "Duration (minutes)": trip.durationMinutes ?? "N/A",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `envia-trip-history-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully");
  };

  // PDF Export
  const handleExportPDF = () => {
    if (trips.length === 0) {
      toast.warning("No data to export");
      return;
    }

    try {
      // Get selected driver name
      const selectedDriverName = selectedDriverId
        ? trips.find((t) => t.driverId === selectedDriverId)?.driverName
        : null;

      const filename = generatePDFReport({
        trips,
        selectedDriver: selectedDriverName,
        dateRange,
      });

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 pt-6">
      {/* Header */}
      <AdminPageTitle
        title="Reports & Analytics"
        description="View trip history and driver performance metrics"
      />

      {/* Data Source Toggle */}
      <div className="w-full max-w-full border-border bg-card rounded-lg border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {dataSource === "mock" ? (
                <TestTube className="text-primary h-5 w-5" />
              ) : (
                <Database className="text-primary h-5 w-5" />
              )}
              <span className="text-foreground font-semibold">Data Source</span>
            </div>
            <AdminInfoBox variant={dataSource === "mock" ? "warning" : "info"}>
              {dataSource === "mock"
                ? "Using mock data - switch to Database to view real trips from Turso"
                : "Using real database - viewing actual trips from Turso"}
            </AdminInfoBox>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setDataSource("mock");
                setIsLoading(true);
              }}
              variant={dataSource === "mock" ? "default" : "outline"}
              size="sm"
              className={
                dataSource === "mock"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <TestTube className="mr-2 h-4 w-4" />
              Mock Data
            </Button>

            <Button
              onClick={() => {
                setDataSource("database");
                setIsLoading(true);
              }}
              variant={dataSource === "database" ? "default" : "outline"}
              size="sm"
              className={
                dataSource === "database"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border-border text-foreground hover:bg-muted"
              }
            >
              <Database className="mr-2 h-4 w-4" />
              Database
            </Button>
          </div>
        </div>
      </div>

      {/* Filters & Export */}
      <div className="w-full max-w-full border-border bg-card rounded-lg border p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            <span className="text-foreground font-semibold">Filters & Export</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {trips.length} {trips.length === 1 ? "result" : "results"} to export
            </span>
            <Button
              onClick={handleExportPDF}
              disabled={trips.length === 0}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              onClick={handleExportCSV}
              disabled={trips.length === 0}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <DriverFilter selectedDriverId={selectedDriverId} onChange={setSelectedDriverId} />
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
        </div>
      </div>

      {/* Trip History Table */}
      <TripHistoryTable trips={trips} isLoading={isRefreshing} />
    </div>
  );
}
