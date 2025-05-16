"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  onFilterChange: (filters: {
    priceRange?: [number, number]
    categories?: string[]
    sortBy?: string
  }) => void
  categories: string[]
  minPrice: number
  maxPrice: number
  initialQuery?: string
  initialCategory?: string
}

export function SearchFilter({
  onSearch,
  onCategoryChange,
  onFilterChange,
  categories,
  minPrice,
  maxPrice,
  initialQuery = "",
  initialCategory = "",
}: SearchFilterProps) {
 
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : [])
  const [sortBy, setSortBy] = useState("relevance")

  
  useEffect(() => {
    setSearchQuery(initialQuery)
    if (initialCategory) {
      setSelectedCategories([initialCategory])
    }
  }, [initialQuery, initialCategory])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onSearch(searchQuery)
  }

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked ? [...selectedCategories, category] : selectedCategories.filter((c) => c !== category)

    setSelectedCategories(newCategories)
  }

  const applyFilters = () => {
    onFilterChange({
      priceRange,
      categories: selectedCategories,
      sortBy,
    })
  }

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice])
    setSelectedCategories([])
    setSortBy("relevance")
    onFilterChange({
      priceRange: [minPrice, maxPrice],
      categories: [],
      sortBy: "relevance",
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative flex w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8 pr-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-9 w-9"
          onClick={() => {
            setSearchQuery("")
            onSearch("")
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear</span>
        </Button>
      </form>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your product search</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Price Range</h3>
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={0.001}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm">{priceRange[0].toFixed(3)} SOL</p>
                  <p className="text-sm">{priceRange[1].toFixed(3)} SOL</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Sort By</h3>
                <RadioGroup value={sortBy} onValueChange={setSortBy}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relevance" id="relevance" />
                    <Label htmlFor="relevance">Relevance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-low-high" id="price-low-high" />
                    <Label htmlFor="price-low-high">Price: Low to High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-high-low" id="price-high-low" />
                    <Label htmlFor="price-high-low">Price: High to Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="newest" id="newest" />
                    <Label htmlFor="newest">Newest</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
