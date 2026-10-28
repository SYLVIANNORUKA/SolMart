import { Vendor, CreateVendorData } from './types'

// TODO: connect these methods to the backend once it is built.
// Until then they return empty results so the UI keeps working.
export class VendorService {
  // Create a new vendor application
  static async createVendor(vendorData: CreateVendorData): Promise<Vendor | null> {
    return null
  }

  // Get vendor by wallet address
  static async getVendorByWallet(walletAddress: string): Promise<Vendor | null> {
    return null
  }

  // Get vendor by ID
  static async getVendorById(vendorId: string): Promise<Vendor | null> {
    return null
  }

  // Get all vendors (admin)
  static async getAllVendors(): Promise<Vendor[]> {
    return []
  }

  // Get approved vendors
  static async getApprovedVendors(): Promise<Vendor[]> {
    return []
  }

  // Update vendor status (admin)
  static async updateVendorStatus(vendorId: string, status: Vendor['status']): Promise<boolean> {
    return false
  }

  // Update vendor details
  static async updateVendor(vendorId: string, updateData: Partial<CreateVendorData>): Promise<boolean> {
    return false
  }

  // Check if wallet is already a vendor
  static async isVendor(walletAddress: string): Promise<boolean> {
    const vendor = await this.getVendorByWallet(walletAddress)
    return vendor !== null
  }

  // Get vendors by status
  static async getVendorsByStatus(status: Vendor['status']): Promise<Vendor[]> {
    return []
  }
}
