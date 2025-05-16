"use client"

import { CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react"

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

interface OrderStatusProps {
  status: OrderStatus
  estimatedDelivery?: string
  trackingNumber?: string
}

export function OrderStatus({ status, estimatedDelivery, trackingNumber }: OrderStatusProps) {
  const getStatusColor = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case "pending":
        return "text-yellow-500 bg-yellow-100"
      case "processing":
        return "text-blue-500 bg-blue-100"
      case "shipped":
        return "text-indigo-500 bg-indigo-100"
      case "delivered":
        return "text-green-500 bg-green-100"
      case "cancelled":
        return "text-red-500 bg-red-100"
      default:
        return "text-gray-500 bg-gray-100"
    }
  }

  const getStatusIcon = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5" />
      case "cancelled":
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusText = (currentStatus: OrderStatus) => {
    switch (currentStatus) {
      case "pending":
        return "Order Pending"
      case "processing":
        return "Processing Order"
      case "shipped":
        return "Order Shipped"
      case "delivered":
        return "Order Delivered"
      case "cancelled":
        return "Order Cancelled"
      default:
        return "Unknown Status"
    }
  }

  const statusColor = getStatusColor(status)
  const StatusIcon = () => getStatusIcon(status)
  const statusText = getStatusText(status)

  return (
    <div className="space-y-4">
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusColor}`}>
        <StatusIcon />
        <span className="ml-2 font-medium">{statusText}</span>
      </div>

      <div className="space-y-2">
        {estimatedDelivery && status !== "cancelled" && status !== "delivered" && (
          <p className="text-sm">
            <span className="font-medium">Estimated Delivery:</span> {estimatedDelivery}
          </p>
        )}
        {trackingNumber && status !== "pending" && status !== "cancelled" && (
          <p className="text-sm">
            <span className="font-medium">Tracking Number:</span> {trackingNumber}
          </p>
        )}
      </div>

   
      {status !== "cancelled" && (
        <div className="relative pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-center">Pending</div>
            <div className="text-xs text-center">Processing</div>
            <div className="text-xs text-center">Shipped</div>
            <div className="text-xs text-center">Delivered</div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div
              className="bg-primary transition-all ease-out duration-500"
              style={{
                width:
                  status === "pending"
                    ? "25%"
                    : status === "processing"
                      ? "50%"
                      : status === "shipped"
                        ? "75%"
                        : status === "delivered"
                          ? "100%"
                          : "0%",
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
