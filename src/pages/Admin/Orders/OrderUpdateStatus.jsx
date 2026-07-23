import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { API_BASE_URL } from "../../../config/api"

// Must match the Order schema's orderStatus enum exactly (case-sensitive) -
// the admin panel's original statusOptions were all lowercase, which would
// fail Mongoose validation on every single status update.
const statusOptions = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

const OrderUpdateStatus = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/details/${id}`, {
          headers: authHeader(),
        })
        if (!response.ok) {
          throw new Error("Failed to fetch order")
        }
        const data = await response.json()
        if (data.success) {
          setOrder(data.order)
          setSelectedStatus(data.order.orderStatus)
        } else {
          setError("Order not found")
        }
      } catch (error) {
        setError("Error connecting to server")
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return

    setUpdating(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update status: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        navigate("/admin/orders")
      } else {
        setError(data.message || "Failed to update status")
      }
    } catch (error) {
      console.error("Error in handleStatusUpdate:", error)
      setError(`Error updating status: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUpdating(false)
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

  if (!order) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">Order not found</div>
      </div>
    )
  }

  const orderEmail = getOrderEmail(order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin/orders">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Update Order Status</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Order ID:</span>
              <p className="text-sm">{order._id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Order Date:</span>
              <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Last Updated:</span>
              <p className="text-sm">{new Date(order.updatedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">First Order:</span>
              <p className="text-sm">{order.isFirstOrder ? "Yes" : "No"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-sm">{order.shippingAddress.fullName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm">{orderEmail || "No email provided"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Phone:</span>
              <p className="text-sm">{order.shippingAddress.phoneNumber}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
          <div className="space-y-2">
            <p className="text-sm">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p className="text-sm">{order.shippingAddress.addressLine2}</p>}
            <p className="text-sm">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm">{order.shippingAddress.country}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Payment Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Payment Method:</span>
              <p className="text-sm capitalize">{order.paymentMethod.replace("-", " ")}</p>
            </div>

            {order.paymentReceipt && (
              <div>
                <span className="text-sm font-medium text-gray-500">Payment Receipt:</span>
                <p className="text-sm text-blue-600">
                  <a href={order.paymentReceipt.url} target="_blank" rel="noopener noreferrer">
                    View Receipt
                  </a>
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Color: {item.color} | Size: {item.size} | Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">Product ID: {item.product._id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rs. {item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Total: Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount ({order.discountCode}):</span>
              <span>-Rs. {order.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Charges:</span>
              <span>Rs. {order.shippingCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Points Used:</span>
              <span>{order.pointsUsed}</span>
            </div>
            <div className="flex justify-between">
              <span>Points Earned:</span>
              <span>{order.pointsEarned}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>Rs. {order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Update Order Status</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status</label>
              <p className="text-sm text-gray-500">{order.orderStatus}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleStatusUpdate} disabled={updating || selectedStatus === order.orderStatus}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default OrderUpdateStatus
