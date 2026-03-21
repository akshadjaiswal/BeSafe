"use client"

import { useState, useEffect } from "react"

export interface SearchResult {
  id: string
  name: string
  description: string
  lat: number
  lng: number
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
        const res = await fetch(
          `/api/geocode/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setResults(data.results || [])
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return
        setResults([])
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
