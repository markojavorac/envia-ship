# Fleet Optimizer - Experimental Feature

**Status**: 🚧 **In Development** - Core algorithms implemented, but optimization has runtime errors

**Location**: `/admin/experiments/fleet-optimizer`

## Overview

Graph-based multi-vehicle routing system using the Clarke-Wright Savings Algorithm. Attempts to distribute delivery stops across multiple vehicles while respecting package capacity constraints and pickup/dropoff precedence.

## What We Built

### Core Components

1. **Data Models** (`/lib/admin/fleet-types.ts`, `/lib/admin/fleet-graph-types.ts`)
   - Vehicle types with package capacity (Motorcycle: 5, Van: 20, Truck: 50)
   - Fleet configuration with multiple vehicles
   - Graph representation (nodes = stops, edges = routes)
   - Multi-vehicle solution structure

2. **Clarke-Wright Algorithm** (`/lib/admin/fleet-optimizer/clarke-wright.ts`)
   - Industry-standard VRP heuristic (O(n² log n))
   - Calculates "savings" for merging routes
   - Assigns stops across multiple vehicles
   - Respects package capacity constraints
   - **Status**: ⚠️ Has indexing bugs causing "Cannot read properties of undefined" errors

3. **VRPPD Support** (`/lib/admin/fleet-optimizer/vrppd-repair.ts`)
   - Post-processing to fix pickup→dropoff precedence violations
   - Validates constraints from existing `vrppd-constraints.ts`
   - **Status**: ⚠️ Not tested with actual pickup/dropoff data

4. **Graph Visualization** (`/components/admin/fleet-optimizer/GraphVisualization.tsx`)
   - Uses Cytoscape.js for interactive network diagram
   - Nodes: depot (orange), pickup (blue), dropoff (green), delivery (gray)
   - Edges: colored by vehicle assignment
   - **Status**: ⚠️ May not be rendering - needs verification

5. **UI Components**
   - `FleetConfigForm.tsx` - Add/remove vehicles, set depot
   - `StopInput.tsx` - Add stops with package counts
   - `FleetMetrics.tsx` - Performance statistics
   - `RouteDetailsTable.tsx` - Expandable route details
   - **Status**: ✅ UI renders correctly

6. **Demo Data** (`/lib/admin/fleet-optimizer/demo-data.ts`)
   - 18 realistic Guatemala City addresses
   - Distributed across multiple zones
   - Various package counts
   - **Status**: ✅ Loads successfully

## Known Issues

### Critical
1. **Optimization fails with runtime error**
   - Error: "Cannot read properties of undefined (reading '25')"
   - Location: Distance matrix indexing in `clarke-wright.ts`
   - Last attempted fix: Changed from `indexOf` to Map-based lookup
   - **Status**: Still broken as of last test

2. **Graph visualization may not render**
   - Cytoscape.js component exists but unclear if nodes/edges display
   - No error in console but visual output uncertain
   - May need CSS or layout configuration

### Minor
3. **Empty state shows before data loads**
4. **No loading indicators during OSRM distance calculation**
5. **Fleet config depot address input doesn't geocode**

## File Structure

```
/app/admin/experiments/fleet-optimizer/
├── page.tsx                    # Main page (handles state, optimization trigger)
└── README.md                   # This file

/lib/admin/fleet-optimizer/
├── clarke-wright.ts            # ⚠️ Main algorithm (HAS BUGS)
├── fleet-metrics.ts            # Stats calculations (works)
├── vrppd-repair.ts             # Constraint fixing (untested)
├── graph-builder.ts            # Graph construction (works)
├── vehicle-presets.ts          # Vehicle type definitions (works)
└── demo-data.ts                # Sample stops (works)

/lib/admin/
├── fleet-types.ts              # Core type definitions (complete)
└── fleet-graph-types.ts        # Graph types (complete)

/components/admin/fleet-optimizer/
├── FleetConfigForm.tsx         # Vehicle management UI (works)
├── StopInput.tsx               # Stop input UI (works)
├── GraphVisualization.tsx      # Cytoscape network graph (uncertain)
├── FleetMetrics.tsx            # Metrics display (works)
├── RouteDetailsTable.tsx       # Route details (works)
└── (FleetSolutionView.tsx - NOT CREATED)
└── (VehicleRouteMap.tsx - NOT CREATED)
```

## Key Concepts

### Clarke-Wright Savings Algorithm
1. Start with each stop as its own route (depot → stop → depot)
2. Calculate "savings" for merging routes: `S(i,j) = d(depot,i) + d(depot,j) - d(i,j)`
3. Sort savings in descending order
4. Greedily merge routes that save the most distance (if capacity allows)
5. Continue until no more beneficial merges

### Graph Representation
- **Nodes**: Stops in the delivery network
- **Edges**: Connections with distance/time costs
- **Visualization**: Cytoscape.js renders interactive diagram

### Distance Matrix
- Built using OSRM Table API (batch request)
- Depot at index 0, stops at indices 1-N
- **Critical**: All lookups must use consistent indexing

## What's Likely Working

✅ UI components render correctly
✅ Fleet configuration (add/remove vehicles)
✅ Demo data loads (15 stops)
✅ Distance matrix fetching (OSRM integration)
✅ Type system is complete and correct
✅ Visual design matches app style

## What's Broken

❌ Clarke-Wright optimization (index errors)
❌ Graph visualization (uncertain if displaying)
❌ Full end-to-end flow (Load Demo → Optimize → See Results)

## Next Steps for Fixing

1. **Debug Clarke-Wright indexing**
   - Add console.logs to track matrix indices
   - Verify `stopToIndexMap` is built correctly
   - Check all distance matrix accesses use valid indices
   - Test with small data set (3-5 stops)

2. **Verify graph visualization**
   - Check browser console for Cytoscape errors
   - Inspect DOM to see if canvas/SVG elements exist
   - Test with hardcoded graph data (bypass optimization)
   - Review Cytoscape initialization in `GraphVisualization.tsx`

3. **Add error boundaries**
   - Wrap optimization in try/catch with better error messages
   - Show user-friendly error states
   - Log full stack traces for debugging

4. **Test with minimal data**
   - 2 stops, 1 vehicle (simplest case)
   - Verify each step: distance matrix → savings → merge → solution

## Dependencies

**Added**:
- `cytoscape@^3.30.0` - Graph rendering
- `react-cytoscapejs@^2.0.0` - React wrapper
- `@types/cytoscape@^3.21.0` - TypeScript types

**Reused**:
- OSRM integration (`buildDistanceMatrixAsync` from `route-utils.ts`)
- VRPPD validation (`validateVRPPDRoute` from `vrppd-constraints.ts`)
- Admin UI components (`AdminCard`, `AdminInfoBox`, etc.)

## Testing Checklist

- [ ] Load demo data → 15 stops appear in list
- [ ] Click optimize → No error, loading state shows
- [ ] Results appear → Metrics, graph, table all render
- [ ] Graph shows colored nodes and edges
- [ ] Click node in graph → Shows stop details
- [ ] Expand route in table → Shows stop sequence
- [ ] Add manual stop → Works with geocoding
- [ ] Clear all stops → Returns to empty state

## Architecture Decisions

**Why Clarke-Wright?**
- Industry-proven since 1964
- Native multi-vehicle support
- Handles capacity constraints elegantly
- Fast enough for 50+ stops
- Simple to implement (~400 LOC)

**Why Cytoscape.js?**
- Purpose-built for network graphs
- Good React integration
- Built-in layouts (force-directed)
- Interactive by default

**Why package count only (not weight/volume)?**
- MVP simplification
- Easier to understand/demo
- Can add weight/volume later

## References

- Clarke-Wright algorithm: Clarke & Wright (1964)
- OSRM Table API: https://router.project-osrm.org/table/v1
- Cytoscape.js docs: https://js.cytoscape.org/
- Existing route optimizer: `/app/admin/experiments/route-optimizer`

---

**Last Updated**: 2025-12-16
**Created By**: Claude Code during graph-based VRP implementation session
**Status**: Incomplete - needs debugging before usable
