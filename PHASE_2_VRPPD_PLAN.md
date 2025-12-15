# Phase 2: VRPPD Implementation Plan
## Vehicle Routing Problem with Pickup and Delivery

**Status:** ✅ COMPLETE (All tasks finished)
**Completion Date:** December 2025
**Actual Time:** 1 day
**Prerequisites:** Phase 1 (OSRM Table API) ✅ Complete

---

## ✅ Phase 2 Complete - Summary

**All objectives achieved:**
- ✅ Data model extended with VRPPD fields (backward compatible)
- ✅ Validation module with comprehensive constraint checking
- ✅ 33 unit tests, all passing
- ✅ UI integration in experimental route optimizer
- ✅ 2 Guatemala City test scenarios (valid + invalid)
- ✅ Jest testing infrastructure set up
- ✅ Full documentation in CHANGELOG.md

**Next Steps:** See `/PHASE_3_VRPPD_PLAN.md` for algorithm implementation

---

## Original Plan (Completed Below)

---

## Overview

Implement pickup/dropoff pairing constraints for delivery route optimization. This allows drivers to pick up packages from one location and deliver to another, with flexible batching rules based on package type.

### Business Requirements (from user)

- **Mixed Mode:** Some deliveries are strict pairs (immediate delivery), others can batch
- **Unlimited Capacity:** No weight/volume constraints initially (future enhancement)
- **Precedence:** Pickup must always come before dropoff in route sequence
- **Pairing:** Both pickup and dropoff must be on same route

---

## Phase 2 Implementation Steps

### Step 1: Data Model Extensions

#### 1.1 Extend RouteStop Interface

**File:** `/lib/admin/route-types.ts`

**Add new fields:**

```typescript
export interface RouteStop {
  // ... existing fields ...

  /** Stop type for VRPPD (default: 'delivery' for backward compatibility) */
  stopType?: 'pickup' | 'dropoff' | 'delivery';

  /** ID of paired stop (pickup ↔ dropoff relationship) */
  pairedStopId?: string;

  /** Delivery ticket ID for grouping related stops */
  deliveryId?: string;

  /** Time window constraints (future use) */
  timeWindow?: {
    earliest: Date;
    latest: Date;
  };

  /** Service time at stop in minutes (default: 5) */
  serviceTime?: number;
}
```

**Backward Compatibility:**
- All fields optional
- Default `stopType` is `'delivery'` (current behavior)
- Existing routes without these fields continue to work

#### 1.2 Extend DeliveryTicket Interface

**File:** `/lib/admin/driver-assist-types.ts`

**Add new fields:**

```typescript
export interface DeliveryTicket {
  // ... existing fields ...

  /** Pairing mode for route optimization */
  pairingMode?: 'strict' | 'flexible' | 'none';
  // strict: pickup and dropoff must be immediate pair (no batching)
  // flexible: can pick up multiple before dropping off (batching allowed)
  // none: regular delivery (current behavior, default)

  /** Pickup stop ID (if this is a paired delivery) */
  pickupStopId?: string;

  /** Dropoff stop ID (if this is a paired delivery) */
  dropoffStopId?: string;
}
```

**Use Cases:**
- **Strict:** Medical samples, legal documents, perishables
- **Flexible:** E-commerce packages, standard parcels
- **None:** Regular point-to-point deliveries (current)

---

### Step 2: VRPPD Constraint Validator

#### 2.1 Create Validation Module

**File:** `/lib/admin/vrppd-constraints.ts` (NEW)

**Purpose:** Validate routes respect pickup/dropoff constraints (no optimization yet)

**Core Functions:**

```typescript
/**
 * Validate that route respects all VRPPD constraints
 */
export function validateVRPPDRoute(
  stops: RouteStop[]
): {
  valid: boolean;
  violations: ViolationReport[];
}

interface ViolationReport {
  type: 'precedence' | 'pairing' | 'time-window';
  stopId: string;
  pairedStopId?: string;
  message: string;
}

/**
 * Check precedence constraint: pickup before dropoff
 */
export function validatePrecedence(stops: RouteStop[]): boolean {
  const stopMap = new Map(stops.map((s, i) => [s.id, i]));

  for (const stop of stops) {
    if (stop.stopType === 'dropoff' && stop.pairedStopId) {
      const pickupIndex = stopMap.get(stop.pairedStopId);
      const dropoffIndex = stopMap.get(stop.id);

      if (pickupIndex === undefined) {
        return false; // Missing paired pickup
      }

      if (pickupIndex >= dropoffIndex) {
        return false; // Dropoff before pickup - VIOLATION
      }
    }
  }

  return true;
}

/**
 * Check pairing constraint: both on same route
 */
export function validatePairing(
  routes: RouteStop[][],
  tickets: DeliveryTicket[]
): boolean {
  for (const ticket of tickets) {
    if (ticket.pairingMode === 'strict' && ticket.pickupStopId && ticket.dropoffStopId) {
      const pickupRoute = routes.findIndex(r => r.some(s => s.id === ticket.pickupStopId));
      const dropoffRoute = routes.findIndex(r => r.some(s => s.id === ticket.dropoffStopId));

      if (pickupRoute !== dropoffRoute) {
        return false; // Paired stops on different routes - VIOLATION
      }
    }
  }

  return true;
}

/**
 * Get human-readable violation messages
 */
export function getViolationMessages(violations: ViolationReport[]): string[] {
  return violations.map(v => {
    switch (v.type) {
      case 'precedence':
        return `Stop ${v.stopId} (dropoff) must come after ${v.pairedStopId} (pickup)`;
      case 'pairing':
        return `Stops ${v.stopId} and ${v.pairedStopId} must be on same route`;
      case 'time-window':
        return `Stop ${v.stopId} violates time window constraint`;
      default:
        return `Unknown violation at stop ${v.stopId}`;
    }
  });
}
```

---

### Step 3: Database Schema Updates

#### 3.1 Update Routes Table

**File:** `/lib/db/schema.sql` (if needed)

**Add columns to `route_stops` table:**

```sql
ALTER TABLE route_stops ADD COLUMN stop_type VARCHAR(10) DEFAULT 'delivery';
ALTER TABLE route_stops ADD COLUMN paired_stop_id VARCHAR(255);
ALTER TABLE route_stops ADD COLUMN delivery_id VARCHAR(255);
ALTER TABLE route_stops ADD COLUMN service_time INTEGER DEFAULT 5;
ALTER TABLE route_stops ADD COLUMN time_window_earliest TIMESTAMP;
ALTER TABLE route_stops ADD COLUMN time_window_latest TIMESTAMP;
```

#### 3.2 Update Delivery Tickets Table

**Add columns to `delivery_tickets` table:**

```sql
ALTER TABLE delivery_tickets ADD COLUMN pairing_mode VARCHAR(10) DEFAULT 'none';
ALTER TABLE delivery_tickets ADD COLUMN pickup_stop_id VARCHAR(255);
ALTER TABLE delivery_tickets ADD COLUMN dropoff_stop_id VARCHAR(255);
```

**Note:** Only update database if persisting these fields. For MVP, can start with in-memory/frontend-only implementation.

---

### Step 4: UI/UX Enhancements

#### 4.1 Route Builder UI Updates

**File:** `/components/admin/routes/RouteBuilder.tsx` (or similar)

**Add pickup/dropoff controls:**

```typescript
// When adding a stop to route
<Select value={stopType} onValueChange={setStopType}>
  <SelectItem value="delivery">Regular Delivery</SelectItem>
  <SelectItem value="pickup">Pickup Point</SelectItem>
  <SelectItem value="dropoff">Dropoff Point</SelectItem>
</Select>

// If pickup/dropoff selected, show pairing UI
{(stopType === 'pickup' || stopType === 'dropoff') && (
  <div>
    <Label>Paired With</Label>
    <Select value={pairedStopId} onValueChange={setPairedStopId}>
      {/* Show other stops of opposite type */}
    </Select>

    <Label>Pairing Mode</Label>
    <Select value={pairingMode} onValueChange={setPairingMode}>
      <SelectItem value="strict">Strict (immediate delivery)</SelectItem>
      <SelectItem value="flexible">Flexible (can batch)</SelectItem>
    </Select>
  </div>
)}
```

#### 4.2 Validation Feedback

**Show violations to user:**

```typescript
const { valid, violations } = validateVRPPDRoute(route.stops);

{!valid && (
  <AdminInfoBox variant="error">
    <h4>Route Validation Errors:</h4>
    <ul>
      {getViolationMessages(violations).map((msg, i) => (
        <li key={i}>{msg}</li>
      ))}
    </ul>
  </AdminInfoBox>
)}
```

---

### Step 5: Testing Strategy

#### 5.1 Unit Tests

**File:** `__tests__/vrppd-constraints.test.ts` (NEW)

**Test cases:**

```typescript
describe('VRPPD Constraint Validation', () => {
  test('Rejects route with dropoff before pickup', () => {
    const stops = [
      { id: '1', stopType: 'dropoff', pairedStopId: '2' },
      { id: '2', stopType: 'pickup' },
    ];
    expect(validatePrecedence(stops)).toBe(false);
  });

  test('Accepts route with pickup before dropoff', () => {
    const stops = [
      { id: '1', stopType: 'pickup' },
      { id: '2', stopType: 'dropoff', pairedStopId: '1' },
    ];
    expect(validatePrecedence(stops)).toBe(true);
  });

  test('Rejects paired stops on different routes', () => {
    const route1 = [{ id: '1', stopType: 'pickup' }];
    const route2 = [{ id: '2', stopType: 'dropoff', pairedStopId: '1' }];
    const tickets = [{
      id: 't1',
      pairingMode: 'strict',
      pickupStopId: '1',
      dropoffStopId: '2'
    }];
    expect(validatePairing([route1, route2], tickets)).toBe(false);
  });

  test('Allows flexible deliveries to batch with strict pairs', () => {
    const stops = [
      { id: '1', stopType: 'pickup', pairingMode: 'strict' },
      { id: '2', stopType: 'pickup', pairingMode: 'flexible' },
      { id: '3', stopType: 'dropoff', pairedStopId: '1', pairingMode: 'strict' },
      { id: '4', stopType: 'dropoff', pairedStopId: '2', pairingMode: 'flexible' },
    ];
    expect(validatePrecedence(stops)).toBe(true);
  });
});
```

#### 5.2 Integration Tests

**Test with Guatemala City scenarios:**

1. **Medical Supplies Route (Strict Pairing)**
   - Pickup from hospital A
   - Dropoff at clinic B
   - Must be immediate pair

2. **E-commerce Route (Flexible Batching)**
   - Pickup from warehouse
   - Multiple dropoffs across zones
   - Can batch pickups before dropoffs

3. **Mixed Route**
   - 2 strict pairs (medical)
   - 4 flexible deliveries (packages)
   - Verify all constraints respected

---

## Future Enhancements (Phase 3+)

### Phase 3: VRPPD-Aware Optimization Algorithm

Currently, Nearest Neighbor doesn't consider pickup/dropoff constraints. Need to enhance:

**Option 1: Insertion Heuristics**
- Start with strict pairs inserted as blocks
- Insert flexible stops optimally between pairs
- Simpler, faster, good for most cases

**Option 2: Google OR-Tools Integration**
- Use constraint programming solver
- Handles complex constraints automatically
- More powerful but requires external dependency

**Recommended:** Start with insertion heuristics, upgrade to OR-Tools if needed.

### Phase 4: Capacity Constraints

Add vehicle capacity tracking:

```typescript
interface RouteConfig {
  vehicleCapacity?: {
    maxWeight: number; // kg
    maxVolume: number; // cubic meters
    maxPackages: number; // count
  };
}

interface DeliveryTicket {
  packageWeight?: number;
  packageVolume?: number;
}
```

Validate capacity not exceeded during route:
- Track current load at each stop
- Pickup increases load
- Dropoff decreases load
- Never exceed vehicle limits

### Phase 5: Time Window Constraints

Enforce delivery time windows:

```typescript
interface RouteStop {
  timeWindow?: {
    earliest: Date; // Can't arrive before this
    latest: Date;   // Must arrive before this
  };
}
```

Algorithm must:
- Calculate arrival times
- Reject routes violating windows
- Optimize to minimize time window violations

---

## Implementation Checklist

### Phase 2 (Validation Only)

- [ ] Extend `RouteStop` interface with VRPPD fields
- [ ] Extend `DeliveryTicket` interface with pairing mode
- [ ] Create `vrppd-constraints.ts` validation module
- [ ] Implement `validatePrecedence()` function
- [ ] Implement `validatePairing()` function
- [ ] Implement `getViolationMessages()` helper
- [ ] Write unit tests for validation logic
- [ ] Update route builder UI with pickup/dropoff controls
- [ ] Add validation feedback to route creation
- [ ] Test with Guatemala City mixed-mode scenarios
- [ ] Update documentation (CHANGELOG, README)
- [ ] (Optional) Update database schema for persistence

### Phase 3 (Algorithm - Future)

- [ ] Research insertion heuristics for VRPPD
- [ ] Implement VRPPD-aware Nearest Neighbor variant
- [ ] Test performance vs current algorithm
- [ ] Benchmark with real Guatemala City data
- [ ] Consider Google OR-Tools integration if needed

### Phase 4 (Capacity - Future)

- [ ] Add vehicle capacity to RouteConfig
- [ ] Add package dimensions to DeliveryTicket
- [ ] Implement capacity tracking during route
- [ ] Add capacity violation detection
- [ ] Update UI to show capacity utilization

---

## Research Resources

### VRPPD Academic Papers
- [Google OR-Tools VRPPD Documentation](https://developers.google.com/optimization/routing/pickup_delivery)
- [Vehicle Routing Problem - Wikipedia](https://en.wikipedia.org/wiki/Vehicle_routing_problem)
- [2025 Research on VRPPD Algorithms](https://www.sciencedirect.com/science/article/abs/pii/S2210650225003736)

### Implementation Examples
- [GitHub: Vehicle-Routing-Problem (Python)](https://github.com/heet9022/Vehicle-Routing-Problem)
- [Medium: VRPPD for Beer Delivery (VRPy)](https://medium.com/@trentleslie/leveraging-the-vehicle-route-problem-with-pickup-and-dropoff-vrppd-for-optimized-beer-delivery-in-392117d69033)

### Optimization Tools
- **Google OR-Tools:** Constraint programming (Python, C++, Java, C#)
- **VRPy:** Python library for VRP variants
- **VROOM:** Open-source vehicle routing engine (C++)

---

## Success Criteria

### Phase 2 (Validation)
- ✅ Data model supports pickup/dropoff pairs
- ✅ Validation detects all constraint violations
- ✅ UI allows creating paired deliveries
- ✅ Users see clear error messages for violations
- ✅ All tests pass
- ✅ Backward compatible with existing routes

### Phase 3 (Algorithm)
- Routes respect all precedence constraints
- Routes respect all pairing constraints
- Performance remains acceptable (<2s for 25 stops)
- Route quality comparable to unconstrained optimization

### Phase 4 (Capacity)
- Never exceed vehicle capacity
- Maximize vehicle utilization
- Clear capacity feedback in UI

---

## Risk Mitigation

### Risk: Algorithm Complexity
**Impact:** VRPPD is NP-hard, may be slow for large routes
**Mitigation:** Start with simple insertion heuristics, optimize only if needed

### Risk: User Confusion
**Impact:** Pickup/dropoff concept may be unclear
**Mitigation:** Clear UI labels, tooltips, example scenarios, tutorial

### Risk: Backward Compatibility
**Impact:** Existing routes might break
**Mitigation:** All new fields optional, default values preserve current behavior

### Risk: Performance Degradation
**Impact:** Constraint checking might slow down optimization
**Mitigation:** Only validate when VRPPD fields present, skip validation for regular routes

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| **Phase 2 Total** | **2-3 days** | ⏳ Ready |
| Data model extensions | 2 hours | ⏳ |
| Validation module | 4 hours | ⏳ |
| Unit tests | 2 hours | ⏳ |
| UI updates | 4 hours | ⏳ |
| Integration testing | 2 hours | ⏳ |
| Documentation | 2 hours | ⏳ |
| **Phase 3 Total** | **1-2 weeks** | 📅 Future |
| Algorithm research | 1 day | 📅 |
| Implementation | 3-4 days | 📅 |
| Testing & optimization | 2-3 days | 📅 |

---

## Questions to Resolve Before Implementation

1. **Database Persistence:**
   - Should we persist VRPPD fields to database immediately?
   - Or start with in-memory/frontend-only implementation?

2. **Default Behavior:**
   - When user creates a new delivery, what's the default `pairingMode`?
   - Suggest: `'none'` for backward compatibility

3. **UI Placement:**
   - Where should pickup/dropoff controls appear?
   - Route builder? Delivery ticket creation? Both?

4. **Validation Timing:**
   - When to validate constraints?
   - During route creation? Before optimization? Both?

5. **Error Handling:**
   - What happens if optimization produces invalid route?
   - Reject and ask user to fix? Auto-fix by swapping stops?

---

**Next Steps:** Review this plan, answer questions above, then begin Phase 2 implementation when ready.
