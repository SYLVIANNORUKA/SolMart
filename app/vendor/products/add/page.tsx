"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { VendorService } from "@/lib/vendor-service"
import { ProductService } from "@/lib/product-service"
import { CreateProductData } from "@/lib/types"
import { ArrowLeft, Plus, Upload, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AddProductPage() {
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [vendor, setVendor] = useState<any>(null)
  const [productData, setProductData] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    seller_id: "",
    image: "",
    stock_quantity: 1,
    is_active: true,
  })

  const categories = [
    "groceries",
    "electronics", 
    "fashion",
    "home",
    "sports",
    "books",
    "toys",
    "health",
    "beauty",
    "automotive",
    "other"
  ]

  useEffect(() => {
    if (connected && publicKey) {
      checkVendorStatus()
    }
  }, [connected, publicKey])

  const checkVendorStatus = async () => {
    try {
      const vendorData = await VendorService.getVendorByWallet(publicKey!.toString())
      if (vendorData && vendorData.vendor_status === 'approved') {
        setVendor(vendorData)
        setProductData(prev => ({
          ...prev,
          seller_id: vendorData.id
        }))
      } else if (vendorData && vendorData.vendor_status === 'pending') {
        toast({
          title: "Vendor application pending",
          description: "Your vendor application is still under review. You'll be able to add products once approved.",
          variant: "destructive",
        })
        router.push('/vendor/dashboard')
      } else {
        toast({
          title: "Vendor registration required",
          description: "Please register as a vendor first.",
          variant: "destructive",
        })
        router.push('/vendor/register')
      }
    } catch (error) {
      console.error("Error checking vendor status:", error)
      toast({
        title: "Error",
        description: "Failed to verify vendor status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: keyof CreateProductData, value: string | number | boolean) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!vendor) {
      toast({
        title: "Vendor verification required",
        description: "Please ensure you are an approved vendor.",
        variant: "destructive",
      })
      return
    }

    // Validation
    if (!productData.name.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name.",
        variant: "destructive",
      })
      return
    }

    if (!productData.description.trim()) {
      toast({
        title: "Product description required",
        description: "Please enter a product description.",
        variant: "destructive",
      })
      return
    }

    if (productData.price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (!productData.category) {
      toast({
        title: "Category required",
        description: "Please select a product category.",
        variant: "destructive",
      })
      return
    }

    if (productData.stock_quantity! < 0) {
      toast({
        title: "Invalid stock quantity",
        description: "Stock quantity must be 0 or greater.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const newProduct = await ProductService.createProduct(productData)
      
      if (newProduct) {
        setSuccess(true)
        toast({
          title: "🎉 Product Added Successfully!",
          description: `${productData.name} has been added to your inventory and is now live on the marketplace.`,
        })
        
        // Reset form
        setProductData({
          name: "",
          description: "",
          price: 0,
          category: "",
          seller_id: vendor.id,
          image: "",
          stock_quantity: 1,
          is_active: true,
        })
        
        // Show success message before redirecting
        setTimeout(() => {
          router.push('/vendor/products')
        }, 3000) // Wait 3 seconds to show the success message
      } else {
        toast({
          title: "Failed to add product",
          description: "There was an error adding your product. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "An error occurred while adding the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!connected) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6">Add Product</h1>
          <p className="text-muted-foreground mb-8">Please connect your wallet to add products.</p>
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md w-full !justify-center h-11" />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Product Added Successfully!</h1>
          <p className="text-muted-foreground mb-8">
            Your product has been added to your inventory and is now live on the marketplace.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/vendor/products">
                View All Products
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setSuccess(false)} className="w-full">
              Add Another Product
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6">Verifying Vendor Status</h1>
          <p className="text-muted-foreground mb-8">Please wait while we verify your vendor status...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/vendor/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">Add a new product to your inventory</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Fill in the details below to add a new product to your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Product Description *</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                  required
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USDC) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    min="0"
                    value={productData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={productData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock Quantity and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={productData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Product Status</Label>
                  <Select
                    value={productData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => handleInputChange('is_active', value === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={productData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground">
                  Enter a URL for your product image. Leave empty to use a placeholder.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/vendor/products')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Vendor Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Business Name:</strong> {vendor.business_name || 'Not set'}</p>
                <p><strong>Wallet Address:</strong> {vendor.wallet_address}</p>
              </div>
              <div>
                <p><strong>Status:</strong> <span className="text-green-600 font-medium">Approved</span></p>
                <p><strong>Vendor ID:</strong> {vendor.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 