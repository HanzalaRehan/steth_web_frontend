import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Eye, CreditCard, Truck } from "lucide-react"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { API_BASE_URL } from "../../../config/api"

const OrdersList = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, count: 0 })

  useEffect(() => {
    fetchOrders(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams({ page: page.toString(), limit: "10" })

      const response = await fetch(`${API_BASE_URL}/api/orders/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()

      if (data.success) {
        if (reset) {
          setOrders(data.orders)
        } else {
          setOrders((prevOrders) => [...prevOrders, ...data.orders])
        }

        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
          count: data.count,
        })

        setError(null)
      } else {
        setError("Failed to load orders")
      }
    } catch (error) {
      setError("Error connecting to server")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = () => {
    if (pagination.currentPage < pagination.totalPages && !loadingMore) {
      fetchOrders(pagination.currentPage + 1, false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodDisplay = (paymentMethod, order) => {
    switch (paymentMethod) {
      case "cash-on-delivery":
        return (
          <div className="flex items-center">
            <Truck className="h-4 w-4 mr-1 text-green-600" />
            <span>Cash on Delivery</span>
          </div>
        )
      case "bank-transfer":
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-blue-600" />
              <span>Bank Transfer</span>
            </div>
            {order.paymentReceipt?.uploaded && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8">
                    <Eye className="h-4 w-4 mr-1" />
                    View Receipt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Payment Receipt</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    {order.paymentReceipt?.url ? (
                      <div className="relative h-[70vh] w-full">
                        <img src={order.paymentReceipt.url} alt="Payment Receipt" className="w-full h-full object-contain rounded-md cursor-zoom-in" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-100 text-center rounded-md">Receipt image not available</div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )
      default:
        return paymentMethod
    }
  }

  const getOrderEmail = (order) => {
    if (order.email !== undefined) {
      return order.email
    }

    if (order.customerEmail) {
      return order.customerEmail
    } else if (order.user?.email) {
      return order.user.email
    }

    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>
      </div>
    )
  }

  const hasMoreOrders = pagination.currentPage < pagination.totalPages

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="text-sm text-gray-600">
          Showing {orders.length} of {pagination.total} orders
        </div>
      </div>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const orderEmail = getOrderEmail(order)

              return (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order._id.slice(-6)}</TableCell>
                  <TableCell>
                    <div>
                      <div>{order.shippingAddress?.fullName || "N/A"}</div>
                      <div className="text-sm text-gray-500">{orderEmail || "No email provided"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items?.map((item, index) => (
                      <div key={item._id || index} className="text-sm">
                        {item.quantity || 0}x {item.productName || "Unknown Product"} - {item.color || "N/A"} ({item.size || "N/A"})
                        {index < order.items.length - 1 && ", "}
                      </div>
                    )) || <span className="text-gray-500">No items</span>}
                  </TableCell>
                  <TableCell>Rs.{(order.total || 0).toFixed(2)}</TableCell>
                  <TableCell>{getPaymentMethodDisplay(order.paymentMethod, order)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.orderStatus || "unknown")}`}>
                      {order.orderStatus || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>{order.createdAt ? formatDate(order.createdAt) : "N/A"}</TableCell>
                  <TableCell>
                    <Link to={`/admin/orders/${order._id}/update-status`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {hasMoreOrders && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" className="min-w-32">
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More Orders (${pagination.total - orders.length} remaining)`
              )}
            </Button>
          </div>
        )}

        {orders.length > 0 && !hasMoreOrders && (
          <div className="text-center mt-6 text-sm text-gray-500">
            All orders loaded ({pagination.total} total)
          </div>
        )}

        {orders.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        )}
      </Card>
    </div>
  )
}

export default OrdersList
