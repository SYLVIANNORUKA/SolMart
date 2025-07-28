"use client"

import Link from "next/link"
import Image from "next/image"
import { formatSolPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { ShoppingCart, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product, 1)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
    

    setIsAdded(true)
    setIsAdding(false)
    
 
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-1">
          <Link href={`/product/${product.id}`} className="font-medium hover:underline">
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            Seller: {product.vendor_name || product.seller?.name || 'Unknown'}
            {product.seller_id && !product.vendor_name && !product.seller?.name && ` (ID: ${product.seller_id})`}
          </p>
          <p className="font-medium text-primary">{formatSolPrice(product.price)}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart} 
          className={`w-full transition-all duration-200 ${isAdded ? 'bg-[#4B5320] hover:bg-[#3B4320]' : ''}`}
          variant={isAdded ? "default" : "outline"}
          disabled={isAdding}
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
