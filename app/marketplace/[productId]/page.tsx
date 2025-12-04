"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { getProductById } from "@/lib/marketplace/product-data";
import { calculateProductShipping, formatPrice } from "@/lib/marketplace/shipping-integration";
import { ProductImageGallery } from "@/components/marketplace/ProductImageGallery";
import { ShippingEstimateBadge } from "@/components/marketplace/ShippingEstimateBadge";
import { QuickCheckoutModal } from "@/components/marketplace/QuickCheckoutModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Star,
  MapPin,
  Store,
  Package,
  Shield,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { CATEGORY_OPTIONS } from "@/lib/marketplace/types";

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { userZone, serviceType } = useMarketplace();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const productId = params.productId as string;
  const product = getProductById(productId);

  // Calculate shipping
  const shippingEstimate = useMemo(() => {
    if (!product || !userZone) return null;
    return calculateProductShipping(product, userZone, serviceType);
  }, [product, userZone, serviceType]);

  const productWithShipping = product ? { ...product, shippingEstimate } : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = CATEGORY_OPTIONS.find((c) => c.value === product.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/marketplace")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image Gallery */}
            <div>
              <ProductImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {category && (
                <Badge variant="outline" className="text-sm">
                  {category.label}
                </Badge>
              )}

              {/* Product Name */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "text-primary fill-primary"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {product.rating.toFixed(1)} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-gray-500">per unit</span>
                </div>
                {shippingEstimate && (
                  <ShippingEstimateBadge estimate={shippingEstimate} showDetails />
                )}
              </div>

              <Separator />

              {/* Seller Info */}
              <Card className="bg-white border-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary">{product.seller.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span className="text-xs font-semibold">
                              {product.seller.rating.toFixed(1)}
                            </span>
                          </div>
                          {product.seller.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>Ships from {product.originZone.replace("-", " ")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? (
                    <>
                      <span className="font-semibold text-primary">{product.stock}</span> units
                      in stock
                    </>
                  ) : (
                    <span className="font-semibold text-destructive">Out of stock</span>
                  )}
                </span>
              </div>

              {/* Buy Button */}
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90 font-semibold text-lg py-6"
                onClick={() => setCheckoutOpen(true)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">Quality Assured</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12">
            <Card className="bg-white border-2 border-primary/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-secondary mb-4">Product Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>

                <Separator className="my-6" />

                <h3 className="text-xl font-bold text-secondary mb-4">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Weight</span>
                    <span className="font-semibold text-secondary">
                      {product.weight.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-semibold text-secondary">
                      {product.dimensions.length} × {product.dimensions.width} ×{" "}
                      {product.dimensions.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Category</span>
                    <span className="font-semibold text-secondary">{category?.label}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Origin Zone</span>
                    <span className="font-semibold text-secondary">
                      {product.originZone.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-xl font-bold text-secondary mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {productWithShipping && (
        <QuickCheckoutModal
          product={productWithShipping}
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
        />
      )}
    </div>
  );
}

// Missing import
import { ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
  return <ProductDetailContent />;
}
