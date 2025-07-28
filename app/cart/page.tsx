"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Trash2, Wallet, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { formatSolPrice } from "@/lib/utils"
import { useSolanaPay } from "@/lib/solana-pay"
import { useToast } from "@/components/ui/use-toast"
import { OrderService } from "@/lib/order-service"
import { CreateOrderData } from "@/lib/types"

export default function CartPage() {
  const { connected, publicKey } = useWallet()
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()
  const { makePayment } = useSolanaPay()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const totalPrice = getTotalPrice()

  const handleCheckout = async () => {
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to complete your purchase.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a memo for the transaction
      const itemsList = items.map((item) => `${item.product.name} x${item.quantity}`).join(", ")
      const memo = `SolMart Purchase: ${itemsList}`

      // Process the payment
      const success = await makePayment(totalPrice, memo)

      if (success) {
        // Create order data
        const orderData: CreateOrderData = {
          user_wallet: publicKey?.toString() || "",
          items: items.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image,
            vendor_id: item.product.seller_id,
            vendor_name: item.product.vendor_name,
          })),
          total_amount: totalPrice,
          transaction_signature: "", // Will be updated if we can get the signature
        }

        // Store order in Supabase
        const order = await OrderService.createOrder(orderData)

        if (order) {
          clearCart()
          toast({
            title: "Purchase successful!",
            description: `Order #${order.id} has been created. Your items will be delivered soon.`,
          })
        } else {
          toast({
            title: "Order creation failed",
            description: "Payment was successful but there was an error creating your order. Please contact support.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {items.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 border rounded-lg p-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`} className="font-medium hover:underline line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatSolPrice(item.product.price)} each</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, Number.parseInt(e.target.value) || 1)}
                        className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
                <div className="flex items-start">
                  <p className="font-medium">{formatSolPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

         
          <div>
            <div className="border rounded-lg p-6 space-y-4 sticky top-20">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatSolPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~0.000005 SOL</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatSolPrice(totalPrice)}</span>
              </div>

              {connected ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading || items.length === 0}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isLoading ? "Processing..." : "Checkout with SOL"}
                </Button>
              ) : (
                <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md w-full !justify-center h-11" />
              )}

              <p className="text-xs text-muted-foreground text-center">Powered by Solana Pay on Devnet</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
