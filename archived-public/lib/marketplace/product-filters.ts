import { Product, ProductWithShipping, FilterState, SortOption } from "./types";

/**
 * Filter products based on filter state
 */
export function filterProducts(
  products: ProductWithShipping[],
  filters: FilterState
): ProductWithShipping[] {
  return products.filter((product) => {
    // Category filter
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }

    // Price range filter
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }

    // Zone filter
    if (filters.zones.length > 0 && !filters.zones.includes(product.originZone)) {
      return false;
    }

    // In stock filter
    if (filters.inStock && product.stock === 0) {
      return false;
    }

    // Rating filter
    if (product.rating < filters.minRating) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesDescription = product.description.toLowerCase().includes(query);
      const matchesTags = product.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesSeller = product.seller.name.toLowerCase().includes(query);

      if (!matchesName && !matchesDescription && !matchesTags && !matchesSeller) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort products based on sort option
 */
export function sortProducts(
  products: ProductWithShipping[],
  sortOption: SortOption,
  userZone?: string | null
): ProductWithShipping[] {
  const sorted = [...products];

  switch (sortOption) {
    case SortOption.PRICE_LOW:
      return sorted.sort((a, b) => a.price - b.price);

    case SortOption.PRICE_HIGH:
      return sorted.sort((a, b) => b.price - a.price);

    case SortOption.RATING:
      return sorted.sort((a, b) => b.rating - a.rating);

    case SortOption.NEWEST:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    case SortOption.NEAREST:
      if (!userZone) return sorted;
      // Sort by: same zone first, then by alphabetical zone order
      return sorted.sort((a, b) => {
        const aIsLocal = a.originZone === userZone;
        const bIsLocal = b.originZone === userZone;
        if (aIsLocal && !bIsLocal) return -1;
        if (!aIsLocal && bIsLocal) return 1;
        return a.originZone.localeCompare(b.originZone);
      });

    case SortOption.RELEVANCE:
    default:
      // Relevance: featured first, then by rating, then by newest
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
}

/**
 * Search products by query
 */
export function searchProducts(
  products: ProductWithShipping[],
  query: string
): ProductWithShipping[] {
  if (!query.trim()) return products;

  const searchTerms = query.toLowerCase().split(" ");

  return products.filter((product) => {
    const searchableText = [
      product.name,
      product.description,
      product.shortDescription,
      ...product.tags,
      product.seller.name,
      product.category,
    ]
      .join(" ")
      .toLowerCase();

    return searchTerms.every((term) => searchableText.includes(term));
  });
}

/**
 * Get price range from products
 */
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 1000 };

  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

/**
 * Get unique zones from products
 */
export function getUniqueZones(products: Product[]): string[] {
  const zones = new Set(products.map((p) => p.originZone));
  return Array.from(zones).sort();
}

/**
 * Group products by zone (for Proximity view)
 */
export function groupProductsByZone(
  products: ProductWithShipping[],
  userZone: string | null
): { zone: string; products: ProductWithShipping[] }[] {
  const groups = new Map<string, ProductWithShipping[]>();

  products.forEach((product) => {
    const zone = product.originZone;
    if (!groups.has(zone)) {
      groups.set(zone, []);
    }
    groups.get(zone)!.push(product);
  });

  // Convert to array and sort: user's zone first, then alphabetically
  const result = Array.from(groups.entries()).map(([zone, products]) => ({
    zone,
    products,
  }));

  if (userZone) {
    result.sort((a, b) => {
      if (a.zone === userZone) return -1;
      if (b.zone === userZone) return 1;
      return a.zone.localeCompare(b.zone);
    });
  } else {
    result.sort((a, b) => a.zone.localeCompare(b.zone));
  }

  return result;
}

/**
 * Get product count by category
 */
export function getProductCountByCategory(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};

  products.forEach((product) => {
    const category = product.category;
    counts[category] = (counts[category] || 0) + 1;
  });

  return counts;
}
