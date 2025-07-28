"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { ProductService } from "@/lib/product-service"
import type { Product } from "@/lib/types"
import { SearchFilter } from "@/components/search-filter"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

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
    const loadProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const productsData = await ProductService.getAllProductsUnfiltered()
        setProducts(productsData)
      } catch (err) {
        console.error("Error loading products:", err)
        setError("Failed to load products.")
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [toast])

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
          product.description.toLowerCase().includes(query) ||
          (product.vendor_name && product.vendor_name.toLowerCase().includes(query)),
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
          result = [...result].sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime()
            const dateB = new Date(b.created_at || 0).getTime()
            return dateB - dateA
          })
          break
        case "name-a-z":
          result = [...result].sort((a, b) => a.name.localeCompare(b.name))
          break
        case "name-z-a":
          result = [...result].sort((a, b) => b.name.localeCompare(a.name))
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground">
          Discover all products from vendors across the Solana network
        </p>
      </div>

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium">Loading products...</h3>
          <p className="text-muted-foreground mt-2">Fetching all products from the marketplace</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-500 mb-2">{error}</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {queryParam && (
              <p className="text-sm text-muted-foreground">
                Search results for "{queryParam}"
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {queryParam 
              ? `No products match your search for "${queryParam}".`
              : "Try adjusting your search or filter to find what you're looking for."
            }
          </p>
          {queryParam && (
            <button
              onClick={() => updateUrl({ q: null })}
              className="text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}
