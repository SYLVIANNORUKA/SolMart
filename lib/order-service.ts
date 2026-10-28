import { Order, CreateOrderData } from './types'

// TODO: connect these methods to the backend once it is built.
// Until then they return empty results so the UI keeps working.
export class OrderService {
  // Create a new order
  static async createOrder(orderData: CreateOrderData): Promise<Order | null> {
    return null
  }

  // Get orders for a specific user wallet
  static async getUserOrders(userWallet: string): Promise<Order[]> {
    return []
  }

  // Get all orders (admin)
  static async getAllOrders(): Promise<Order[]> {
    return []
  }

  // Get a single order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    return null
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    return false
  }

  // Update order with tracking information
  static async updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    estimatedDelivery: string
  ): Promise<boolean> {
    return false
  }

  // Search orders by ID, wallet, or email
  static async searchOrders(query: string): Promise<Order[]> {
    return []
  }

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return []
  }
}
