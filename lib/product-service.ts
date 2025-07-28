import { supabase } from './supabase'
import { Product, CreateProductData } from './types'

export class ProductService {
  // Create a new product
  static async createProduct(productData: CreateProductData): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          seller_id: productData.seller_id,
          image: productData.image,
          stock_quantity: productData.stock_quantity || 0,
          is_active: productData.is_active !== false, // Default to true
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  // Get all products (for customers) - only approved vendors and active products
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!inner(
            id,
            business_name,
            vendor_status
          )
        `)
        .eq('users.vendor_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Get ALL products regardless of vendor status or active status
  static async getAllProductsUnfiltered(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users(
            id,
            business_name,
            vendor_status
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all products:', error)
      return []
    }
  }

  // Get products by vendor
  static async getProductsByVendor(vendorId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', vendorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vendor products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching vendor products:', error)
      return []
    }
  }

  // Get product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users(
            id,
            business_name,
            business_description,
            logo
          )
        `)
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Update product
  static async updateProduct(productId: string, updateData: Partial<CreateProductData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!inner(
            id,
            business_name,
            vendor_status
          )
        `)
        .eq('users.vendor_status', 'approved')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching products:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!inner(
            id,
            business_name,
            vendor_status
          )
        `)
        .eq('users.vendor_status', 'approved')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  // Get categories
  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      const categories = [...new Set(data?.map(item => item.category) || [])]
      return categories.sort()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Update product stock
  static async updateProductStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product stock:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating product stock:', error)
      return false
    }
  }

  // Toggle product active status
  static async toggleProductStatus(productId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Error toggling product status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error toggling product status:', error)
      return false
    }
  }
} 