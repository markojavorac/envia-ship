"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Truck, Store } from "lucide-react";
import { ProductWithShipping, MarketplaceView } from "@/lib/marketplace/types";
import { formatPrice, getDeliveryTimeDescription } from "@/lib/marketplace/shipping-integration";

interface ProductCardProps {
  product: ProductWithShipping;
  variant: MarketplaceView;
}

export function ProductCard({ product, variant }: ProductCardProps) {
  const { shippingEstimate } = product;

  // Amazon-style variant
  if (variant === MarketplaceView.AMAZON) {
    return (
      <Link href={`/marketplace/${product.id}`}>
        <Card className="border-primary/30 flex h-full cursor-pointer flex-col border-2 bg-card transition-shadow hover:shadow-lg">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {product.featured && (
              <Badge className="bg-primary absolute top-2 left-2 text-white">Featured</Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="flex flex-grow flex-col p-3">
            <h3 className="text-secondary mb-2 line-clamp-2 text-sm font-bold">{product.name}</h3>
            <div className="mb-2 flex items-center gap-1">
              <Star className="text-primary fill-primary h-3 w-3" />
              <span className="text-xs font-semibold text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
            <p className="text-primary mb-1 text-lg font-bold">{formatPrice(product.price)}</p>
            {shippingEstimate ? (
              <Badge variant="secondary" className="mb-2 w-fit text-xs">
                <Truck className="mr-1 h-3 w-3" />
                {formatPrice(shippingEstimate.cost)} shipping
              </Badge>
            ) : (
              <Badge variant="outline" className="mb-2 w-fit text-xs">
                Set zone for shipping
              </Badge>
            )}
            <p className="mb-3 line-clamp-2 flex-grow text-xs text-muted-foreground">
              {product.shortDescription}
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 w-full font-semibold text-white"
              size="sm"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Buy Now"}
            </Button>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Uber Eats-style variant
  if (variant === MarketplaceView.UBER_EATS) {
    return (
      <Link href={`/marketplace/${product.id}`}>
        <Card className="border-primary/30 cursor-pointer border-2 bg-card transition-all hover:scale-105 hover:shadow-xl">
          <div className="relative aspect-video bg-muted">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="rounded-t-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {shippingEstimate && (
              <Badge className="bg-primary absolute top-2 right-2 text-white">
                <Truck className="mr-1 h-3 w-3" />
                {getDeliveryTimeDescription(shippingEstimate.estimatedDays)}
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-grow">
                <h3 className="text-secondary mb-1 line-clamp-1 text-base font-bold">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>From {product.originZone.replace("-", " ")}</span>
                  {shippingEstimate && (
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(shippingEstimate.cost)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-primary text-xl font-bold">{formatPrice(product.price)}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="text-primary fill-primary h-3 w-3" />
                  <span className="text-xs font-semibold">{product.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Pinterest-style variant
  if (variant === MarketplaceView.PINTEREST) {
    return (
      <Link href={`/marketplace/${product.id}`}>
        <Card className="border-primary/30 group mb-4 cursor-pointer break-inside-avoid overflow-hidden border-2 bg-card">
          <div className="relative">
            <Image
              src={product.thumbnail}
              alt={product.name}
              width={300}
              height={Math.floor(300 * (1 + Math.random() * 0.5))} // Variable height
              className="h-auto w-full object-cover"
            />
            {/* Hover overlay */}
            <div className="bg-secondary/90 absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <h3 className="mb-1 text-lg font-bold text-white">{product.name}</h3>
              <p className="mb-3 line-clamp-2 text-sm text-white/80">{product.shortDescription}</p>
              <div className="flex items-center justify-between">
                <span className="text-primary text-2xl font-bold">
                  {formatPrice(product.price)}
                </span>
                <Button size="sm" className="bg-primary">
                  View
                </Button>
              </div>
            </div>
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          {/* Always visible info */}
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-secondary line-clamp-1 flex-grow text-sm font-semibold">
                {product.name}
              </span>
              <span className="text-primary ml-2 flex-shrink-0 text-base font-bold">
                {formatPrice(product.price)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Minimalist/Apple-style variant
  if (variant === MarketplaceView.MINIMALIST) {
    return (
      <Link href={`/marketplace/${product.id}`}>
        <Card className="cursor-pointer border-0 bg-card shadow-sm transition-shadow hover:shadow-xl">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6 text-center">
            <h3 className="text-secondary mb-3 text-xl font-bold">{product.name}</h3>
            <p className="text-primary mb-4 text-3xl font-bold">{formatPrice(product.price)}</p>
            <p className="mb-4 line-clamp-1 text-sm text-muted-foreground">{product.shortDescription}</p>
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary w-full border-2 font-bold hover:text-white"
              disabled={product.stock === 0}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Proximity/Local-style variant
  if (variant === MarketplaceView.PROXIMITY) {
    const isLocalZone = false; // Will be calculated based on user zone

    return (
      <Link href={`/marketplace/${product.id}`}>
        <Card className="border-primary/30 cursor-pointer border-2 bg-card transition-shadow hover:shadow-lg">
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="rounded-t-lg object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isLocalZone && (
              <Badge className="bg-primary absolute top-2 left-2 text-white">
                <MapPin className="mr-1 h-3 w-3" />
                Your Zone
              </Badge>
            )}
            {shippingEstimate && (
              <Badge className="bg-secondary absolute top-2 right-2 text-white">
                {getDeliveryTimeDescription(shippingEstimate.estimatedDays)}
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-grow">
                <h3 className="text-secondary line-clamp-1 text-base font-bold">{product.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  From {product.originZone.replace("-", " ")}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-primary text-xl font-bold">{formatPrice(product.price)}</p>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Store className="h-3 w-3" />
              <span>{product.seller.name}</span>
              {product.seller.verified && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                {shippingEstimate
                  ? `+ ${formatPrice(shippingEstimate.cost)} shipping`
                  : "Set zone for shipping"}
              </span>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default fallback (Amazon variant)
  return null;
}
