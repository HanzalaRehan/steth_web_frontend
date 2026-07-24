import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { X, User, Package, Sparkles, Award, LogOut, MapPin, Calendar, Mail } from "lucide-react"
import { AuthContext } from "../../pages/Login&Signup/AuthContext"
import { useAccountOverlay } from "../../context/AccountContext"
import { API_BASE_URL } from "../../config/api"

const STATUS_COLORS = {
  Pending: "bg-gray-100 text-gray-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Processing: "bg-yellow-100 text-yellow-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
}

const CANCELLABLE_STATUSES = ["Pending", "Processing"]

// #18 - Jaanuu-style right-side account overlay, structurally a mirror of
// CartDrawer.jsx/AuthPanel.jsx (AnimatePresence + backdrop + sliding panel,
// Escape + body-scroll-lock). Replaces the old routed Profile.jsx page.
const AccountOverlay = () => {
  const { isOpen, activeTab, setActiveTab, closeAccountOverlay } = useAccountOverlay()
  const { user: authUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAccountOverlay()
    }
    window.addEventListener("keydown", handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, closeAccountOverlay])

  useEffect(() => {
    if (!isOpen) return

    const token = localStorage.getItem("accessToken")
    if (!token) return

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data.user)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    const fetchOrders = async () => {
      setIsLoadingOrders(true)
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchProfile()
    fetchOrders()
  }, [isOpen])

  const handleLogout = () => {
    logout()
    closeAccountOverlay()
    navigate("/")
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return

    setCancellingId(orderId)
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_BASE_URL}/api/orders/cancel/${orderId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)))
      } else {
        alert(data.message || "Could not cancel this order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      alert("Could not cancel this order right now")
    } finally {
      setCancellingId(null)
    }
  }

  const goTo = (path) => {
    closeAccountOverlay()
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            key="account-overlay-backdrop"
            className="fixed inset-0 bg-black/50 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAccountOverlay}
          />
          <Motion.div
            key="account-overlay"
            className="fixed inset-y-0 right-0 z-[10001] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">My Account</h2>
              <button
                type="button"
                onClick={closeAccountOverlay}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              {[
                { key: "for-you", label: "For You", icon: Sparkles },
                { key: "orders", label: "Orders", icon: Package },
                { key: "profile", label: "Profile", icon: User },
              ].map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
                      activeTab === tab.key ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <TabIcon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              {activeTab === "for-you" && (
                <div className="text-center py-10">
                  <Sparkles size={40} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="font-medium text-black mb-2">Loyalty & Rewards</h3>
                  <p className="text-sm text-gray-600 mb-5">
                    Your points, perks, and personalized picks are coming here soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => goTo("/rewards")}
                    className="px-4 py-2 border border-black rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Visit Rewards
                  </button>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10">
                      <Package size={40} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => {
                        const isExpanded = expandedOrderId === order._id
                        const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus)
                        return (
                          <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-medium text-black">
                                  #{order.orderId || order._id.slice(-6)}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Calendar size={12} />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-black">Rs. {order.total?.toFixed(2)}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.orderStatus}
                                </span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                  Status Timeline
                                </h4>
                                <ol className="space-y-2 mb-4">
                                  {(order.statusHistory || []).map((entry, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                      <span className="w-2 h-2 mt-1.5 rounded-full bg-black shrink-0" />
                                      <div>
                                        <span className="font-medium text-black">{entry.status}</span>
                                        <span className="text-gray-500 ml-2 text-xs">
                                          {new Date(entry.changedAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </li>
                                  ))}
                                </ol>

                                <div className="flex flex-wrap gap-2">
                                  {canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => handleCancelOrder(order._id)}
                                      disabled={cancellingId === order._id}
                                      className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                      {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                                    </button>
                                  )}
                                  <a
                                    href={`mailto:info@stethset.com?subject=${encodeURIComponent(
                                      `Question about order #${order.orderId || order._id.slice(-6)}`
                                    )}`}
                                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                                  >
                                    Contact Us About This Order
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-center mb-6">
                    {profile?.profilePicUrl ? (
                      <img src={profile.profilePicUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={36} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="font-medium text-black">{profile?.username || authUser?.username || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-black break-all">{profile?.email || authUser?.email || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award size={20} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Reward Points</p>
                        <p className="font-medium text-black">{profile?.rewardPoints || 0}</p>
                      </div>
                    </div>
                    {profile?.addresses?.find((a) => a.isDefault) && (
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-gray-500 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Saved Address</p>
                          <p className="font-medium text-black">
                            {profile.addresses.find((a) => a.isDefault).addressLine1},{" "}
                            {profile.addresses.find((a) => a.isDefault).city}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AccountOverlay
