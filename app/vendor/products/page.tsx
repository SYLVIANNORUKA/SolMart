"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { VendorService } from "@/lib/vendor-service"
import { ProductService } from "@/lib/product-service"
import { Vendor, Product, CreateProductData } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Store, Package, Plus, Edit, Trash2, Search, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VendorProductsPage() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [productForm, setProductForm] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    seller_id: "",
    image: "",
    stock_quantity: 0,
    is_active: true,
  })

  useEffect(() => {
    if (connected && publicKey) {
      loadVendorData()
    }
  }, [connected, publicKey])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  const loadVendorData = async () => {
    if (!publicKey) return

    setLoading(true)
    try {
      const vendorData = await VendorService.getVendorByWallet(publicKey.toString())
      setVendor(vendorData)

      if (vendorData && vendorData.vendor_status === 'approved') {
        const vendorProducts = await ProductService.getProductsByVendor(vendorData.id)
        setProducts(vendorProducts)
      }
    } catch (error) {
      console.error("Error loading vendor data:", error)
      toast({
        title: "Error loading products",
        description: "Failed to load your products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )

    setFilteredProducts(filtered)
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      seller_id: vendor?.id || "",
      image: "",
      stock_quantity: 0,
      is_active: true,
    })
    setEditingProduct(null)
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

    setLoading(true)

    try {
              if (editingProduct) {
          const success = await ProductService.updateProduct(editingProduct.id, productForm)
          if (success) {
            // Refresh the products list to get the updated data
            const vendorProducts = await ProductService.getProductsByVendor(vendor.id)
            setProducts(vendorProducts)
            toast({
              title: "Product updated successfully!",
              description: `${productForm.name} has been updated.`,
            })
          }
        } else {
          const newProduct = await ProductService.createProduct(productForm)
          if (newProduct) {
            setProducts(prev => [newProduct, ...prev])
            setShowSuccess(true)
            toast({
              title: "🎉 Product Added Successfully!",
              description: `${productForm.name} has been added to your inventory and is now live on the marketplace.`,
            })
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              setShowSuccess(false)
            }, 3000)
          }
        }
      
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const success = await ProductService.deleteProduct(productId)
      if (success) {
        setProducts(prev => prev.filter(p => p.id !== productId))
        toast({
          title: "Product deleted",
          description: "Product has been removed from your inventory.",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const success = await ProductService.toggleProductStatus(productId, !currentStatus)
      if (success) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, is_active: !currentStatus } : p
        ))
        toast({
          title: "Product status updated",
          description: `Product is now ${!currentStatus ? 'active' : 'inactive'}.`,
        })
      }
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      seller_id: product.seller_id || vendor?.id || "",
      image: product.image || "",
      stock_quantity: product.stock_quantity || 0,
      is_active: product.is_active || true,
    })
    setIsAddDialogOpen(true)
  }

  if (!connected) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <p className="text-muted-foreground mb-8">Please connect your wallet to manage your products.</p>
        <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md w-full !justify-center h-11" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
        <p className="text-muted-foreground mb-8">Please wait while we load your products.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Vendor Registration Required</h1>
        <p className="text-muted-foreground mb-8">Please register as a vendor to manage products.</p>
        <Button asChild>
          <Link href="/vendor/register">Register as Vendor</Link>
        </Button>
      </div>
    )
  }

  if (vendor.vendor_status !== 'approved') {
    return (
      <div className="container py-16 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">Account Not Approved</h1>
        <p className="text-muted-foreground mb-8">
          Your vendor account is not yet approved. You'll be able to manage products once approved.
        </p>
        <Badge variant="secondary" className="text-sm">
          Status: {vendor.vendor_status}
        </Badge>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Success Banner */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Product added successfully!</p>
            <p className="text-sm text-green-600">Your product is now live on the marketplace.</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/vendor/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Quick Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update your product information" : "Add a new product to your store"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={productForm.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      placeholder="e.g., Electronics, Clothing"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your product..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      value={productForm.stock_quantity}
                      onChange={(e) => handleInputChange("stock_quantity", parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={productForm.image}
                      onChange={(e) => handleInputChange("image", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={productForm.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Active (visible to customers)</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </div>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <span className="text-sm text-muted-foreground">
                    Stock: {product.stock_quantity || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{product.category}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(product.id, product.is_active || false)}
                    >
                      {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
          <h2 className="text-xl font-medium">No products found</h2>
          <p className="text-muted-foreground">
            {searchQuery ? "No products match your search criteria." : "You haven't added any products yet."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 