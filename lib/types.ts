export interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  category: string
  seller_id?: string
  vendor_name?: string
  stock_quantity?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
  // Backward compatibility with old seller structure
  seller?: {
    id: string
    name: string
    rating: number
  }
}

export interface Vendor {
  id: string
  wallet_address: string
  business_name?: string
  business_description?: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  banner?: string
  business_address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  vendor_status?: 'pending' | 'approved' | 'rejected' | 'suspended'
  role?: string
  created_at: string
  updated_at?: string
}

export interface CreateVendorData {
  wallet_address: string
  business_name: string
  description: string
  email: string
  phone?: string
  website?: string
  logo?: string
  banner?: string
  address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  seller_id: string
  image?: string
  stock_quantity?: number
  is_active?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  image?: string
  vendor_id?: string
  vendor_name?: string
}

export interface Order {
  id: string
  user_wallet: string
  user_email?: string
  items: OrderItem[]
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  transaction_signature?: string
  tracking_number?: string
  estimated_delivery?: string
  shipping_address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateOrderData {
  user_wallet: string
  user_email?: string
  items: OrderItem[]
  total_amount: number
  transaction_signature?: string
  shipping_address?: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  notes?: string
} 