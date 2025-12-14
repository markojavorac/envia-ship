"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3, Download, RefreshCcw, Calendar, FileText } from "lucide-react";
import { AdminPageTitle } from "@/components/admin/ui/AdminPageTitle";
import { Button } from "@/components/ui/button";
import { TripHistoryTable } from "@/components/admin/reports/TripHistoryTable";
import { DriverPerformanceCards } from "@/components/admin/reports/DriverPerformanceCards";
import { DateRangeFilter } from "@/components/admin/reports/DateRangeFilter";
import { DriverFilter } from "@/components/admin/reports/DriverFilter";
import { toast } from "sonner";
import Papa from "papaparse";
import { generatePDFReport } from "@/lib/reports/pdf-export";
import { getMockTrips, getMockPerformanceMetrics } from "@/lib/admin/mock-driver-assist";

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

interface PerformanceMetric {
  driverId: string;
  driverName: string;
  totalTickets: number;
  totalCompleted: number;
  completionRate: number;
  avgDurationMinutes: number;
  fastestMinutes: number;
  slowestMinutes: number;
}

/**
 * Admin Reports Dashboard
 *
 * Displays trip history and driver performance metrics with:
 * - Filterable trip history table
 * - Driver performance cards
 * - CSV export capability
 * - Auto-refresh (optional)
 */
export default function ReportsPage() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Fetch data from mock data source
  const fetchData = useCallback(
    (showRefreshToast = false) => {
      setIsRefreshing(true);

      try {
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

        // Get performance metrics (filtered by driver if applicable)
        const allMetrics = getMockPerformanceMetrics();
        const filteredMetrics = selectedDriverId
          ? allMetrics.filter((m: any) => m.driverId === selectedDriverId)
          : allMetrics;

        setTrips(allTrips);
        setMetrics(filteredMetrics);

        if (showRefreshToast) {
          toast.success("Reports refreshed");
        }
      } catch (error) {
        console.error("Error loading mock reports:", error);
        toast.error("Failed to load reports");
      } finally {
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [selectedDriverId, dateRange]
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
    <div className="space-y-6">
      {/* Header */}
      <AdminPageTitle
        title="Reports & Analytics"
        description="View trip history and driver performance metrics"
        actions={
          <Button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-muted"
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Performance Metrics */}
      <DriverPerformanceCards metrics={metrics} isLoading={isRefreshing} />

      {/* Filters & Export */}
      <div className="border-border bg-card rounded-lg border p-4">
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
