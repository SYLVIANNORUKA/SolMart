import { supabase } from './supabase'
import { Order, CreateOrderData } from './types'

export class OrderService {
  // Create a new order
  static async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_wallet: orderData.user_wallet,
          user_email: orderData.user_email,
          items: orderData.items,
          total_amount: orderData.total_amount,
          status: 'pending',
          transaction_signature: orderData.transaction_signature,
          shipping_address: orderData.shipping_address,
          notes: orderData.notes,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating order:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating order:', error)
      return null
    }
  }

  // Get orders for a specific user wallet
  static async getUserOrders(userWallet: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_wallet', userWallet)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user orders:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user orders:', error)
      return []
    }
  }

  // Get all orders (for admin)
  static async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching all orders:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching all orders:', error)
      return []
    }
  }

  // Get a specific order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  // Update order with tracking information
  static async updateOrderTracking(
    orderId: string, 
    trackingNumber: string, 
    estimatedDelivery: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order tracking:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating order tracking:', error)
      return false
    }
  }

  // Search orders (for admin)
  static async searchOrders(query: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.%${query}%,user_wallet.ilike.%${query}%,user_email.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching orders:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching orders:', error)
      return []
    }
  }

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders by status:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching orders by status:', error)
      return []
    }
  }
} 