"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VendorService } from "@/lib/vendor-service"
import { CreateVendorData } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Store, CheckCircle, AlertCircle } from "lucide-react"

export default function VendorRegistrationPage() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isVendor, setIsVendor] = useState<boolean | null>(null)
  const [vendorData, setVendorData] = useState<CreateVendorData>({
    wallet_address: "",
    business_name: "",
    description: "",
    email: "",
    phone: "",
    website: "",
    logo: "",
    banner: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    },
  })

  const checkVendorStatus = async () => {
    if (!publicKey) return

    try {
      const vendor = await VendorService.getVendorByWallet(publicKey.toString())
      setIsVendor(vendor !== null)
    } catch (error) {
      console.error("Error checking vendor status:", error)
    }
  }

  // Check vendor status when wallet connects
  useState(() => {
    if (connected && publicKey) {
      checkVendorStatus()
    }
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setVendorData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateVendorData] as any),
          [child]: value
        }
      }))
    } else {
      setVendorData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to register as a vendor.",
        variant: "destructive",
      })
      return
    }

    if (!vendorData.business_name || !vendorData.description || !vendorData.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const finalVendorData = {
        ...vendorData,
        wallet_address: publicKey.toString(),
      }

      const vendor = await VendorService.createVendor(finalVendorData)

      if (vendor) {
        setIsVendor(true)
        toast({
          title: "Registration successful!",
          description: "Your vendor application has been submitted for review. We'll notify you once approved.",
        })
      } else {
        toast({
          title: "Registration failed",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Store className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Become a Vendor</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to start your vendor registration process.
        </p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md mx-auto !justify-center" />
      </div>
    )
  }

  if (isVendor === true) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-6">Already a Vendor</h1>
        <p className="text-muted-foreground mb-8">
          You are already registered as a vendor on SolMart.
        </p>
        <div className="space-y-4">
          <Button asChild className="w-full">
            <a href="/vendor/dashboard">Go to Vendor Dashboard</a>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <a href="/vendor/products">Manage Products</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Store className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Become a Vendor</h1>
        <p className="text-muted-foreground">
          Join SolMart as a vendor and start selling your products to customers worldwide.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Registration</CardTitle>
          <CardDescription>
            Fill out the form below to register as a vendor. Your application will be reviewed and approved within 24-48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={vendorData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    placeholder="Your business name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={vendorData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your business, products, and what makes you unique..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={vendorData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={vendorData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Address</h3>
              
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={vendorData.address?.street}
                  onChange={(e) => handleInputChange("address.street", e.target.value)}
                  placeholder="123 Business St"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={vendorData.address?.city}
                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={vendorData.address?.state}
                    onChange={(e) => handleInputChange("address.state", e.target.value)}
                    placeholder="State"
                  />
                </div>
                
                <div>
                  <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                  <Input
                    id="zip_code"
                    value={vendorData.address?.zip_code}
                    onChange={(e) => handleInputChange("address.zip_code", e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={vendorData.address?.country}
                  onChange={(e) => handleInputChange("address.country", e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>

            {/* Wallet Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wallet Information</h3>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Connected Wallet</Badge>
                </div>
                <p className="text-sm font-mono break-all">
                  {publicKey?.toString()}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This wallet will be used for receiving payments and managing your vendor account.
                </p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Important Information:</p>
                  <ul className="space-y-1">
                    <li>• Your application will be reviewed within 24-48 hours</li>
                    <li>• You'll receive an email notification once approved</li>
                    <li>• Only approved vendors can list products</li>
                    <li>• You'll receive payments directly to your connected wallet</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 