"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAuthStore } from "@/lib/auth-store"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TransactionHistory } from "@/components/transaction-history"
import { OrderStatus } from "@/components/order-status"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, User, ShoppingBag, Wallet, Clock } from "lucide-react"


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
]

export default function ProfilePage() {
  const { connected } = useWallet()
  const { isAuthenticated, user, logout } = useAuthStore()
  const { toast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSaveProfile = () => {
  
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
    setIsEditing(false)
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Connect Your Wallet</h1>
        <p className="text-muted-foreground mb-8">Please connect your Phantom wallet to access your profile.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Sign in to continue</CardTitle>
            <CardDescription>Please sign in or create an account to access your profile.</CardDescription>
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
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {user?.isSeller && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mt-2">
                      Seller
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => logout()}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          <TransactionHistory />
        </div>

      
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)} className="h-8 w-8">
                    {isEditing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      value={connected ? `${connected.toString().slice(0, 6)}...${connected.toString().slice(-4)}` : ""}
                      disabled
                    />
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter>
                    <Button onClick={handleSaveProfile} className="ml-auto">
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled
                    >
                      <option value="sol">SOL</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4 pt-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Order #{order.id}</CardTitle>
                          <CardDescription>Placed on {order.date}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.total.toFixed(3)} SOL</p>
                          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <OrderStatus
                        status={order.status}
                        estimatedDelivery={order.estimatedDelivery}
                        trackingNumber={order.trackingNumber}
                      />

                      <div className="space-y-2">
                        <h3 className="font-medium">Items</h3>
                        <ul className="space-y-1">
                          {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>{item.price.toFixed(3)} SOL</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Order Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Orders Yet</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Button className="mt-6" asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                  <CardDescription>Manage your connected wallet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Connected Wallet</p>
                      <p className="text-sm text-muted-foreground">Phantom Wallet</p>
                    </div>
                    <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md" />
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Your wallet is connected to the Solana Devnet. All transactions are simulated and do not use real
                      SOL.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <TransactionHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
