"use client"

import { useState, useEffect } from "react"

export interface SearchResult {
  id: string
  name: string
  description: string
  lat: number
  lng: number
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    country?: string
    district?: string
    locality?: string
    postcode?: string
  }
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  name?: string
}

function parsePhotonResults(features: PhotonFeature[]): SearchResult[] {
  return features.map((f) => {
    const p = f.properties
    const [lng, lat] = f.geometry.coordinates
    const name = p.name || p.street || p.locality || p.district || "Unknown"
    const parts = [p.city, p.state, p.country].filter(Boolean)
    const description = parts.join(", ") || "Location"

    return {
      id: `${lat},${lng}`,
      name,
      description,
      lat,
      lng,
    }
  })
}

function parseNominatimResults(results: NominatimResult[]): SearchResult[] {
  return results.map((r) => {
    const lat = parseFloat(r.lat)
    const lng = parseFloat(r.lon)
    const parts = r.display_name.split(", ")
    const name = r.name || parts[0] || "Unknown"
    const description = parts.slice(1, 4).join(", ") || "Location"

    return {
      id: `${lat},${lng}`,
      name,
      description,
      lat,
      lng,
    }
  })
}

export function useLocationSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const controller = new AbortController()

    const timeout = setTimeout(async () => {
      try {
        // Try Photon first (faster, no strict rate limit)
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en&limit=5`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults(parsePhotonResults(data.features || []))
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return

        // Fallback to Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
            {
              signal: controller.signal,
              headers: { "Accept-Language": "en" },
            }
          )
          const data = await res.json()
          setResults(parseNominatimResults(data || []))
        } catch (fallbackErr: unknown) {
          if (fallbackErr instanceof Error && fallbackErr.name === "AbortError") return
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 400)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const clear = () => {
    setResults([])
    setIsLoading(false)
  }

  return { results, isLoading, clear }
}
