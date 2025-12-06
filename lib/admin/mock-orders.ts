import { Order, Product } from "@/lib/marketplace/types";
import { ServiceType, GUATEMALA_ZONES, DeliveryTiming } from "@/lib/types";
import { MOCK_PRODUCTS } from "@/lib/marketplace/product-data";
import { calculateShippingPrice } from "@/lib/shipping-calculator";

// Order status type
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered";

// Customer name generator
const FIRST_NAMES = [
  "María",
  "Juan",
  "Ana",
  "Carlos",
  "Sofía",
  "José",
  "Isabella",
  "Miguel",
  "Valentina",
  "Luis",
  "Camila",
  "Diego",
  "Lucía",
  "Alejandro",
  "Martina",
  "Fernando",
  "Victoria",
  "Ricardo",
  "Elena",
  "Gabriel",
];

const LAST_NAMES = [
  "García",
  "Rodríguez",
  "Martínez",
  "López",
  "González",
  "Pérez",
  "Sánchez",
  "Ramírez",
  "Torres",
  "Flores",
  "Rivera",
  "Gómez",
  "Díaz",
  "Cruz",
  "Morales",
  "Hernández",
  "Jiménez",
  "Mendoza",
  "Ruiz",
  "Alvarez",
];

// Address templates
const STREET_NAMES = [
  "Avenida Las Américas",
  "Calle Real",
  "Boulevard Vista Hermosa",
  "Avenida La Reforma",
  "Calle Montúfar",
  "Boulevard Los Próceres",
  "Avenida Petapa",
  "Calle Martí",
  "Avenida Bolívar",
  "Calle del Comercio",
];

/**
 * Get random element from array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random date within a range
 * @param daysAgo Number of days in the past to start range
 * @param daysRecent Number of days in the past to end range (default: 0 = today)
 */
function getRandomDate(daysAgo: number, daysRecent: number = 0): Date {
  const now = Date.now();
  const start = now - daysAgo * 24 * 60 * 60 * 1000;
  const end = now - daysRecent * 24 * 60 * 60 * 1000;
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

/**
 * Generate random customer name
 */
function generateCustomerName(): string {
  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  return `${firstName} ${lastName}`;
}

/**
 * Generate random phone number (8 digits)
 */
function generatePhoneNumber(): string {
  // Guatemala phone numbers are 8 digits, typically starting with 2-7
  const firstDigit = getRandomInt(2, 7);
  const remaining = Array.from({ length: 7 }, () => getRandomInt(0, 9)).join("");
  return `${firstDigit}${remaining}`;
}

/**
 * Generate random email (30% chance of having one)
 */
function generateEmail(name: string): string | undefined {
  if (Math.random() > 0.3) return undefined;

  const cleanName = name.toLowerCase().replace(/\s+/g, ".");
  const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
  return `${cleanName}${getRandomInt(1, 999)}@${getRandomElement(domains)}`;
}

/**
 * Generate random delivery address
 */
function generateAddress(): string {
  const street = getRandomElement(STREET_NAMES);
  const number = getRandomInt(1, 99);
  const building = Math.random() > 0.5 ? `, Edificio ${getRandomInt(1, 20)}` : "";
  const apartment = Math.random() > 0.6 ? `, Apto ${getRandomInt(1, 15)}` : "";
  return `${street} ${number}${building}${apartment}`;
}

/**
 * Get weighted order status based on realistic distribution
 * 10% pending, 15% confirmed, 30% shipped, 45% delivered
 */
function getWeightedStatus(): OrderStatus {
  const random = Math.random();
  if (random < 0.1) return "pending";
  if (random < 0.25) return "confirmed";
  if (random < 0.55) return "shipped";
  return "delivered";
}

/**
 * Get weighted quantity (80% single item, 15% 2-3 items, 5% 4-6 items)
 */
function getWeightedQuantity(maxStock: number): number {
  const random = Math.random();
  let qty: number;

  if (random < 0.8) {
    qty = 1;
  } else if (random < 0.95) {
    qty = getRandomInt(2, 3);
  } else {
    qty = getRandomInt(4, 6);
  }

  // Don't exceed available stock
  return Math.min(qty, maxStock);
}

/**
 * Get weighted zone (weight Zona 1-3 more heavily)
 */
function getWeightedZone(): string {
  const random = Math.random();

  // 60% chance of popular zones (Zona 1, 4, and 9)
  if (random < 0.6) {
    const popularZones = GUATEMALA_ZONES.filter(
      (z) => z.value === "zona-1" || z.value === "zona-4" || z.value === "zona-9"
    );
    const zone = getRandomElement(popularZones);
    return zone.value;
  }

  // 40% chance of any other zone
  const allZones = [...GUATEMALA_ZONES];
  const zone = getRandomElement(allZones);
  return zone.value;
}

/**
 * Get weighted service type (70% standard, 25% express, 5% international)
 */
function getWeightedServiceType(): ServiceType {
  const random = Math.random();
  if (random < 0.7) return ServiceType.STANDARD;
  if (random < 0.95) return ServiceType.EXPRESS;
  return ServiceType.INTERNATIONAL;
}

/**
 * Calculate estimated delivery date based on service type
 */
function calculateEstimatedDelivery(orderDate: Date, serviceType: ServiceType): string {
  const estimatedDate = new Date(orderDate);

  switch (serviceType) {
    case ServiceType.EXPRESS:
      // Express: 1-2 days
      estimatedDate.setDate(estimatedDate.getDate() + getRandomInt(1, 2));
      break;
    case ServiceType.STANDARD:
      // Standard: 3-5 days
      estimatedDate.setDate(estimatedDate.getDate() + getRandomInt(3, 5));
      break;
    case ServiceType.INTERNATIONAL:
      // 7-14 days
      estimatedDate.setDate(estimatedDate.getDate() + getRandomInt(7, 14));
      break;
  }

  return estimatedDate.toISOString();
}

/**
 * Generate a single mock order
 */
function generateSingleOrder(orderNumber: number): Order {
  // Select random product (ensure stock > 0)
  let product: Product;
  do {
    product = getRandomElement(MOCK_PRODUCTS);
  } while (product.stock === 0);

  // Generate order details
  const quantity = getWeightedQuantity(product.stock);
  const deliveryZone = getWeightedZone();
  const serviceType = getWeightedServiceType();

  // Calculate costs
  const productTotal = product.price * quantity;
  const shippingResult = calculateShippingPrice(
    {
      length: product.dimensions.length,
      width: product.dimensions.width,
      height: product.dimensions.height,
      weight: product.weight,
    },
    serviceType,
    DeliveryTiming.ASAP
  );
  const shippingCost = shippingResult.totalPrice;
  const totalCost = productTotal + shippingCost;

  // Generate customer data
  const customerName = generateCustomerName();
  const customerPhone = generatePhoneNumber();
  const customerEmail = generateEmail(customerName);
  const deliveryAddress = generateAddress();

  // Generate order status and date
  const status = getWeightedStatus();

  // Generate creation date (60% in last 30 days, 40% in days 31-90)
  const createdAt = Math.random() < 0.6 ? getRandomDate(30, 0) : getRandomDate(90, 31);

  // Calculate estimated delivery
  const estimatedDelivery = calculateEstimatedDelivery(createdAt, serviceType);

  // Generate order ID (similar to checkout modal pattern)
  const timestamp = createdAt.getTime();
  const orderId = `ORD-${timestamp.toString().slice(-8)}${orderNumber.toString().padStart(3, "0")}`;

  // Optional notes (20% chance)
  const notes =
    Math.random() < 0.2
      ? getRandomElement([
          "Please call before delivery",
          "Leave at reception desk",
          "Ring doorbell twice",
          "Deliver to back entrance",
          "Call 30 minutes before arrival",
          undefined,
        ])
      : undefined;

  return {
    id: orderId,
    product,
    quantity,
    productTotal,
    shippingCost,
    totalCost,
    deliveryZone,
    deliveryAddress,
    serviceType,
    estimatedDelivery,
    customerName,
    customerPhone,
    customerEmail,
    notes,
    status,
    createdAt,
  };
}

/**
 * Generate multiple mock orders
 * @param count Number of orders to generate (default: 225)
 */
export function generateMockOrders(count: number = 225): Order[] {
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    orders.push(generateSingleOrder(i + 1));
  }

  // Sort by creation date (newest first)
  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
