import { Product, CreateProductData } from './types'

// TODO: connect these methods to the backend once it is built.
// Until then they return empty results so the UI keeps working.
export class ProductService {
  // Create a new product
  static async createProduct(productData: CreateProductData): Promise<Product | null> {
    return null
  }

  // Get all active products from approved vendors
  static async getAllProducts(): Promise<Product[]> {
    return []
  }

  // Get all products without filtering
  static async getAllProductsUnfiltered(): Promise<Product[]> {
    return []
  }

  // Get products for a specific vendor
  static async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return []
  }

  // Get a single product by ID
  static async getProductById(productId: string): Promise<Product | null> {
    return null
  }

  // Update a product
  static async updateProduct(productId: string, updateData: Partial<CreateProductData>): Promise<boolean> {
    return false
  }

  // Delete a product
  static async deleteProduct(productId: string): Promise<boolean> {
    return false
  }

  // Search products by name or description
  static async searchProducts(query: string): Promise<Product[]> {
    return []
  }

  // Get products by category
  static async getProductsByCategory(category: string): Promise<Product[]> {
    return []
  }

  // Get all product categories
  static async getCategories(): Promise<string[]> {
    return []
  }

  // Update product stock
  static async updateProductStock(productId: string, quantity: number): Promise<boolean> {
    return false
  }

  // Activate or deactivate a product
  static async toggleProductStatus(productId: string, isActive: boolean): Promise<boolean> {
    return false
  }
}
