import { useEffect, useState } from "react"
import { API_BASE_URL } from "../config/api"

// Header.jsx renders inside every page component (no shared app shell), so
// it unmounts/remounts on every route change. Without this module-scoped
// cache, every single navigation would re-fetch Fabric/Category/Color for
// the navbar dropdowns. This data is admin-managed and changes rarely, so a
// page-load-lifetime cache (not live-invalidated - a hard refresh re-fetches)
// is a deliberate tradeoff rather than pulling in a caching library for
// three small unfiltered lists.
let cache = null
let inFlight = null

const fetchTaxonomy = async () => {
  const [fabricsRes, categoriesRes, colorsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/fabrics`),
    fetch(`${API_BASE_URL}/api/categories`),
    fetch(`${API_BASE_URL}/api/colors`),
  ])
  const [fabricsData, categoriesData, colorsData] = await Promise.all([
    fabricsRes.json(),
    categoriesRes.json(),
    colorsRes.json(),
  ])

  return {
    fabrics: fabricsData.data || [],
    categories: categoriesData.data || [],
    colors: colorsData.data || [],
  }
}

export const useCatalogTaxonomy = () => {
  const [taxonomy, setTaxonomy] = useState(cache)
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return

    if (!inFlight) {
      inFlight = fetchTaxonomy()
        .then((result) => {
          cache = result
          return result
        })
        .catch((error) => {
          console.error("Failed to load navbar catalog data:", error)
          cache = { fabrics: [], categories: [], colors: [] }
          return cache
        })
        .finally(() => {
          inFlight = null
        })
    }

    inFlight.then((result) => {
      setTaxonomy(result)
      setLoading(false)
    })
  }, [])

  return {
    fabrics: taxonomy?.fabrics || [],
    categories: taxonomy?.categories || [],
    colors: taxonomy?.colors || [],
    loading,
  }
}
