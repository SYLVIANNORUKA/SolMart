import { supabase } from './supabase'
import { Vendor, CreateVendorData } from './types'

export class VendorService {
  // Create a new vendor
  static async createVendor(vendorData: CreateVendorData): Promise<Vendor | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          wallet_address: vendorData.wallet_address,
          business_name: vendorData.business_name,
          business_description: vendorData.description,
          email: vendorData.email,
          phone: vendorData.phone,
          website: vendorData.website,
          logo: vendorData.logo,
          banner: vendorData.banner,
          business_address: vendorData.address,
          vendor_status: 'pending',
          role: 'buyer', // Will be updated to 'vendor' when approved
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating vendor:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating vendor:', error)
      return null
    }
  }

  // Get vendor by wallet address
  static async getVendorByWallet(walletAddress: string): Promise<Vendor | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        console.error('Error fetching vendor:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching vendor:', error)
      return null
    }
  }

  // Get vendor by ID
  static async getVendorById(vendorId: string): Promise<Vendor | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', vendorId)
        .single()

      if (error) {
        console.error('Error fetching vendor:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching vendor:', error)
      return null
    }
  }

  // Get all vendors (for admin)
  static async getAllVendors(): Promise<Vendor[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('vendor_status', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vendors:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching vendors:', error)
      return []
    }
  }

  // Get approved vendors only
  static async getApprovedVendors(): Promise<Vendor[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('vendor_status', 'approved')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching approved vendors:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching approved vendors:', error)
      return []
    }
  }

  // Update vendor status (for admin)
  static async updateVendorStatus(vendorId: string, status: Vendor['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          vendor_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) {
        console.error('Error updating vendor status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating vendor status:', error)
      return false
    }
  }

  // Update vendor profile
  static async updateVendor(vendorId: string, updateData: Partial<CreateVendorData>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId)

      if (error) {
        console.error('Error updating vendor:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating vendor:', error)
      return false
    }
  }

  // Check if wallet is already a vendor
  static async isVendor(walletAddress: string): Promise<boolean> {
    try {
      const vendor = await this.getVendorByWallet(walletAddress)
      return vendor !== null
    } catch (error) {
      console.error('Error checking vendor status:', error)
      return false
    }
  }

  // Get vendors by status
  static async getVendorsByStatus(status: Vendor['status']): Promise<Vendor[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('vendor_status', status)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vendors by status:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching vendors by status:', error)
      return []
    }
  }
} 