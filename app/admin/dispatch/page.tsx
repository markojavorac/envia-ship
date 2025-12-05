"use client";

import { useState, useEffect } from "react";
import { DispatchEntry } from "@/lib/admin/dispatch-types";
import { generateMockDispatch } from "@/lib/admin/mock-dispatch";
import { updateDispatchEntries } from "@/lib/admin/dispatch-utils";
import { DispatchKPIs } from "@/components/admin/dispatch/DispatchKPIs";
import { DispatchBoard } from "@/components/admin/dispatch/DispatchBoard";

/**
 * Dispatch Terminal Page
 *
 * Real-time dispatch terminal board inspired by airport departure displays.
 * Shows driver assignments, package loading status, and departure times.
 *
 * Features:
 * - Live simulation with 5-8 second update intervals
 * - Automatic status transitions (WAITING → LOADING → READY → DEPARTED)
 * - Progressive package loading animation
 * - Automatic cleanup of old departed entries
 * - KPI metrics at the top
 */
export default function DispatchTerminal() {
  // Initialize with mock dispatch data (8 entries for simpler view)
  const [entries, setEntries] = useState<DispatchEntry[]>(() => generateMockDispatch(8));
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time simulation effect
  useEffect(() => {
    // Random interval between 15-20 seconds (slower, more realistic)
    const getRandomInterval = () => 15000 + Math.random() * 5000;

    const tick = () => {
      setEntries((prev) => updateDispatchEntries(prev));
      setLastUpdate(new Date());
    };

    // Initial tick after first interval
    let timeoutId = setTimeout(function run() {
      tick();
      timeoutId = setTimeout(run, getRandomInterval());
    }, getRandomInterval());

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <DispatchKPIs entries={entries} />

      {/* Main Dispatch Board */}
      <DispatchBoard entries={entries} lastUpdate={lastUpdate} />
    </div>
  );
}
