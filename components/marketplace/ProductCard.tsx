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
        <Card className="bg-white border-2 border-primary/30 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-primary text-white">
                Featured
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-bold text-secondary line-clamp-2 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 text-primary fill-primary" />
              <span className="text-xs font-semibold text-gray-700">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({product.reviews})
              </span>
            </div>
            <p className="text-lg font-bold text-primary mb-1">
              {formatPrice(product.price)}
            </p>
            {shippingEstimate ? (
              <Badge variant="secondary" className="text-xs mb-2 w-fit">
                <Truck className="h-3 w-3 mr-1" />
                {formatPrice(shippingEstimate.cost)} shipping
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs mb-2 w-fit">
                Set zone for shipping
              </Badge>
            )}
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-grow">
              {product.shortDescription}
            </p>
            <Button
              className="w-full bg-primary text-white hover:bg-primary/90 font-semibold"
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
        <Card className="bg-white border-2 border-primary/30 hover:scale-105 hover:shadow-xl transition-all cursor-pointer">
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {shippingEstimate && (
              <Badge className="absolute top-2 right-2 bg-primary text-white">
                <Truck className="h-3 w-3 mr-1" />
                {getDeliveryTimeDescription(shippingEstimate.estimatedDays)}
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-grow">
                <h3 className="font-bold text-base text-secondary line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>From {product.originZone.replace("-", " ")}</span>
                  {shippingEstimate && (
                    <Badge variant="outline" className="text-xs">
                      {formatPrice(shippingEstimate.cost)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 text-primary fill-primary" />
                  <span className="text-xs font-semibold">
                    {product.rating.toFixed(1)}
                  </span>
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
        <Card className="bg-white border-2 border-primary/30 overflow-hidden group cursor-pointer break-inside-avoid mb-4">
          <div className="relative">
            <Image
              src={product.thumbnail}
              alt={product.name}
              width={300}
              height={Math.floor(300 * (1 + Math.random() * 0.5))} // Variable height
              className="w-full h-auto object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-secondary/90 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-white/80 text-sm line-clamp-2 mb-3">
                {product.shortDescription}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <Button size="sm" className="bg-primary">
                  View
                </Button>
              </div>
            </div>
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          {/* Always visible info */}
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-secondary line-clamp-1 flex-grow">
                {product.name}
              </span>
              <span className="text-base font-bold text-primary ml-2 flex-shrink-0">
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
        <Card className="bg-white shadow-sm hover:shadow-xl transition-shadow border-0 cursor-pointer">
          <div className="aspect-square relative bg-gray-50">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-secondary mb-3">
              {product.name}
            </h3>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-500 mb-4 line-clamp-1">
              {product.shortDescription}
            </p>
            <Button
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold"
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
        <Card className="bg-white border-2 border-primary/30 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="aspect-square relative bg-gray-100">
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isLocalZone && (
              <Badge className="absolute top-2 left-2 bg-primary text-white">
                <MapPin className="h-3 w-3 mr-1" />
                Your Zone
              </Badge>
            )}
            {shippingEstimate && (
              <Badge className="absolute top-2 right-2 bg-secondary text-white">
                {getDeliveryTimeDescription(shippingEstimate.estimatedDays)}
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-grow">
                <h3 className="font-bold text-base text-secondary line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  From {product.originZone.replace("-", " ")}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Store className="h-3 w-3" />
              <span>{product.seller.name}</span>
              {product.seller.verified && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-center">
              <span className="text-xs text-gray-600">
                {shippingEstimate ? `+ ${formatPrice(shippingEstimate.cost)} shipping` : "Set zone for shipping"}
              </span>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90"
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
