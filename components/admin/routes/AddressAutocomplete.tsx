"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";
import { GeocodingResult } from "@/lib/admin/route-types";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
  /** Current input value */
  value: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Callback when address is selected */
  onSelect: (result: GeocodingResult) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional class name */
  className?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Enter address...",
  disabled = false,
  className,
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset state if query is too short
    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/geocode?q=${encodeURIComponent(value)}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.results || []);
          setShowResults(true);

          if (data.results.length === 0) {
            setError(
              "No addresses found in Guatemala. Try searching with more details (e.g., street name, zone, city)."
            );
          }
        } else {
          setError(data.error || "Geocoding service error. Please try again in a moment.");
          setResults([]);
          console.error("Geocoding API error:", data);
        }
      } catch (err) {
        console.error("Geocoding network error:", err);
        setError("Network error connecting to geocoding service. Check your internet connection.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectResult = (result: GeocodingResult) => {
    onSelect(result);
    setShowResults(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "bg-background border-border focus:border-primary focus:ring-primary/20 border pr-10",
            className
          )}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && results.length > 0 && (
        <div className="bg-card border-border absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border shadow-lg">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="hover:bg-primary/10 border-border flex w-full items-start gap-2 border-b px-4 py-3 text-left transition-colors last:border-b-0"
            >
              <MapPin className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-foreground truncate text-sm font-medium">
                  {result.displayName}
                </div>
                {result.zone && (
                  <div className="text-muted-foreground mt-0.5 text-xs">
                    {result.zone.toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && !isLoading && (
        <div className="bg-card border-border absolute z-50 mt-1 w-full rounded-md border px-4 py-3 shadow-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Helper text */}
      {!showResults && !error && value.length > 0 && value.length < 3 && (
        <p className="text-muted-foreground mt-1 text-xs">Type at least 3 characters to search</p>
      )}
    </div>
  );
}
