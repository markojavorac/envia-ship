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

export function QuickCheckoutModal({
  product,
  open,
  onOpenChange,
}: QuickCheckoutModalProps) {
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
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-secondary">
              Order Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Your order has been placed successfully
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-primary">{orderId}</p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product</span>
                <span className="font-semibold text-secondary">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-semibold text-secondary">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-3 text-sm">
              <p className="text-gray-700">
                You will receive a confirmation call shortly. Delivery in{" "}
                <span className="font-semibold">{product.shippingEstimate?.estimatedDays || 4} days</span>.
              </p>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="w-full bg-primary text-white hover:bg-primary/90 font-semibold"
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-secondary">
                Quick Checkout
              </DialogTitle>
              <DialogDescription>Complete your order details</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Summary */}
          <div className="bg-white border-2 border-primary/30 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-secondary line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formatPrice(product.price)} each
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  <Package className="h-3 w-3 mr-1" />
                  {product.stock} in stock
                </Badge>
              </div>
              <div className="text-right">
                <Label htmlFor="quantity" className="text-xs text-gray-600">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  {...register("quantity", { valueAsNumber: true })}
                  className="w-20 mt-1 text-center"
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-secondary flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Delivery Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryZone" className="text-sm font-semibold text-gray-700">
                  Delivery Zone
                </Label>
                <Select
                  value={watch("deliveryZone")}
                  onValueChange={(value) => setValue("deliveryZone", value)}
                >
                  <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
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
                  <p className="text-xs text-destructive">{errors.deliveryZone.message}</p>
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
                  <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
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
                className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>
              )}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-secondary">Contact Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="customerName"
                  placeholder="Your name"
                  {...register("customerName")}
                  className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {errors.customerName && (
                  <p className="text-xs text-destructive">{errors.customerName.message}</p>
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
                  className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
                />
                {errors.customerPhone && (
                  <p className="text-xs text-destructive">{errors.customerPhone.message}</p>
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
                className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              />
              {errors.customerEmail && (
                <p className="text-xs text-destructive">{errors.customerEmail.message}</p>
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
                className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20"
              />
              {errors.notes && (
                <p className="text-xs text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-4">
            <h3 className="font-bold text-secondary mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product Total</span>
                <span className="font-semibold">{formatPrice(productTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{formatPrice(shippingCost)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold text-secondary">Total</span>
                <span className="font-bold text-primary text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-white hover:bg-primary/90 font-semibold"
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
