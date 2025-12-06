"use client";

import { Order } from "@/lib/marketplace/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/marketplace/shipping-integration";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Truck,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  Box,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/admin/admin-context";

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-orange-500/5 text-orange-400/80 border border-orange-500/20",
  confirmed: "bg-blue-500/5 text-blue-400/80 border border-blue-500/20",
  shipped: "bg-purple-500/5 text-purple-400/80 border border-purple-500/20",
  delivered: "bg-green-500/5 text-green-400/80 border border-green-500/20",
};

const statusIcons: Record<OrderStatus, any> = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Send,
  delivered: Package,
};

export function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  const { updateOrderStatus } = useAdmin();
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  if (!order) return null;

  const currentStatus = newStatus || order.status;
  const StatusIcon = statusIcons[currentStatus];

  const handleSaveStatus = () => {
    if (newStatus && newStatus !== order.status) {
      updateOrderStatus(order.id, newStatus);
      setNewStatus(null);
    }
  };

  const handleClose = () => {
    setNewStatus(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="bg-card border-border w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Package className="text-primary h-5 w-5" />
            Order Details
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Order ID: <span className="font-mono font-semibold">{order.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Section */}
          <div className="space-y-2">
            <Label className="text-foreground">Order Status</Label>
            <div className="flex items-center gap-3">
              <Select
                value={currentStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger className="bg-background border-border flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              {newStatus && newStatus !== order.status && (
                <Button
                  onClick={handleSaveStatus}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Save
                </Button>
              )}
            </div>
            <Badge className={cn("rounded-md font-medium capitalize", statusColors[currentStatus])}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {currentStatus}
            </Badge>
          </div>

          <Separator className="bg-border" />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="text-foreground flex items-center gap-2 font-semibold">
              <User className="text-primary h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{order.customerName}</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{order.customerPhone}</span>
              </div>
              {order.customerEmail && (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Product Details */}
          <div className="space-y-3">
            <h3 className="text-foreground flex items-center gap-2 font-semibold">
              <Box className="text-primary h-4 w-4" />
              Product Details
            </h3>
            <div className="border-border bg-background rounded-md border p-3">
              <div className="flex gap-3">
                <img
                  src={order.product.thumbnail}
                  alt={order.product.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{order.product.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {order.product.shortDescription}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Qty: {order.quantity}</span>
                    <span className="text-foreground font-semibold">
                      {formatPrice(order.product.price)} each
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Shipping Details */}
          <div className="space-y-3">
            <h3 className="text-foreground flex items-center gap-2 font-semibold">
              <Truck className="text-primary h-4 w-4" />
              Shipping Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">
                    {order.deliveryZone.replace("zona-", "Zona ")}
                  </p>
                  <p>{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="capitalize">{order.serviceType.replace("_", " ")} Shipping</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Est. Delivery: {format(new Date(order.estimatedDelivery), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-foreground flex items-center gap-2 font-semibold">
              <DollarSign className="text-primary h-4 w-4" />
              Cost Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground flex justify-between">
                <span>Product Total</span>
                <span>{formatPrice(order.productTotal)}</span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
              <Separator className="bg-border" />
              <div className="text-foreground flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <>
              <Separator className="bg-border" />
              <div className="space-y-2">
                <h3 className="text-foreground flex items-center gap-2 font-semibold">
                  <FileText className="text-primary h-4 w-4" />
                  Order Notes
                </h3>
                <p className="text-muted-foreground bg-background border-border rounded-lg border p-3 text-sm">
                  {order.notes}
                </p>
              </div>
            </>
          )}

          <Separator className="bg-border" />

          {/* Order Timeline */}
          <div className="space-y-2">
            <h3 className="text-foreground font-semibold">Order Timeline</h3>
            <p className="text-muted-foreground text-xs">
              Created: {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
