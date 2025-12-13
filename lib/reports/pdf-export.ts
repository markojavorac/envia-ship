/**
 * PDF Export Utility
 *
 * Generates branded PDF reports with Envia logo and styling
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TripData {
  ticketNumber?: string;
  driverName: string;
  originAddress: string;
  destinationAddress: string;
  completedAt?: Date;
  durationMinutes: number | null;
}

interface ExportOptions {
  trips: TripData[];
  filterSummary?: string;
  selectedDriver?: string | null;
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

/**
 * Generate and download branded PDF report
 */
export function generatePDFReport(options: ExportOptions) {
  const { trips, filterSummary, selectedDriver, dateRange } = options;

  // Create new PDF (A4 landscape for better table width)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors (Envia brand)
  const primaryColor = "#FF8C00"; // Orange
  const secondaryColor = "#1E3A5F"; // Navy

  // Header with branding
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Company name
  doc.setTextColor("#FFFFFF");
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("ENVÍA", 15, 16);

  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Trip History Report", pageWidth - 15, 16, { align: "right" });

  // Report metadata
  let yPos = 35;
  doc.setTextColor(secondaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated: ${today}`, 15, yPos);

  // Filter summary
  if (selectedDriver || (dateRange?.startDate && dateRange?.endDate)) {
    yPos += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Filters Applied:", 15, yPos);
    doc.setFont("helvetica", "normal");

    if (selectedDriver) {
      yPos += 5;
      doc.text(`• Driver: ${selectedDriver}`, 20, yPos);
    }

    if (dateRange?.startDate && dateRange?.endDate) {
      yPos += 5;
      const start = dateRange.startDate.toLocaleDateString("en-US");
      const end = dateRange.endDate.toLocaleDateString("en-US");
      doc.text(`• Date Range: ${start} - ${end}`, 20, yPos);
    }
  }

  // Summary stats
  yPos += 10;
  doc.setFillColor("#F5F5F5");
  doc.rect(15, yPos - 5, pageWidth - 30, 18, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondaryColor);

  const totalTrips = trips.length;
  const avgDuration =
    trips.length > 0
      ? Math.round(trips.reduce((sum, t) => sum + (t.durationMinutes || 0), 0) / trips.length)
      : 0;

  doc.text(`Total Trips: ${totalTrips}`, 20, yPos + 3);
  doc.text(`Average Duration: ${avgDuration} min`, pageWidth / 2, yPos + 3, {
    align: "center",
  });
  doc.text(`Date: ${new Date().toLocaleDateString("en-US")}`, pageWidth - 20, yPos + 3, {
    align: "right",
  });

  // Table data
  yPos += 20;

  const tableData = trips.map((trip) => [
    trip.ticketNumber || "N/A",
    trip.driverName,
    trip.originAddress.length > 45 ? trip.originAddress.slice(0, 42) + "..." : trip.originAddress,
    trip.destinationAddress.length > 45
      ? trip.destinationAddress.slice(0, 42) + "..."
      : trip.destinationAddress,
    trip.completedAt
      ? trip.completedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A",
    trip.durationMinutes ? `${trip.durationMinutes}m` : "N/A",
  ]);

  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [["Ticket #", "Driver", "Origin", "Destination", "Completed", "Duration"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: "#FFFFFF",
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor,
    },
    alternateRowStyles: {
      fillColor: "#F9F9F9",
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Footer on each page
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      const totalPages = (doc as any).internal.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor("#999999");
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });

      doc.text("© ENVÍA de Guatemala", 15, pageHeight - 10);
      doc.text("Confidential", pageWidth - 15, pageHeight - 10, { align: "right" });
    },
  });

  // Download PDF
  const filename = `envia-trip-history-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);

  return filename;
}
