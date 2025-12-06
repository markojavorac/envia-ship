"use client";

import { useState, useMemo } from "react";
import { Order } from "@/lib/marketplace/types";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { formatPrice } from "@/lib/marketplace/shipping-integration";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-orange-500/5 text-orange-400/80 border border-orange-500/20",
  confirmed: "bg-blue-500/5 text-blue-400/80 border border-blue-500/20",
  shipped: "bg-purple-500/5 text-purple-400/80 border border-purple-500/20",
  delivered: "bg-green-500/5 text-green-400/80 border border-green-500/20",
};

export function OrdersTable({ orders, onViewOrder }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [globalFilter, setGlobalFilter] = useState("");

  // Define columns
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Order ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold">{row.original.id}</span>
        ),
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Customer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
      },
      {
        accessorKey: "product",
        header: "Product",
        cell: ({ row }) => {
          const product = row.original.product;
          const quantity = row.original.quantity;
          return (
            <div className="max-w-[200px]">
              <p className="truncate font-medium">{product.name}</p>
              <p className="text-muted-foreground text-xs">Qty: {quantity}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "totalCost",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <span className="font-semibold">{formatPrice(row.original.totalCost)}</span>
        ),
      },
      {
        accessorKey: "deliveryZone",
        header: "Zone",
        cell: ({ row }) => {
          const zone = row.original.deliveryZone.replace("zona-", "Zona ");
          return <span className="text-sm">{zone}</span>;
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge className={cn("rounded-md font-medium capitalize", statusColors[status])}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return <span className="text-sm">{format(date, "MMM d, yyyy")}</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewOrder(row.original)}
            className="hover:bg-card"
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
        ),
      },
    ],
    [onViewOrder]
  );

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Initialize table
  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  // Status filter tabs
  const statusOptions: Array<{ value: OrderStatus | "all"; label: string; count: number }> = [
    { value: "all", label: "All", count: orders.length },
    {
      value: "pending",
      label: "Pending",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      value: "confirmed",
      label: "Confirmed",
      count: orders.filter((o) => o.status === "confirmed").length,
    },
    {
      value: "shipped",
      label: "Shipped",
      count: orders.filter((o) => o.status === "shipped").length,
    },
    {
      value: "delivered",
      label: "Delivered",
      count: orders.filter((o) => o.status === "delivered").length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "border-border rounded-md",
                statusFilter === option.value
                  ? "bg-muted text-foreground border-border"
                  : "bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              {option.label}
              <span className="text-muted-foreground ml-2 text-xs font-normal">{option.count}</span>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search orders..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="bg-card border-border pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border-border bg-card rounded-md border">
        <Table>
          <TableHeader className="bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-background">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-border hover:bg-muted"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            filteredOrders.length
          )}{" "}
          of {filteredOrders.length} orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
