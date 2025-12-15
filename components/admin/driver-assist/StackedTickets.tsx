/* eslint-disable custom/no-inline-styles */
"use client";

import { motion } from "framer-motion";
import { TicketCard } from "./TicketCard";

interface StackedTicketsProps {
  tickets: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    address: string;
    items: number;
    priority: "high" | "medium" | "low";
    timeWindow: string;
    zone: string;
    distance: string;
    estimatedTime: string;
    status: "pending" | "in-progress" | "completed";
  }>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function StackedTickets({ tickets, onAccept, onReject }: StackedTicketsProps) {
  const VISIBLE_HEIGHT = 45; // px of each card visible behind

  return (
    <div
      className="relative mx-auto w-full max-w-2xl"
      style={{ height: `${400 + (tickets.length - 1) * VISIBLE_HEIGHT}px` }}
    >
      {tickets.map((ticket, index) => {
        const isTop = index === 0;
        const offsetY = index * VISIBLE_HEIGHT;
        const zIndex = tickets.length - index;

        return (
          <motion.div
            key={ticket.id}
            className="absolute w-full"
            style={{
              zIndex,
              top: offsetY,
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className="rounded-lg transition-all duration-200"
              style={{
                boxShadow: isTop
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 140, 0, 0.2)"
                  : `0 ${10 - index * 2}px ${15 - index * 2}px -3px rgba(0, 0, 0, ${0.08 - index * 0.02})`,
              }}
            >
              <TicketCard
                {...ticket}
                onAccept={() => onAccept(ticket.id)}
                onReject={() => onReject(ticket.id)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
