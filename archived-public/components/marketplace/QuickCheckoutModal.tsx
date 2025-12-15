"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Truck, CheckCircle2 } from "lucide-react";
import { ProductWithShipping } from "@/lib/marketplace/types";
import { ServiceType, SERVICE_OPTIONS, GUATEMALA_ZONES } from "@/lib/types";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations/checkout-schema";
import { formatPrice, calculateTotalCost } from "@/lib/marketplace/shipping-integration";
import { useMarketplace } from "@/contexts/MarketplaceContext";

interface QuickCheckoutModalProps {
  product: ProductWithShipping;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCheckoutModal({ product, open, onOpenChange }: QuickCheckoutModalProps) {
  const { userZone } = useMarketplace();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      productId: product.id,
      quantity: 1,
      deliveryZone: userZone || "",
      serviceType: ServiceType.STANDARD,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const quantity = watch("quantity");
  const selectedServiceType = watch("serviceType");

  // Calculate totals
  const productTotal = product.price * (quantity || 1);
  const shippingCost = product.shippingEstimate?.cost || 0;
  const total = calculateTotalCost(product.price, quantity || 1, shippingCost);

  const onSubmit = async (data: CheckoutFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock order ID
    const mockOrderId = `ORD-${Date.now().toString().slice(-8)}`;
    setOrderId(mockOrderId);
    setOrderCompleted(true);
  };

  const handleClose = () => {
    setOrderCompleted(false);
    setOrderId("");
    onOpenChange(false);
  };

  // Order confirmation view
  if (orderCompleted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 className="text-primary h-8 w-8" />
              </div>
            </div>
            <DialogTitle className="text-secondary text-center text-2xl font-bold">
              Order Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Your order has been placed successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-primary/5 border-primary/20 rounded-lg border-2 p-4 text-center">
              <p className="text-muted-foreground mb-1 text-sm">Order Number</p>
              <p className="text-primary text-xl font-bold">{orderId}</p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="text-secondary font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="text-secondary font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-primary text-lg font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-secondary/5 border-secondary/20 rounded-lg border p-3 text-sm">
              <p className="text-foreground">
                You will receive a confirmation call shortly. Delivery in{" "}
                <span className="font-semibold">
                  {product.shippingEstimate?.estimatedDays || 4} days
                </span>
                .
              </p>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="bg-primary hover:bg-primary/90 w-full font-semibold text-white"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Checkout form view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <ShoppingCart className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-secondary text-xl font-bold">Quick Checkout</DialogTitle>
              <DialogDescription>Complete your order details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Summary */}
          <div className="border-primary/30 bg-card rounded-lg border-2 p-4">
            <div className="flex gap-4">
              <div className="bg-muted-100 relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-secondary line-clamp-1 font-bold">{product.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {formatPrice(product.price)} each
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  <Package className="mr-1 h-3 w-3" />
                  {product.stock} in stock
                </Badge>
              </div>
              <div className="text-right">
                <Label htmlFor="quantity" className="text-muted-foreground text-xs">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  {...register("quantity", { valueAsNumber: true })}
                  className="mt-1 w-20 text-center"
                />
                {errors.quantity && (
                  <p className="text-destructive mt-1 text-xs">{errors.quantity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="text-secondary flex items-center gap-2 font-bold">
              <Truck className="text-primary h-5 w-5" />
              Delivery Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryZone" className="text-foreground text-sm font-semibold">
                  Delivery Zone
                </Label>
                <Select
                  value={watch("deliveryZone")}
                  onValueChange={(value) => setValue("deliveryZone", value)}
                >
                  <SelectTrigger className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2">
                    <SelectValue placeholder="Select zone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GUATEMALA_ZONES.map((zone) => (
                      <SelectItem key={zone.value} value={zone.value}>
                        {zone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deliveryZone && (
                  <p className="text-destructive text-xs">{errors.deliveryZone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-700">
                  Service Type
                </Label>
                <Select
                  value={selectedServiceType}
                  onValueChange={(value) => setValue("serviceType", value as ServiceType)}
                >
                  <SelectTrigger className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress" className="text-sm font-semibold text-gray-700">
                Delivery Address
              </Label>
              <Input
                id="deliveryAddress"
                placeholder="Street address, building number, apartment..."
                {...register("deliveryAddress")}
                className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2"
              />
              {errors.deliveryAddress && (
                <p className="text-destructive text-xs">{errors.deliveryAddress.message}</p>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-secondary font-bold">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Your name"
                  {...register("customerName")}
                  className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2"
                />
                {errors.customerName && (
                  <p className="text-destructive text-xs">{errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="customerPhone"
                  placeholder="12345678"
                  {...register("customerPhone")}
                  className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2"
                />
                {errors.customerPhone && (
                  <p className="text-destructive text-xs">{errors.customerPhone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-sm font-semibold text-gray-700">
                Email (Optional)
              </Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="your@email.com"
                {...register("customerEmail")}
                className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2"
              />
              {errors.customerEmail && (
                <p className="text-destructive text-xs">{errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                Order Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="Special instructions, delivery preferences..."
                {...register("notes")}
                className="focus:border-primary focus:ring-primary/20 border-border bg-input border-2"
              />
              {errors.notes && <p className="text-destructive text-xs">{errors.notes.message}</p>}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-primary/5 border-primary/30 rounded-lg border-2 p-4">
            <h3 className="text-secondary mb-3 font-bold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product Total</span>
                <span className="font-semibold">{formatPrice(productTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">{formatPrice(shippingCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="text-secondary font-bold">Total</span>
                <span className="text-primary text-xl font-bold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border flex-1 border-2"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 flex-1 font-semibold text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : `Place Order - ${formatPrice(total)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
