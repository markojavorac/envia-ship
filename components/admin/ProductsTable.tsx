"use client";

import { useState, useMemo } from "react";
import { Product, ProductCategory, CATEGORY_OPTIONS } from "@/lib/marketplace/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Pencil, Save, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/marketplace/shipping-integration";

interface ProductsTableProps {
  products: Product[];
  onUpdateProduct: (productId: string, updates: Partial<Product>) => void;
}

export function ProductsTable({ products, onUpdateProduct }: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Partial<Product>>({});

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditedData({ ...product });
  };

  const handleSave = (productId: string) => {
    if (editedData) {
      // Basic validation
      if (editedData.name && editedData.name.trim().length > 0) {
        if ((editedData.price || 0) > 0 && (editedData.stock || 0) >= 0) {
          onUpdateProduct(productId, editedData);
          setEditingId(null);
          setEditedData({});
        }
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  // Define columns
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "thumbnail",
        header: "Image",
        cell: ({ row }) => (
          <img
            src={row.original.thumbnail}
            alt={row.original.name}
            className="h-12 w-12 rounded-md object-cover"
          />
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id;
          return isEditing ? (
            <Input
              value={editedData.name || ""}
              onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              className="max-w-xs bg-background border-border"
            />
          ) : (
            <div className="max-w-[200px]">
              <p className="font-medium truncate">{row.original.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {row.original.shortDescription}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id;
          return isEditing ? (
            <Input
              type="number"
              value={editedData.price || 0}
              onChange={(e) =>
                setEditedData({ ...editedData, price: parseFloat(e.target.value) })
              }
              className="w-24 bg-background border-border"
              min="0"
              step="0.01"
            />
          ) : (
            <span className="font-semibold">{formatPrice(row.original.price)}</span>
          );
        },
      },
      {
        accessorKey: "stock",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-card"
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id;
          const stock = isEditing ? editedData.stock || 0 : row.original.stock;
          return isEditing ? (
            <Input
              type="number"
              value={editedData.stock || 0}
              onChange={(e) =>
                setEditedData({ ...editedData, stock: parseInt(e.target.value) })
              }
              className="w-20 bg-background border-border"
              min="0"
            />
          ) : (
            <Badge
              className={cn(
                "font-semibold",
                stock === 0 && "bg-red-500/10 text-red-500",
                stock > 0 && stock < 10 && "bg-red-500/10 text-red-500",
                stock >= 10 && stock < 30 && "bg-orange-500/10 text-orange-500",
                stock >= 30 && "bg-green-500/10 text-green-500"
              )}
            >
              {stock}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id;
          const currentCategory = isEditing
            ? editedData.category
            : row.original.category;
          const categoryLabel =
            CATEGORY_OPTIONS.find((c) => c.value === currentCategory)?.label || "";

          return isEditing ? (
            <Select
              value={editedData.category}
              onValueChange={(value) =>
                setEditedData({ ...editedData, category: value as ProductCategory })
              }
            >
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-sm text-muted-foreground">{categoryLabel}</span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isEditing = editingId === row.original.id;
          return isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleSave(row.original.id)}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="hover:bg-card"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(row.original)}
              className="hover:bg-card"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          );
        },
      },
    ],
    [editingId, editedData, onUpdateProduct]
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock < 30);
    } else if (stockFilter === "out") {
      filtered = filtered.filter((p) => p.stock === 0);
    }

    return filtered;
  }, [products, categoryFilter, stockFilter]);

  // Initialize table
  const table = useReactTable({
    data: filteredProducts,
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
        pageSize: 50,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as ProductCategory | "all")}
        >
          <SelectTrigger className="w-[200px] bg-card border-border text-foreground">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_OPTIONS.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stock Filter */}
        <Select
          value={stockFilter}
          onValueChange={(value) => setStockFilter(value as "all" | "low" | "out")}
        >
          <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Levels</SelectItem>
            <SelectItem value="low">Low Stock (&lt;30)</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card">
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            filteredProducts.length
          )}{" "}
          of {filteredProducts.length} products
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
