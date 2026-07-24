"use client"

import { useState, useEffect, useRef, useContext } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import FigsLogo from "./Components/FigsLogo.jsx"
import ContactForm from "./Components/ContactForm.jsx"
import DeliveryForm from "./Components/DeliveryForm.jsx"
import PaymentMethod from "./Components/PaymentMethod.jsx"
import OrderSummary from "./Components/OrderSummary.jsx"
import MobileOrderSummary from "./Components/MobileOrderSummary.jsx"
import Footer from "../../components/Footer"
import { AuthContext } from '../Login&Signup/AuthContext';
import { useIsMobile } from "./hooks/use-mobile"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const CheckoutPage = () => {
  const isMobile = useIsMobile()
  const [showOrderSummary, setShowOrderSummary] = useState(true)
  const mainRef = useRef(null)
  const formSectionsRef = useRef([])
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [discountedTotal, setDiscountedTotal] = useState(0)
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const { isLoggedIn } = useContext(AuthContext);
  
  // New state variables to store discount details and shipping
  const [discountInfo, setDiscountInfo] = useState({
    discountAmount: 0,
    discountReasons: [],
    pointsUsed: 0,
    shippingCharges: 0, // Add shipping charges here
    giftCardCode: '',
    giftCardAmount: 0
  });
  
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidationError, setShowValidationError] = useState(false)
  
  // Load cart data from localStorage
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const storedCart = localStorage.getItem('cartItems')
        if (storedCart) {
          const items = JSON.parse(storedCart)
          setCartItems(items)
          // Calculate total price
          const total = items.reduce((sum, item) => sum + item.totalPrice, 0)
          setTotalPrice(total)
          setDiscountedTotal(total) // Initialize discounted total, will be updated by OrderSummary
        }
      } catch (error) {
        console.error("Error loading cart items:", error)
      }
    }

    // Initial load
    loadCartItems()

    // Listen for cart updates
    window.addEventListener('cartUpdated', loadCartItems)

    return () => {
      window.removeEventListener('cartUpdated', loadCartItems)
    }
  }, [])

  const [checkoutDetails, setCheckoutDetails] = useState({
    customerInfo: {
      contactInfo: {
        name: "",
        email: "",
        phoneNumber: "",
      },
      deliveryInfo: {
        address: "",
        city: "",
        shippingCharges: 0,
      },
      payment: {
        method: "cash-on-delivery",
        bankTransfer: {
          receipt: null,
        },
        cashOnDelivery: {
          agreedToTerms: false,
        },
      },
    },
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const ctx = gsap.context(() => {
      formSectionsRef.current.forEach((section, index) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: section,
              start: "top bottom-=100",
              toggleActions: "play none none none",
            },
          },
        )
      })
    })

    return () => ctx.revert()
  }, [])

  const addToFormSectionsRef = (el) => {
    if (el && !formSectionsRef.current.includes(el)) {
      formSectionsRef.current.push(el)
    }
  }

  const handleContactInfoChange = (contactInfo) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        contactInfo: {
          ...prev.customerInfo.contactInfo,
          ...contactInfo,
        },
      },
    }))
  }

  const handleDeliveryInfoChange = (updatedData) => {
    if (!updatedData || !updatedData.customerInfo) {
      return;
    }

    const { deliveryInfo } = updatedData.customerInfo;

    setCheckoutDetails((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        deliveryInfo: {
          ...prev.customerInfo.deliveryInfo,
          ...deliveryInfo,
        },
      },
    }))
  }

  const handlePaymentMethodChange = (paymentInfo) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        payment: {
          ...prev.customerInfo.payment,
          method: paymentInfo.method,
          bankTransfer: {
            ...prev.customerInfo.payment.bankTransfer,
            receipt: paymentInfo.bankTransfer?.receipt || prev.customerInfo.payment.bankTransfer?.receipt,
          },
          cashOnDelivery: {
            ...prev.customerInfo.payment.cashOnDelivery,
            agreedToTerms: paymentInfo.cashOnDelivery?.agreedToTerms || prev.customerInfo.payment.cashOnDelivery?.agreedToTerms,
          },
        },
      },
    }))
  }

  const handleDiscountCodeChange = (discountCode) => {
    setCheckoutDetails((prev) => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        discountCode,
      },
    }))
  }

  const handleRemoveProduct = (id, colorName, size) => {
    try {
      const updatedItems = cartItems.filter(
        item => !(item.id === id && item.colorName === colorName && item.size === size)
      )
      localStorage.setItem('cartItems', JSON.stringify(updatedItems))
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  // Updated function to receive comprehensive discount information including shipping
  const handleDiscountUpdate = (data) => {
    setDiscountedTotal(data.finalTotal);
    setDiscountInfo({
      discountAmount: data.discountAmount,
      discountReasons: data.discountReasons,
      pointsUsed: data.pointsUsed,
      shippingCharges: data.shippingCharges || 0, // Store shipping charges from OrderSummary
      giftCardCode: data.giftCardCode || '',
      giftCardAmount: data.giftCardAmount || 0
    });
  }

  const validateCheckoutDetails = () => {
    const errors = []
    const { customerInfo } = checkoutDetails

    if (!customerInfo.contactInfo.name) errors.push("Name is required")
    if (!customerInfo.contactInfo.email) {
      errors.push("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.contactInfo.email)) {
      errors.push("Please enter a valid email address")
    }
    if (!customerInfo.contactInfo.phoneNumber) errors.push("Phone number is required")
    if (!customerInfo.deliveryInfo.address) errors.push("Street address is required")
    if (!customerInfo.deliveryInfo.city) errors.push("City is required")

    if (!customerInfo.payment.method) {
      errors.push("Please select a payment method")
    } else if (customerInfo.payment.method === "bank-transfer" && !customerInfo.payment.bankTransfer.receipt) {
      errors.push("Please upload a receipt for bank transfer")
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSubmitOrder = async () => {
    if (!validateCheckoutDetails()) {
      setShowValidationError(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
  
    setIsProcessing(true)
    try {
      // Format shipping address from delivery info
      const shippingAddress = {
        fullName: checkoutDetails.customerInfo.contactInfo.name,
        addressLine1: checkoutDetails.customerInfo.deliveryInfo.address,
        city: checkoutDetails.customerInfo.deliveryInfo.city,
        state: 'N/A',
        postalCode: '00000',
        country: 'Pakistan',
        phoneNumber: checkoutDetails.customerInfo.contactInfo.phoneNumber
      };
  
      // Format items for the backend
      const formattedItems = cartItems.map(item => ({
        product: item.id,
        color: item.colorName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice
      }));
  
      const paymentMethod = checkoutDetails.customerInfo.payment.method === 'bank-transfer' 
        ? 'bank-transfer' 
        : 'cash-on-delivery';
      
      // Calculate the correct totals including shipping
      const subtotalAmount = totalPrice;
      const shippingAmount = subtotalAmount >= 5000 ? 0 : (discountInfo.shippingCharges || 0);
      const discountAmount = discountInfo.discountAmount || 0;
      const pointsUsedAmount = Number(discountInfo.pointsUsed) || 0;
      const giftCardAmountApplied = Number(discountInfo.giftCardAmount) || 0;

      const totalDiscountAmount = discountAmount + pointsUsedAmount;
      const finalTotal = subtotalAmount + shippingAmount - totalDiscountAmount;

      const orderData = {
        customerInfo: {
          email: checkoutDetails.customerInfo.contactInfo.email,
          phone: checkoutDetails.customerInfo.contactInfo.phoneNumber
        },
        shippingAddress,
        items: formattedItems,
        subtotal: subtotalAmount,
        shippingCharges: shippingAmount,
        total: finalTotal,
        discount: totalDiscountAmount,
        discountCode: checkoutDetails.customerInfo.discountCode || '',
        discountInfo: {
          amount: discountAmount,
          reasons: discountInfo.discountReasons,
          pointsUsed: pointsUsedAmount
        },
        giftCardCode: discountInfo.giftCardCode || '',
        giftCardAmountApplied,
        paymentMethod,
      };
  
      console.log("Submitting order with data:", orderData);
      
      let response;
      
      // Prepare headers - only add Authorization if token exists
      const headers = {};
      const token = localStorage.getItem('accessToken');
      const isLoggedIn = !!token;
      if (isLoggedIn) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use /create-guest for guests, /create for logged-in users
      const endpoint = isLoggedIn
        ? 'https://steth-backend.onrender.com/api/orders/create'
        : 'https://steth-backend.onrender.com/api/orders/create-guest';

      if (paymentMethod === 'bank-transfer' && checkoutDetails.customerInfo.payment.bankTransfer.receipt) {
        const formData = new FormData();
        formData.append('receipt', checkoutDetails.customerInfo.payment.bankTransfer.receipt);
        formData.append('orderData', JSON.stringify(orderData));
        response = await fetch(endpoint, {
          method: 'POST',
          headers, // Don't set Content-Type for FormData
          body: formData
        });
      } else {
        headers['Content-Type'] = 'application/json';
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData)
        });
      }
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.success) {
        // Add purchase event to Google Analytics
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "purchase",
          ecommerce: {
            transaction_id: result.order.orderId || result.order._id,
            value: finalTotal,
            currency: "PKR",
            shipping: shippingAmount,
            items: cartItems.map(item => ({
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: item.quantity,
              item_variant: `${item.colorName} - ${item.size}`
            }))
          }
        });
        console.log("Purchase fired")
        window.fbq('track', 'Purchase', {
          value: finalTotal,
          currency: 'PKR'
        });
        // Clear cart
        localStorage.removeItem('cartItems');
        window.dispatchEvent(new Event('cartUpdated'));

        // #20 - "save this address to my profile", fired only after the
        // order itself has actually succeeded. Wrapped in its own try/catch
        // so a failure here never affects the (already successful) order -
        // this is a profile nicety, not part of the checkout transaction.
        if (isLoggedIn && checkoutDetails.customerInfo.deliveryInfo.saveAddress) {
          try {
            const accessToken = localStorage.getItem('accessToken');
            await fetch('https://steth-backend.onrender.com/api/users/update-account', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                address: {
                  fullName: checkoutDetails.customerInfo.contactInfo.name,
                  addressLine1: checkoutDetails.customerInfo.deliveryInfo.address,
                  city: checkoutDetails.customerInfo.deliveryInfo.city,
                  phoneNumber: checkoutDetails.customerInfo.contactInfo.phoneNumber,
                }
              })
            });
          } catch (saveAddressError) {
            console.error("Error saving address to profile:", saveAddressError);
          }
        }

        // Show success message and set order ID
        setOrderSuccess(true);
        setOrderId(result.order.orderId);
      } else {
        alert(`Order failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setValidationErrors(["Failed to submit order. Please try again."])
      setShowValidationError(true)
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-white text-gray-900 text-base md:text-lg md:w-screen w-full overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 py-4 px-4 md:px-0 md:py-6">
        <div className="max-w-7xl mx-auto">
          <FigsLogo />
        </div>
      </header>

      {/* Mobile Order Summary Toggle */}
      <div className="md:hidden border-b border-gray-300 bg-white">
        <button
          onClick={() => setShowOrderSummary(!showOrderSummary)}
          className="w-full py-3 px-4 flex justify-between items-center bg-white border border-gray-300 rounded-none"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-base md:text-lg">Order summary</span>
            {showOrderSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
        {showOrderSummary && (
          <MobileOrderSummary
            onDiscountCodeChange={handleDiscountCodeChange}
            onRemoveProduct={handleRemoveProduct}
            onDiscountUpdate={handleDiscountUpdate}
            deliveryInfo={checkoutDetails.customerInfo.deliveryInfo}
          />
        )}
      </div>

      {/* Validation Error Banner */}
      {showValidationError && validationErrors.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-4 z-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">Please fix the following errors:</h3>
                <ul className="list-disc list-inside mt-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowValidationError(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <main ref={mainRef} className="max-w-7xl mx-auto grid md:grid-cols-[1fr,400px] md:gap-8">
        {/* Left Column - Checkout Form */}
        <div className="px-4 py-4 md:py-8 md:pr-8">
          <div className="mb-6" ref={addToFormSectionsRef}>
            <h2 className="text-xl md:text-2xl font-medium mb-2">Contact</h2>
            <ContactForm
              data={checkoutDetails.customerInfo.contactInfo}
              onChange={handleContactInfoChange}
            />
          </div>

          <div className="mb-6" ref={addToFormSectionsRef}>
            <h2 className="text-xl md:text-2xl font-medium mb-2">Delivery</h2>
            <DeliveryForm 
              data={checkoutDetails}
              onDeliveryInfoChange={handleDeliveryInfoChange} 
            />
          </div>

          <div className="mb-6" ref={addToFormSectionsRef}>
            <h2 className="text-xl md:text-2xl font-medium mb-2">Payment</h2>
            <p className="text-sm md:text-base text-gray-500 mb-3">All transactions are secure and encrypted.</p>
            <PaymentMethod 
              data={checkoutDetails.customerInfo.payment} 
              onChange={handlePaymentMethodChange} 
            />
          </div>

          <div className="mb-6" ref={addToFormSectionsRef}>
            <p className="text-sm md:text-base mb-4">
              By placing this order, you agree to the STETHS{" "}
              <a href="/terms" className="underline">
                Terms of Use
              </a>{" "}
              and understand our{" "}
              <a href="/terms" className="underline">
                Privacy Policy
              </a>
              .
            </p>
            <button
              className="w-full bg-black text-white py-4 rounded font-medium text-base md:text-lg disabled:opacity-70"
              onClick={handleSubmitOrder}
              disabled={cartItems.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  {/* Spinner icon */}
                  <svg 
                    className="animate-spin h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Checkout"
              )}
            </button>
            <p className="text-xs md:text-sm text-gray-500 mt-4">
              Your info will be saved to a Shop account. By continuing, you agree to Shop's{" "}
              <a href="/terms" className="underline">
                Terms of Service
              </a>{" "}
              and acknowledge the{" "}
              <a href="/terms" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-500 mt-8">
            <a href="/terms" className="hover:text-gray-700">
              Refund Policy
            </a>
            <a href="/terms" className="hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gray-700">
              Terms of Use
            </a>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="hidden md:block">
          <div className="sticky top-6 bg-gray-50 p-6">
            <OrderSummary
              onDiscountCodeChange={handleDiscountCodeChange}
              onRemoveProduct={handleRemoveProduct}
              onDiscountUpdate={handleDiscountUpdate}
              deliveryInfo={checkoutDetails.customerInfo.deliveryInfo}
            />
          </div>
        </div>
      </main>

      {orderSuccess && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-8 rounded-lg max-w-md w-full text-center">
      <svg 
        className="w-16 h-16 text-green-500 mx-auto mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M5 13l4 4L19 7" 
        />
      </svg>
      <h2 className="text-2xl font-bold mb-2">Order Successful!</h2>
      <p className="mb-4">Your order ID: {orderId}</p>
      <p className="mb-4">Thank you for your purchase. You'll be redirected to the homepage shortly.</p>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
        <p className="text-yellow-800 font-medium">
          An order confirmation has been sent to your email.
        </p>
        <p className="text-yellow-700 text-sm mt-1">
          Please check your inbox and spam folder. All future updates about your order will be sent to your email.
        </p>
      </div>
      
      <button 
        onClick={() => window.location.href = '/'}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
      >
        Go Home Now
      </button>
    </div>


    
  </div>
)}


<Footer/>
    </div>
  )
}

export default CheckoutPage