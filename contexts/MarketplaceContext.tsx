"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  MarketplaceView,
  FilterState,
  SortOption,
  ProductCategory,
} from "@/lib/marketplace/types";
import { ServiceType } from "@/lib/types";
import {
  getUserPreferences,
  setUserZone as saveUserZone,
  setPreferredView,
  setPreferredServiceType,
} from "@/lib/marketplace/storage";

interface MarketplaceContextType {
  // Zone state
  userZone: string | null;
  setUserZone: (zone: string) => void;

  // View state
  currentView: MarketplaceView;
  setCurrentView: (view: MarketplaceView) => void;

  // Service type
  serviceType: ServiceType;
  setServiceType: (type: ServiceType) => void;

  // Filter state
  filterState: FilterState;
  setFilterState: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Sort state
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;

  // Zone modal state
  showZoneModal: boolean;
  setShowZoneModal: (show: boolean) => void;
}

const defaultFilterState: FilterState = {
  category: "all",
  priceRange: { min: 0, max: 1000 },
  zones: [],
  inStock: false,
  minRating: 0,
  searchQuery: "",
};

export const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [userZone, setUserZoneState] = useState<string | null>(null);
  const [currentView, setCurrentViewState] = useState<MarketplaceView>(MarketplaceView.AMAZON);
  const [serviceType, setServiceTypeState] = useState<ServiceType>(ServiceType.STANDARD);
  const [filterState, setFilterStateInternal] = useState<FilterState>(defaultFilterState);
  const [sortOption, setSortOptionState] = useState<SortOption>(SortOption.RELEVANCE);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const prefs = getUserPreferences();
    setUserZoneState(prefs.deliveryZone);
    setCurrentViewState(prefs.preferredView);
    setServiceTypeState(prefs.preferredServiceType);
    setIsInitialized(true);

    // Show zone modal if user hasn't set zone
    if (!prefs.deliveryZone) {
      setShowZoneModal(true);
    }
  }, []);

  // Persist zone to localStorage
  const setUserZone = (zone: string) => {
    setUserZoneState(zone);
    saveUserZone(zone);
    setShowZoneModal(false);  // Close modal when zone is set
  };

  // Persist view to localStorage
  const setCurrentView = (view: MarketplaceView) => {
    setCurrentViewState(view);
    setPreferredView(view);
  };

  // Persist service type to localStorage
  const setServiceType = (type: ServiceType) => {
    setServiceTypeState(type);
    setPreferredServiceType(type);
  };

  // Update filter state
  const setFilterState = (filters: Partial<FilterState>) => {
    setFilterStateInternal((prev) => ({ ...prev, ...filters }));
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilterStateInternal(defaultFilterState);
  };

  // Set sort option
  const setSortOption = (sort: SortOption) => {
    setSortOptionState(sort);
  };

  const value = {
    userZone,
    setUserZone,
    currentView,
    setCurrentView,
    serviceType,
    setServiceType,
    filterState,
    setFilterState,
    resetFilters,
    sortOption,
    setSortOption,
    showZoneModal,
    setShowZoneModal,
  };

  // Don't render until initialized to avoid hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error("useMarketplace must be used within a MarketplaceProvider");
  }
  return context;
}
