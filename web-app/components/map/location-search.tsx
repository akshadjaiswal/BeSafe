"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Crosshair, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useLocationSearch } from "@/hooks/use-location-search"
import { MATERIAL_EASING, MATERIAL_DURATION } from "@/lib/motion"

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  placeholder?: string
}

export function LocationSearch({
  onLocationSelect,
  placeholder = "Search location...",
}: LocationSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const { results, isLoading, clear } = useLocationSearch(query)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const showDropdown = isOpen && query.length >= 3 && (results.length > 0 || isLoading || (!isLoading && query.length >= 3))

  const handleSelect = useCallback(
    (lat: number, lng: number, name: string, description: string) => {
      const address = `${name}, ${description}`
      onLocationSelect(lat, lng, address)
      setQuery(name)
      setIsOpen(false)
      clear()
      inputRef.current?.blur()
    },
    [onLocationSelect, clear]
  )

  const handleClear = () => {
    setQuery("")
    setIsOpen(false)
    clear()
    inputRef.current?.focus()
  }

  const handleCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          )
          const data = await res.json()
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          onLocationSelect(latitude, longitude, address)
          setQuery(address.split(",")[0] || "Current location")
          setIsOpen(false)
          clear()
        } catch {
          onLocationSelect(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          setQuery("Current location")
        } finally {
          setGettingLocation(false)
        }
      },
      () => {
        toast.error("Could not get your location. Please enable location access.")
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onLocationSelect, clear])

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleBlur = () => {
    // Delay to allow click on result to fire before closing
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-on-variant pointer-events-none" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-11 pr-10"
            autoComplete="off"
          />
          {query && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors duration-300 ease-material"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-surface-on-variant" />
            </button>
          )}
        </div>
        <button
          onClick={handleCurrentLocation}
          disabled={gettingLocation}
          className="w-12 h-12 flex items-center justify-center rounded-2xl border border-outline hover:bg-surface-container-highest active:scale-95 transition-all duration-300 ease-material disabled:opacity-50 shrink-0"
          aria-label="Use current location"
          title="Use current location"
        >
          <Crosshair className={`w-5 h-5 text-surface-on-variant ${gettingLocation ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: MATERIAL_DURATION, ease: MATERIAL_EASING as unknown as number[] }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-12 top-full mt-2 z-10 rounded-2xl bg-surface-container-high shadow-elevation-2 border border-outline-variant overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 text-surface-on-variant animate-spin" />
                <span className="text-sm text-surface-on-variant">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-4 text-center">
                <span className="text-sm text-surface-on-variant">No places found</span>
              </div>
            ) : (
              <div className="py-1">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: MATERIAL_DURATION,
                      delay: index * 0.05,
                      ease: MATERIAL_EASING as unknown as number[],
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(result.lat, result.lng, result.name, result.description)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-highest transition-colors duration-300 ease-material min-h-[44px]"
                  >
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-on truncate">{result.name}</p>
                      <p className="text-xs text-surface-on-variant truncate">{result.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
