import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Eye, CreditCard, Truck, Printer } from "lucide-react"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { API_BASE_URL } from "../../../config/api"

const TABS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

// Per-tab config: which single-row actions show, and which bulk actions the
// selection bar offers. `action` is either a target orderStatus (goes
// through bulk-update-status / update-status) or "generate-labels" (goes
// through the label-generation endpoints instead).
const TAB_CONFIG = {
  Pending: {
    rowActions: [
      { key: "confirm", label: "Confirm", status: "Confirmed" },
      { key: "cancel", label: "Cancel", status: "Cancelled", variant: "outline", isCancel: true },
    ],
    bulkActions: [
      { key: "confirm", label: "Confirm Selected", action: "Confirmed" },
      { key: "cancel", label: "Cancel Selected", action: "Cancelled" },
    ],
  },
  Confirmed: {
    rowActions: [
      { key: "label", label: "Print Label", isLabel: true },
      { key: "ship", label: "Shipped", status: "Shipped" },
    ],
    bulkActions: [
      { key: "labels", label: "Print Labels", action: "generate-labels" },
      { key: "ship", label: "Mark Shipped", action: "Shipped" },
    ],
    printAll: true,
  },
  Processing: {
    rowActions: [{ key: "ship", label: "Shipped", status: "Shipped" }],
    bulkActions: [{ key: "ship", label: "Mark Shipped", action: "Shipped" }],
  },
  Shipped: {
    rowActions: [{ key: "deliver", label: "Deliver", status: "Delivered" }],
    bulkActions: [{ key: "deliver", label: "Mark Delivered", action: "Delivered" }],
  },
  Delivered: { rowActions: [], bulkActions: [] },
  Cancelled: { rowActions: [], bulkActions: [] },
}

const OrdersList = () => {
  const [activeTab, setActiveTab] = useState("Pending")
  const [ordersByTab, setOrdersByTab] = useState({})
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [printAllLoading, setPrintAllLoading] = useState(false)
  const [rowActionLoading, setRowActionLoading] = useState(null)

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

  const fetchTab = useCallback(async (status, page = 1, reset = true) => {
    setOrdersByTab((prev) => ({
      ...prev,
      [status]: { ...(prev[status] || {}), loading: true },
    }))
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", status })
      const response = await fetch(`${API_BASE_URL}/api/orders/all?${params.toString()}`, {
        headers: authHeader(),
      })
      const data = await response.json()
      if (data.success) {
        setOrdersByTab((prev) => ({
          ...prev,
          [status]: {
            orders: reset ? data.orders : [...(prev[status]?.orders || []), ...data.orders],
            pagination: { currentPage: data.currentPage, totalPages: data.totalPages, total: data.total },
            loading: false,
          },
        }))
      } else {
        setOrdersByTab((prev) => ({ ...prev, [status]: { orders: [], loading: false, error: true } }))
      }
    } catch (error) {
      console.error(`Error fetching ${status} orders:`, error)
      setOrdersByTab((prev) => ({ ...prev, [status]: { orders: [], loading: false, error: true } }))
    }
  }, [])

  useEffect(() => {
    if (!ordersByTab[activeTab]) {
      fetchTab(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedIds(new Set())
  }

  const refetchActiveTab = () => fetchTab(activeTab)

  const currentTab = ordersByTab[activeTab] || { orders: [], loading: true }
  const orders = currentTab.orders || []
  const config = TAB_CONFIG[activeTab]

  const toggleSelect = (orderId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o._id))))
  }

  const handleLoadMore = () => {
    const pagination = currentTab.pagination
    if (pagination && pagination.currentPage < pagination.totalPages) {
      fetchTab(activeTab, pagination.currentPage + 1, false)
    }
  }

  // Single-row status change (Confirm, direct Ship shortcut, Deliver)
  const handleStatusAction = async (orderId, status) => {
    setRowActionLoading(orderId)
    try {
      await fetch(`${API_BASE_URL}/api/orders/update-status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status }),
      })
      refetchActiveTab()
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setRowActionLoading(null)
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return
    setRowActionLoading(orderId)
    try {
      await fetch(`${API_BASE_URL}/api/orders/cancel/${orderId}`, {
        method: "POST",
        headers: authHeader(),
      })
      refetchActiveTab()
    } catch (error) {
      console.error("Error cancelling order:", error)
    } finally {
      setRowActionLoading(null)
    }
  }

  const handlePrintLabel = async (orderId) => {
    setRowActionLoading(orderId)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/generate-label`, {
        method: "POST",
        headers: authHeader(),
      })
      const data = await response.json()
      if (data.success && data.labelUrl) {
        window.open(data.labelUrl, "_blank")
      }
      refetchActiveTab()
    } catch (error) {
      console.error("Error generating label:", error)
    } finally {
      setRowActionLoading(null)
    }
  }

  const handlePrintAllLabels = async () => {
    setPrintAllLoading(true)
    try {
      const orderIds = orders.map((o) => o._id)
      const response = await fetch(`${API_BASE_URL}/api/orders/bulk-generate-labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ orderIds }),
      })
      const data = await response.json()
      if (data.success) {
        data.results.filter((r) => r.success && r.url).forEach((r) => window.open(r.url, "_blank"))
      }
      refetchActiveTab()
    } catch (error) {
      console.error("Error printing all labels:", error)
    } finally {
      setPrintAllLoading(false)
    }
  }

  const handleBulkAction = async (action) => {
    setBulkLoading(true)
    const orderIds = Array.from(selectedIds)
    try {
      if (action === "generate-labels") {
        await fetch(`${API_BASE_URL}/api/orders/bulk-generate-labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ orderIds }),
        })
      } else {
        await fetch(`${API_BASE_URL}/api/orders/bulk-update-status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ orderIds, status: action }),
        })
      }
      setSelectedIds(new Set())
      refetchActiveTab()
    } catch (error) {
      console.error("Error in bulk action:", error)
    } finally {
      setBulkLoading(false)
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-cyan-100 text-cyan-800"
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
    if (order.email !== undefined) return order.email
    if (order.customerEmail) return order.customerEmail
    if (order.user?.email) return order.user.email
    return null
  }

  const hasMoreOrders = currentTab.pagination && currentTab.pagination.currentPage < currentTab.pagination.totalPages
  const allSelected = orders.length > 0 && selectedIds.size === orders.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {currentTab.pagination ? `Showing ${orders.length} of ${currentTab.pagination.total} orders` : ""}
          </div>
          {config.printAll && orders.length > 0 && (
            <Button onClick={handlePrintAllLabels} disabled={printAllLoading} variant="outline" size="sm">
              {printAllLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Printing...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" /> Print All Labels
                </>
              )}
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && config.bulkActions.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            {config.bulkActions.map((bulk) => (
              <Button
                key={bulk.key}
                size="sm"
                variant="outline"
                disabled={bulkLoading}
                onClick={() => handleBulkAction(bulk.action)}
              >
                {bulk.label}
              </Button>
            ))}
          </div>
        )}

        {currentTab.loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {config.rowActions.length > 0 && (
                  <TableHead className="w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4" />
                  </TableHead>
                )}
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const orderEmail = getOrderEmail(order)
                const isRowLoading = rowActionLoading === order._id

                return (
                  <TableRow key={order._id}>
                    {config.rowActions.length > 0 && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order._id)}
                          onChange={() => toggleSelect(order._id)}
                          className="w-4 h-4"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-medium">{order.orderId || order._id.slice(-6)}</TableCell>
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
                      <div className="flex flex-wrap gap-1.5">
                        {config.rowActions.map((rowAction) => (
                          <Button
                            key={rowAction.key}
                            variant={rowAction.variant || "default"}
                            size="sm"
                            disabled={isRowLoading}
                            onClick={() =>
                              rowAction.isLabel
                                ? handlePrintLabel(order._id)
                                : rowAction.isCancel
                                ? handleCancel(order._id)
                                : handleStatusAction(order._id, rowAction.status)
                            }
                          >
                            {isRowLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : rowAction.label}
                          </Button>
                        ))}
                        <Link to={`/admin/orders/${order._id}/update-status`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        {!currentTab.loading && hasMoreOrders && (
          <div className="flex justify-center mt-6">
            <Button onClick={handleLoadMore} variant="outline" className="min-w-32">
              Load More Orders
            </Button>
          </div>
        )}

        {!currentTab.loading && orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No {activeTab.toLowerCase()} orders</div>
        )}
      </Card>
    </div>
  )
}

export default OrdersList
