"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { VendorService } from "@/lib/vendor-service"
import { Vendor } from "@/lib/types"
import { Search, Filter, Users, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function VendorManagementPage() {
  const { connected } = useWallet()
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  })

  useEffect(() => {
    if (connected) {
      loadVendors()
    }
  }, [connected])

  useEffect(() => {
    filterVendors()
  }, [vendors, searchQuery, statusFilter])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const allVendors = await VendorService.getAllVendors()
      setVendors(allVendors)
      calculateStats(allVendors)
    } catch (error) {
      console.error("Error loading vendors:", error)
      toast({
        title: "Error loading vendors",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (vendorsList: Vendor[]) => {
    const stats = {
      total: vendorsList.length,
      pending: vendorsList.filter(v => v.vendor_status === 'pending').length,
      approved: vendorsList.filter(v => v.vendor_status === 'approved').length,
      rejected: vendorsList.filter(v => v.vendor_status === 'rejected').length,
      suspended: vendorsList.filter(v => v.vendor_status === 'suspended').length,
    }
    setStats(stats)
  }

  const filterVendors = () => {
    let filtered = vendors

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(vendor => vendor.vendor_status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(vendor =>
        vendor.wallet_address.toLowerCase().includes(query) ||
        (vendor.business_name && vendor.business_name.toLowerCase().includes(query)) ||
        (vendor.email && vendor.email.toLowerCase().includes(query)) ||
        (vendor.phone && vendor.phone.toLowerCase().includes(query))
      )
    }

    setFilteredVendors(filtered)
  }

  const updateVendorStatus = async (vendorId: string, newStatus: Vendor['vendor_status']) => {
    setUpdatingStatus(true)
    try {
      const success = await VendorService.updateVendorStatus(vendorId, newStatus)
      if (success) {
        toast({
          title: "Status updated",
          description: `Vendor status updated to ${newStatus}`,
        })
        loadVendors() // Reload vendors
        setSelectedVendor(null)
        setRejectionReason("")
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update vendor status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating vendor status:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating vendor status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: Vendor['vendor_status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'suspended':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!connected) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6">Admin Access</h1>
          <p className="text-muted-foreground mb-8">Please connect your wallet to access the vendor management panel.</p>
          <WalletMultiButton className="!bg-primary hover:!bg-primary/90 rounded-md w-full !justify-center h-11" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <Button onClick={loadVendors} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading vendors...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No vendors found</h3>
          <p className="text-muted-foreground">No vendors match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {vendor.business_name || 'Unnamed Business'}
                      </h3>
                      {getStatusBadge(vendor.vendor_status!)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Wallet:</strong> {vendor.wallet_address}</p>
                        <p><strong>Email:</strong> {vendor.email || 'Not provided'}</p>
                        <p><strong>Phone:</strong> {vendor.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p><strong>Website:</strong> {vendor.website || 'Not provided'}</p>
                        <p><strong>Created:</strong> {formatDate(vendor.created_at)}</p>
                        <p><strong>Role:</strong> {vendor.role}</p>
                      </div>
                    </div>
                    {vendor.business_description && (
                      <p className="mt-2 text-sm">{vendor.business_description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {vendor.vendor_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateVendorStatus(vendor.id, 'approved')}
                          disabled={updatingStatus}
                        >
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Vendor Application</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting this vendor application.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejection-reason">Reason for rejection</Label>
                                <Textarea
                                  id="rejection-reason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter reason for rejection..."
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setRejectionReason("")}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    updateVendorStatus(vendor.id, 'rejected')
                                    setRejectionReason("")
                                  }}
                                  disabled={updatingStatus || !rejectionReason.trim()}
                                >
                                  Reject Application
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    {vendor.vendor_status === 'approved' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                        disabled={updatingStatus}
                      >
                        Suspend
                      </Button>
                    )}
                    {vendor.vendor_status === 'suspended' && (
                      <Button
                        size="sm"
                        onClick={() => updateVendorStatus(vendor.id, 'approved')}
                        disabled={updatingStatus}
                      >
                        Reactivate
                      </Button>
                    )}
                    {vendor.vendor_status === 'rejected' && (
                      <Button
                        size="sm"
                        onClick={() => updateVendorStatus(vendor.id, 'approved')}
                        disabled={updatingStatus}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 