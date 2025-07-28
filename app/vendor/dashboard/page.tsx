"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VendorService } from "@/lib/vendor-service"
import { ProductService } from "@/lib/product-service"
import { OrderService } from "@/lib/order-service"
import { Vendor, Product, Order } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Store, Package, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function VendorDashboardPage() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })

  useEffect(() => {
    if (connected && publicKey) {
      loadVendorData()
    }
  }, [connected, publicKey])

  const loadVendorData = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      // Load vendor info
      const vendorData = await VendorService.getVendorByWallet(publicKey.toString())
      setVendor(vendorData)

      if (vendorData && (vendorData.vendor_status === 'approved' || vendorData.role === 'admin')) {
        // Load vendor products
        const vendorProducts = await ProductService.getProductsByVendor(vendorData.id)
        setProducts(vendorProducts)

        // Load vendor orders (orders containing vendor's products)
        const allOrders = await OrderService.getAllOrders()
        const vendorOrders = allOrders.filter(order => 
          order.items.some(item => item.vendor_id === vendorData.id)
        )
        setOrders(vendorOrders)

        // Calculate stats
        const activeProducts = vendorProducts.filter(p => p.is_active).length
        const pendingOrders = vendorOrders.filter(o => o.status === 'pending').length
        const totalRevenue = vendorOrders
          .filter(o => o.status === 'delivered')
          .reduce((sum, order) => {
            const vendorItems = order.items.filter(item => item.vendor_id === vendorData.id)
            return sum + vendorItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0)
          }, 0)

        setStats({
          totalProducts: vendorProducts.length,
          activeProducts,
          totalOrders: vendorOrders.length,
          totalRevenue,
          pendingOrders,
        })
      }
    } catch (error) {
      console.error("Error loading vendor data:", error)
      toast({
        title: "Error loading dashboard",
        description: "Failed to load your vendor data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>
        <p className="text-muted-foreground mb-8">Please connect your wallet to access your vendor dashboard.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading vendor dashboard...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Store className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Not a Vendor</h1>
        <p className="text-muted-foreground mb-8">
          You are not registered as a vendor. Register to start selling on SolMart.
        </p>
        <Button asChild>
          <Link href="/vendor/register">Register as Vendor</Link>
        </Button>
      </div>
    )
  }

  if (vendor.vendor_status === 'pending') {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Clock className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Application Pending</h1>
        <p className="text-muted-foreground mb-8">
          Your vendor application is currently under review. You'll receive an email notification once approved.
        </p>
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            Status: Pending Review
          </Badge>
          <p className="text-xs text-muted-foreground">
            Business: {vendor.business_name}
          </p>
        </div>
      </div>
    )
  }

  if (vendor.vendor_status === 'rejected') {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Application Rejected</h1>
        <p className="text-muted-foreground mb-8">
          Your vendor application has been rejected. Please contact support for more information.
        </p>
        <Button asChild>
          <Link href="/vendor/register">Reapply</Link>
        </Button>
      </div>
    )
  }

  if (vendor.vendor_status === 'suspended') {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Account Suspended</h1>
        <p className="text-muted-foreground mb-8">
          Your vendor account has been suspended. Please contact support for more information.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {vendor.business_name}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/vendor/products">Manage Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vendor/orders">View Orders</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Products</p>
                <p className="text-2xl font-bold">{stats.activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending Orders</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Products
            </CardTitle>
            <CardDescription>
              Your latest products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                    </div>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {products.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/vendor/products">View All Products</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products yet</p>
                <Button asChild className="mt-4">
                  <Link href="/vendor/products/add">Add Your First Product</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Orders containing your products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => {
                  const vendorItems = order.items.filter(item => item.vendor_id === vendor.id)
                  const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendorItems.length} items • ${vendorTotal.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'processing' ? 'default' :
                        order.status === 'shipped' ? 'default' :
                        order.status === 'delivered' ? 'default' : 'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  )
                })}
                {orders.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/vendor/orders">View All Orders</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start selling to see orders here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 