"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuthStore } from "@/lib/auth-store"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OrderStatus } from "@/components/order-status"
import { formatSolPrice } from "@/lib/utils"
import { OrderService } from "@/lib/order-service"
import { Order } from "@/lib/types"
import { Search, ShoppingBag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"


export default function OrdersPage() {
  const { connected, publicKey } = useWallet()
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (connected && publicKey && isAuthenticated) {
      loadUserOrders()
    }
  }, [connected, publicKey, isAuthenticated])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery])

  const loadUserOrders = async () => {
    setLoading(true)
    try {
      const userOrders = await OrderService.getUserOrders(publicKey!.toString())
      setOrders(userOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error loading orders",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) || order.items.some((item) => item.product_name.toLowerCase().includes(query)),
    )

    setFilteredOrders(filtered)
  }

  const filterOrders = () => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) || order.items.some((item) => item.product_name.toLowerCase().includes(query)),
    )

    setFilteredOrders(filtered)
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-8">Please connect your Phantom wallet to view your orders.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Orders</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
            <CardDescription>Please sign in or create an account to view your orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative flex w-full max-w-sm mb-8">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search orders..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" className="ml-2">
          Search
        </Button>
      </form>

      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Order #{order.id}</CardTitle>
                    <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatSolPrice(order.total_amount)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Order Status</h3>
                  <OrderStatus
                    status={order.status}
                    estimatedDelivery={order.estimated_delivery}
                    trackingNumber={order.tracking_number}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <div>
                          <p>{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatSolPrice(item.price * item.quantity)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/order/${order.id}`}>View Order Details</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="flex justify-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">No orders found</h2>
          <p className="text-muted-foreground">
            {searchQuery ? "No orders match your search criteria." : "You haven't placed any orders yet."}
          </p>
          <Button asChild className="mt-4">
            <a href="/products">Continue Shopping</a>
          </Button>
        </div>
      )}
    </div>
  )
}
