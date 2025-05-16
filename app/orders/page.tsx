"use client"

import type React from "react"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuthStore } from "@/lib/auth-store"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { OrderStatus } from "@/components/order-status"
import { formatSolPrice } from "@/lib/utils"
import { Search, ShoppingBag } from "lucide-react"


const orders = [
  {
    id: "ORD-001",
    date: "2023-05-15",
    total: 0.05,
    status: "delivered" as const,
    items: [
      { id: "1", name: "Organic Apples", quantity: 2, price: 0.005 },
      { id: "4", name: "Organic Milk", quantity: 1, price: 0.003 },
    ],
    trackingNumber: "TRK123456789",
    estimatedDelivery: "May 18, 2023",
  },
  {
    id: "ORD-002",
    date: "2023-05-20",
    total: 0.08,
    status: "shipped" as const,
    items: [
      { id: "2", name: "Wireless Earbuds", quantity: 1, price: 0.05 },
      { id: "7", name: "Fresh Bread", quantity: 2, price: 0.002 },
    ],
    trackingNumber: "TRK987654321",
    estimatedDelivery: "May 25, 2023",
  },
  {
    id: "ORD-003",
    date: "2023-05-22",
    total: 0.03,
    status: "processing" as const,
    items: [
      { id: "3", name: "Cotton T-Shirt", quantity: 1, price: 0.02 },
      { id: "7", name: "Fresh Bread", quantity: 1, price: 0.002 },
    ],
    estimatedDelivery: "May 28, 2023",
  },
  {
    id: "ORD-004",
    date: "2023-05-25",
    total: 0.12,
    status: "pending" as const,
    items: [
      { id: "5", name: "Smart Watch", quantity: 1, price: 0.08 },
      { id: "9", name: "Denim Jeans", quantity: 1, price: 0.03 },
    ],
    estimatedDelivery: "May 30, 2023",
  },
  {
    id: "ORD-005",
    date: "2023-05-10",
    total: 0.07,
    status: "cancelled" as const,
    items: [
      { id: "6", name: "Running Shoes", quantity: 1, price: 0.04 },
      { id: "7", name: "Fresh Bread", quantity: 2, price: 0.002 },
    ],
  },
]

export default function OrdersPage() {
  const { connected } = useWallet()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredOrders, setFilteredOrders] = useState(orders)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) || order.items.some((item) => item.name.toLowerCase().includes(query)),
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
                    <CardDescription>Placed on {order.date}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatSolPrice(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Order Status</h3>
                  <OrderStatus
                    status={order.status}
                    estimatedDelivery={order.estimatedDelivery}
                    trackingNumber={order.trackingNumber}
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <div>
                          <p>{item.name}</p>
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
