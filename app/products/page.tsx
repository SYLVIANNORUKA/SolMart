"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { fetchProductsFromSupabase, Product } from "@/lib/utils"
import { SearchFilter } from "@/components/search-filter"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get("category")
  const queryParam = searchParams.get("q")
  const sortParam = searchParams.get("sort")
  const minParam = searchParams.get("min")
  const maxParam = searchParams.get("max")

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from Supabase on mount
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProductsFromSupabase()
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to load products.")
        setLoading(false)
      })
  }, [])

  // Compute min/max price and categories from fetched products
  const minPrice = products.length > 0 ? Math.min(...products.map((product) => product.price)) : 0
  const maxPrice = products.length > 0 ? Math.max(...products.map((product) => product.price)) : 0
  const categories = [
    "all",
    ...Array.from(new Set(products.map((product) => product.category))),
  ]

  // Filtering and sorting logic
  useEffect(() => {
    let result = products

    if (categoryParam && categoryParam !== "all") {
      result = result.filter((product) => product.category === categoryParam)
    }

    if (queryParam) {
      const query = queryParam.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query),
      )
    }

    if (minParam) {
      const min = Number.parseFloat(minParam)
      result = result.filter((product) => product.price >= min)
    }

    if (maxParam) {
      const max = Number.parseFloat(maxParam)
      result = result.filter((product) => product.price <= max)
    }

    if (sortParam) {
      switch (sortParam) {
        case "price-low-high":
          result = [...result].sort((a, b) => a.price - b.price)
          break
        case "price-high-low":
          result = [...result].sort((a, b) => b.price - a.price)
          break
        case "newest":
          // Assuming products are sorted by created_at descending from Supabase, reverse for newest
          result = [...result].reverse()
          break
        default:
          break
      }
    }

    setFilteredProducts(result)
  }, [products, categoryParam, queryParam, sortParam, minParam, maxParam])

  const handleSearch = useCallback((query: string) => {
    updateUrl({ q: query || null })
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    updateUrl({ category: category === "all" ? null : category })
  }, [])

  const handleFilterChange = useCallback(
    (filters: { priceRange?: [number, number]; categories?: string[]; sortBy?: string }) => {
      const { priceRange, categories, sortBy } = filters

      const params: Record<string, string | null> = {}

     
      if (priceRange) {
        params.min = priceRange[0] !== minPrice ? priceRange[0].toString() : null
        params.max = priceRange[1] !== maxPrice ? priceRange[1].toString() : null
      }

    
      if (categories && categories.length === 1) {
        params.category = categories[0]
      }

    
      if (sortBy && sortBy !== "relevance") {
        params.sort = sortBy
      } else {
        params.sort = null
      }

      updateUrl(params)
    },
    [minPrice, maxPrice],
  )

 
  const updateUrl = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

  
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ""}`
    router.push(newUrl)
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="mb-8">
        <SearchFilter
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
          onFilterChange={handleFilterChange}
          categories={categories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          initialQuery={queryParam || ""}
          initialCategory={categoryParam || ""}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Loading products...</h3>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-500">{error}</h3>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}
