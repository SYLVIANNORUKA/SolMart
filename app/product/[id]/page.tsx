"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { formatSolPrice, getProductById } from "@/lib/utils"
import { useCartStore } from "@/lib/cart-store"
import { useSolanaPay } from "@/lib/solana-pay"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Star, Wallet } from "lucide-react"
import { ProductReview, type Review } from "@/components/product-review"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const product = getProductById(productId)

  const { connected } = useWallet()
  const { addItem } = useCartStore()
  const { makePayment } = useSolanaPay()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])

  
  useEffect(() => {
   
    const mockReviews: Review[] = [
      {
        id: "1",
        userId: "user1",
        userName: "John Doe",
        rating: 5,
        comment: "Great product! Exactly as described and arrived quickly.",
        date: "2023-04-15T10:30:00Z",
      },
      {
        id: "2",
        userId: "user2",
        userName: "Jane Smith",
        rating: 4,
        comment: "Good quality and value for money. Would recommend.",
        date: "2023-04-10T14:20:00Z",
      },
      {
        id: "3",
        userId: "user3",
        userName: "Bob Johnson",
        rating: 3,
        comment: "Decent product but took longer than expected to arrive.",
        date: "2023-04-05T09:15:00Z",
      },
    ]

    setReviews(mockReviews)
  }, [productId])

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/products">Back to Products</a>
        </Button>
      </div>
    )
  }

  const totalPrice = product.price * quantity

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart.`,
    })
  }

  const handleBuyNow = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
   
      const memo = `Purchase: ${product.name} x${quantity}`

      // Process the payment
      const success = await makePayment(totalPrice, memo)

      if (success) {
        toast({
          title: "Purchase successful!",
          description: `You have successfully purchased ${product.name}.`,
        })
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReview = (review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
    }

    setReviews([newReview, ...reviews])
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.seller.rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-muted text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.seller.rating.toFixed(1)}</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-2">{formatSolPrice(product.price)}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Seller</h2>
            <p className="font-medium">{product.seller.name}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number.parseInt(value))}>
                <SelectTrigger id="quantity" className="w-24">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Total Price</p>
              <p className="text-2xl font-bold text-primary">{formatSolPrice(totalPrice)}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleAddToCart} className="flex-1" variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>

              {connected ? (
                <Button onClick={handleBuyNow} className="flex-1" disabled={isLoading}>
                  <Wallet className="mr-2 h-4 w-4" />
                  {isLoading ? "Processing..." : "Buy with SOL"}
                </Button>
              ) : (
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md flex-1 h-10 !justify-center" />
              )}
            </div>
          </div>
        </div>
      </div>

  
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium">Category</dt>
                <dd className="text-sm text-muted-foreground capitalize">{product.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Price</dt>
                <dd className="text-sm text-muted-foreground">{formatSolPrice(product.price)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium">Seller</dt>
                <dd className="text-sm text-muted-foreground">{product.seller.name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solana Payment</CardTitle>
            <CardDescription>Pay securely using Solana blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              SolMart uses Solana Pay for secure and fast transactions. Connect your Phantom wallet to make a purchase.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Benefits:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Fast transactions (under 1 second)</li>
                <li>Low fees (less than $0.01)</li>
                <li>Secure and transparent</li>
                <li>No intermediaries</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            {!connected && (
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md w-full !justify-center" />
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <ProductReview productId={productId} reviews={reviews} onAddReview={handleAddReview} />
      </div>
    </div>
  )
}
