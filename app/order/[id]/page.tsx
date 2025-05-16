"use client"

import { useParams } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuthStore } from "@/lib/auth-store"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatus } from "@/components/order-status"
import { formatSolPrice } from "@/lib/utils"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"


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
    transactionSignature: "5Ua4hPyS2VYsgEHVQxM756c8wLJYCjXvtXpPEpjVcLbXjPZ7JkSiUKMygUxmMpfjNVJw",
    shippingAddress: "123 Main St, Anytown, USA",
    paymentMethod: "Solana Pay",
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
    transactionSignature: "3xR7JkSiUKMygUxmMpfjNVJw5Ua4hPyS2VYsgEHVQxM756c8wLJYCjXvtXpPEpjVcLbXjPZ",
    shippingAddress: "456 Oak Ave, Somewhere, USA",
    paymentMethod: "Solana Pay",
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
    transactionSignature: "8wLJYCjXvtXpPEpjVcLbXjPZ7JkSiUKMygUxmMpfjNVJw5Ua4hPyS2VYsgEHVQxM756c",
    shippingAddress: "789 Pine Ln, Elsewhere, USA",
    paymentMethod: "Solana Pay",
  },
]

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const order = orders.find((o) => o.id === orderId)

  const { connected } = useWallet()
  const { isAuthenticated } = useAuthStore()

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-8">Please connect your Phantom wallet to view your order details.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Order Details</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
            <CardDescription>Please sign in or create an account to view your order details.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-muted-foreground">Placed on {order.date}</p>
        </div>
        <OrderStatus
          status={order.status}
          estimatedDelivery={order.estimatedDelivery}
          trackingNumber={order.trackingNumber}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatSolPrice(item.price * item.quantity)}</p>
                        <p className="text-sm text-muted-foreground">{formatSolPrice(item.price)} each</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Shipping Address</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>

              {order.trackingNumber && (
                <div className="mt-4">
                  <p className="font-medium">Tracking Number</p>
                  <p className="text-muted-foreground">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatSolPrice(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~0.000005 SOL</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatSolPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-muted-foreground">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="font-medium">Transaction</p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground truncate">
                      {order.transactionSignature.slice(0, 8)}...{order.transactionSignature.slice(-8)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <a
                        href={`https://explorer.solana.com/tx/${order.transactionSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View on Solana Explorer</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions or issues with your order, please contact our support team.
              </p>
              <Button className="w-full" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
