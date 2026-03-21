import { NextResponse } from "next/server"

interface SearchResult {
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
      id: `${lat.toFixed(5)},${lng.toFixed(5)}`,
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
      id: `${lat.toFixed(5)},${lng.toFixed(5)}`,
      name,
      description,
      lat,
      lng,
    }
  })
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || query.length < 3) {
    return NextResponse.json({ results: [] })
  }

  const encoded = encodeURIComponent(query)

  // Query both APIs in parallel
  const [photonResults, nominatimResults] = await Promise.all([
    fetchPhoton(encoded),
    fetchNominatim(encoded),
  ])

  // Merge: Nominatim first (better for business names), then Photon
  const merged = deduplicateResults([...nominatimResults, ...photonResults])

  return NextResponse.json({ results: merged.slice(0, 7) })
}

async function fetchPhoton(encodedQuery: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodedQuery}&lang=en&limit=5`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    return parsePhotonResults(data.features || [])
  } catch {
    return []
  }
}

async function fetchNominatim(encodedQuery: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BeSafe/1.0 (safe-arrival-notifications)",
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return parseNominatimResults(data || [])
  } catch {
    return []
  }
}
