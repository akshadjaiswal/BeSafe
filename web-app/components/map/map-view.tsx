"use client"

import { useRef, useCallback, useEffect } from "react"
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"

interface MapViewProps {
  onMapClick?: (lat: number, lng: number) => void
  departure?: { lat: number; lng: number; radius?: number } | null
  destination?: { lat: number; lng: number; radius?: number } | null
  className?: string
  interactive?: boolean
}

export function MapView({
  onMapClick,
  departure,
  destination,
  className = "w-full h-[400px]",
  interactive = true,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null)

  const handleClick = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (onMapClick && interactive) {
        onMapClick(e.lngLat.lat, e.lngLat.lng)
      }
    },
    [onMapClick, interactive]
  )

  // Fit bounds when both markers are set
  useEffect(() => {
    if (departure && destination && mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(departure.lng, destination.lng) - 0.01,
          Math.min(departure.lat, destination.lat) - 0.01,
        ],
        [
          Math.max(departure.lng, destination.lng) + 0.01,
          Math.max(departure.lat, destination.lat) + 0.01,
        ],
      ]
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1000 })
    }
  }, [departure, destination])

  // Create geofence circle GeoJSON
  const createCircle = (center: { lat: number; lng: number }, radius: number) => {
    const points = 64
    const coords = []
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const dx = (radius / 111320) * Math.cos(angle)
      const dy = (radius / (111320 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle)
      coords.push([center.lng + dy, center.lat + dx])
    }
    coords.push(coords[0]) // Close the polygon
    return {
      type: "Feature" as const,
      geometry: {
        type: "Polygon" as const,
        coordinates: [coords],
      },
      properties: {},
    }
  }

  // Default center: Pune, India
  const center = departure || destination || { lat: 18.5204, lng: 73.8567 }

  return (
    <div className={`${className} rounded-3xl overflow-hidden`}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: 13,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onClick={handleClick}
        cursor={interactive ? "crosshair" : "grab"}
      >
        {/* Departure marker & geofence */}
        {departure && (
          <>
            <Source
              id="departure-geofence"
              type="geojson"
              data={createCircle(departure, departure.radius || 200)}
            >
              <Layer
                id="departure-geofence-fill"
                type="fill"
                paint={{
                  "fill-color": "#6750A4",
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id="departure-geofence-border"
                type="line"
                paint={{
                  "line-color": "#6750A4",
                  "line-width": 2,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
            <Marker latitude={departure.lat} longitude={departure.lng} anchor="center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-elevation-2 border-2 border-white">
                <span className="text-primary-on text-xs font-bold">A</span>
              </div>
            </Marker>
          </>
        )}

        {/* Destination marker & geofence */}
        {destination && (
          <>
            <Source
              id="destination-geofence"
              type="geojson"
              data={createCircle(destination, destination.radius || 200)}
            >
              <Layer
                id="destination-geofence-fill"
                type="fill"
                paint={{
                  "fill-color": "#7D5260",
                  "fill-opacity": 0.15,
                }}
              />
              <Layer
                id="destination-geofence-border"
                type="line"
                paint={{
                  "line-color": "#7D5260",
                  "line-width": 2,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
            <Marker latitude={destination.lat} longitude={destination.lng} anchor="center">
              <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center shadow-elevation-2 border-2 border-white">
                <span className="text-tertiary-on text-xs font-bold">B</span>
              </div>
            </Marker>
          </>
        )}

        {/* Connecting line */}
        {departure && destination && (
          <Source
            id="route-line"
            type="geojson"
            data={{
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: [
                  [departure.lng, departure.lat],
                  [destination.lng, destination.lat],
                ],
              },
              properties: {},
            }}
          >
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                "line-color": "#79747E",
                "line-width": 2,
                "line-dasharray": [4, 4],
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  )
}
