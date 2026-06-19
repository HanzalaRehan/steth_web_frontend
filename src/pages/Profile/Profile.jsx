"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { User, Mail, Package, LogOut, Award, MapPin, CreditCard, Calendar, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"

const Profile = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [activeTab, setActiveTab] = useState("profile")

  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const contentRef = useRef(null)
  const errorRef = useRef(null)
  const successRef = useRef(null)

  // Initialize animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
      gsap.fromTo(titleRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" })
      gsap.fromTo(contentRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: "power2.out" })
    })

    return () => ctx.revert()
  }, [])

  // Fetch user data and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          navigate('/login')
          return
        }

        // Fetch user profile
        const userResponse = await fetch('https://steth-backend.onrender.com/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await userResponse.json()
        setUserData(userData.user)

        // Fetch orders
        const ordersResponse = await fetch('https://steth-backend.onrender.com/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders')
        }

        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  const clearError = () => {
    if (error) {
      gsap.to(errorRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          setError("")
        },
      })
    }
  }

  const clearSuccess = () => {
    if (successMessage) {
      gsap.to(successRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          setSuccessMessage("")
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex-col items-center justify-center bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <Header />
      <div className="flex items-center justify-center bg-gray-50 px-4 py-12">
        <div ref={containerRef} className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-black text-white">
            <h2 ref={titleRef} className="text-2xl font-bold">
              My Profile
            </h2>
            <p className="mt-2 text-gray-300">
              Manage your account and view order history
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              ref={errorRef}
              className="mx-6 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center justify-between"
            >
              <span className="text-sm">{error}</span>
              <button onClick={clearError}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              ref={successRef}
              className="mx-6 sm:mx-8 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center justify-between"
            >
              <span className="text-sm">{successMessage}</span>
              <button onClick={clearSuccess}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Content */}
          <div ref={contentRef} className="p-6 sm:p-8">
            {/* Mobile Tabs */}
            <div className="flex border-b md:hidden mb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-3 text-center ${
                  activeTab === "profile" ? " border-black  bg-white font-medium text-black" : "text-gray-400"
                }`}
              >
                <User size={18} className="inline mr-1" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 py-3 text-center ${
                  activeTab === "orders" ? " bg-white border-black font-medium text-black" : "text-gray-00"
                }`}
              >
                <Package size={18} className="inline mr-1" />
                Orders
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className={`lg:col-span-1 ${activeTab === "profile" ? "block" : "hidden md:block"}`}>
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <div className="flex items-center justify-center mb-6 relative">
                    {userData?.profilePicUrl ? (
                      <img 
                        src={userData.profilePicUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={48} className="text-gray-400" />
                      </div>
                    )}
                    <span className={`absolute -top-2 right-0 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      userData?.isStudent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userData?.isStudent && userData?.studentVerified ? 'Student' : 'Customer'}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Username</p>
                        <p className="font-medium text-gray-900 truncate">{userData?.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail size={24} className="text-gray-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 break-words">{userData?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Award size={24} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Reward Points</p>
                        <p className="font-medium text-gray-900">{userData?.rewardPoints || 0}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Orders Section */}
              <div className={`lg:col-span-2 ${activeTab === "orders" ? "block" : "hidden md:block"}`}>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                    <Package size={24} className="mr-2" />
                    Order History
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                            <div>
                              <p className="font-medium text-gray-900">Order #{order.orderId || order._id.slice(-6)}</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Calendar size={16} className="mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm mt-2 sm:mt-0 ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Shipping Address */}
                          <div className="mb-4">
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin size={16} className="mr-1" />
                              <span className="text-sm">Shipping Address</span>
                            </div>
                            <div className="text-sm text-gray-700">
                              <p>{order.shippingAddress.fullName}</p>
                              <p>{order.shippingAddress.addressLine1}</p>
                              {order.shippingAddress.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                              <p>{order.shippingAddress.country}</p>
                              <p>{order.shippingAddress.phoneNumber}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <h4 className="font-medium mb-2 text-gray-900">Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium text-gray-900">{item.color} - Size {item.size}</span>
                                    <span className="text-gray-600"> x {item.quantity}</span>
                                  </div>
                                  <span className="text-gray-900">Rs.{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="border-t pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Subtotal</p>
                                <p className="font-medium text-gray-900">Rs.{order.subtotal.toFixed(2)}</p>
                              </div>
                              {order.discount > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600">Discount ({order.discountCode})</p>
                                  <p className="font-medium text-green-600">-Rs.{order.discount.toFixed(2)}</p>
                                </div>
                              )}
                              {order.pointsUsed > 0 && (
                                <div>
                                  <p className="text-sm text-gray-600">Points Used</p>
                                  <p className="font-medium text-gray-900">-{order.pointsUsed} points</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-600">Discounted Total</p>
                                <p className="font-medium text-gray-900">Rs.{order.total.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-medium text-gray-900 flex items-center">
                                  <CreditCard size={16} className="mr-1" />
                                  {order.paymentMethod}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Points Earned</p>
                                <p className="font-medium text-gray-900 flex items-center">
                                  <Award size={16} className="mr-1" />
                                  {order.pointsEarned} points
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile