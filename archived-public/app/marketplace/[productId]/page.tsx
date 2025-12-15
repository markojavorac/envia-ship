"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { getProductById } from "@/lib/marketplace/product-data";
import { calculateProductShipping, formatPrice } from "@/lib/marketplace/shipping-integration";
import { MarketplaceControlBar } from "@/components/marketplace/MarketplaceControlBar";
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
  ShoppingCart,
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
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-secondary mb-2 text-2xl font-bold">Product Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            The product you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const category = CATEGORY_OPTIONS.find((c) => c.value === product.category);

  return (
    <div className="min-h-screen">
      {/* Marketplace Control Bar */}
      <MarketplaceControlBar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 xl:px-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/marketplace")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8">
        <div className="container mx-auto px-4 xl:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                <h1 className="text-secondary mb-3 text-3xl font-bold md:text-4xl">
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
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {product.rating.toFixed(1)} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-primary text-4xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-muted-foreground">per unit</span>
                </div>
                {shippingEstimate && (
                  <ShippingEstimateBadge estimate={shippingEstimate} showDetails />
                )}
              </div>

              <Separator />

              {/* Seller Info */}
              <Card className="border-primary/20 border-2 bg-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                        <Store className="text-primary h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-secondary font-bold">{product.seller.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="text-primary fill-primary h-3 w-3" />
                            <span className="text-xs font-semibold">
                              {product.seller.rating.toFixed(1)}
                            </span>
                          </div>
                          {product.seller.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
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
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0 ? (
                    <>
                      <span className="text-primary font-semibold">{product.stock}</span> units in
                      stock
                    </>
                  ) : (
                    <span className="text-destructive font-semibold">Out of stock</span>
                  )}
                </span>
              </div>

              {/* Buy Button */}
              <Button
                className="bg-primary hover:bg-primary/90 w-full py-6 text-lg font-semibold text-white"
                onClick={() => setCheckoutOpen(true)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Buy Now"}
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <Shield className="text-primary h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Secure Payment</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <Truck className="text-primary h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
                    <CheckCircle2 className="text-primary h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">Quality Assured</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="mt-12">
            <Card className="border-primary/20 border-2 bg-card">
              <CardContent className="p-6">
                <h2 className="text-secondary mb-4 text-2xl font-bold">Product Description</h2>
                <p className="leading-relaxed text-foreground">{product.description}</p>

                <Separator className="my-6" />

                <h3 className="text-secondary mb-4 text-xl font-bold">Product Details</h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="text-secondary font-semibold">
                      {product.weight.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="text-secondary font-semibold">
                      {product.dimensions.length} × {product.dimensions.width} ×{" "}
                      {product.dimensions.height} cm
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-secondary font-semibold">{category?.label}</span>
                  </div>
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Origin Zone</span>
                    <span className="text-secondary font-semibold">
                      {product.originZone.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {product.tags.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="text-secondary mb-3 text-xl font-bold">Tags</h3>
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

export default function ProductDetailPage() {
  return <ProductDetailContent />;
}
