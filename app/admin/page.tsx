"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { OrderStatus } from "@/components/order-status"
import { formatSolPrice } from "@/lib/utils"
import { OrderService } from "@/lib/order-service"
import { Order } from "@/lib/types"
import { Search, Filter, Package, Users, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminPage() {
  const { connected } = useWallet()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  })

  useEffect(() => {
    if (connected) {
      loadOrders()
    }
  }, [connected])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const allOrders = await OrderService.getAllOrders()
      setOrders(allOrders)
      calculateStats(allOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error loading orders",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersList: Order[]) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      processing: ordersList.filter(o => o.status === 'processing').length,
      shipped: ordersList.filter(o => o.status === 'shipped').length,
      delivered: ordersList.filter(o => o.status === 'delivered').length,
      cancelled: ordersList.filter(o => o.status === 'cancelled').length,
    }
    setStats(stats)
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.user_wallet.toLowerCase().includes(query) ||
        (order.user_email && order.user_email.toLowerCase().includes(query)) ||
        order.items.some(item => item.product_name.toLowerCase().includes(query))
      )
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(true)
    try {
      const success = await OrderService.updateOrderStatus(orderId, newStatus)
      if (success) {
        await loadOrders() // Reload orders to get updated data
        toast({
          title: "Status updated",
          description: `Order status updated to ${newStatus}`,
        })
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Update failed",
        description: "An error occurred while updating the order status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updateOrderTracking = async (orderId: string, trackingNumber: string, estimatedDelivery: string) => {
    setUpdatingStatus(true)
    try {
      const success = await OrderService.updateOrderTracking(orderId, trackingNumber, estimatedDelivery)
      if (success) {
        await loadOrders() // Reload orders to get updated data
        toast({
          title: "Tracking updated",
          description: "Order tracking information has been updated.",
        })
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update tracking information. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating tracking:", error)
      toast({
        title: "Update failed",
        description: "An error occurred while updating tracking information.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Access</h1>
        <p className="text-muted-foreground mb-8">Please connect your wallet to access the admin panel.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage orders and track sales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/admin/vendors">Manage Vendors</a>
          </Button>
          <Button onClick={loadOrders} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Processing</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-indigo-500" />
              <div>
                <p className="text-sm font-medium">Shipped</p>
                <p className="text-2xl font-bold">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders by ID, wallet, email, or product..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.id}
                      <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                        {order.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString()} • {order.user_wallet.substring(0, 8)}...
                      {order.user_email && ` • ${order.user_email}`}
                    </CardDescription>
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
                  <ul className="space-y-2 mb-4">
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
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Order Status</DialogTitle>
                          <DialogDescription>
                            Update the status for order #{order.id}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Status</Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(order.status === 'shipped' || order.status === 'processing') && (
                            <div className="space-y-2">
                              <div>
                                <Label>Tracking Number</Label>
                                <Input
                                  placeholder="Enter tracking number"
                                  defaultValue={order.tracking_number || ""}
                                  onChange={(e) => {
                                    const updatedOrder = { ...order, tracking_number: e.target.value }
                                    setSelectedOrder(updatedOrder)
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Estimated Delivery</Label>
                                <Input
                                  type="date"
                                  defaultValue={order.estimated_delivery || ""}
                                  onChange={(e) => {
                                    const updatedOrder = { ...order, estimated_delivery: e.target.value }
                                    setSelectedOrder(updatedOrder)
                                  }}
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  if (selectedOrder) {
                                    updateOrderTracking(
                                      order.id,
                                      selectedOrder.tracking_number || "",
                                      selectedOrder.estimated_delivery || ""
                                    )
                                  }
                                }}
                                disabled={updatingStatus}
                              >
                                Update Tracking
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/order/${order.id}`}>View Details</a>
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
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">No orders found</h2>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "No orders match your search criteria." 
              : "No orders have been placed yet."}
          </p>
        </div>
      )}
    </div>
  )
} 