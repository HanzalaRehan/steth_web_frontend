"use client"

import { useEffect, useRef, useState,useContext } from "react"
import { gsap } from "gsap"
import { ArrowLeft, Info, Minus, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../Login&Signup/AuthContext';
import { Dialog } from '@headlessui/react'; 


import Header from "../../components/Header"
import Footer from "../../components/Footer"
import YouMayAlsoLike from "./Components/YouMayAlsoLike"

const Cart = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [shipping, setShipping] = useState(0)
  const [discounts, setDiscounts] = useState({ amount: 0, reasons: [] })
  const [pointsAvailable, setPointsAvailable] = useState(0)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const cartRef = useRef(null)
  const { isLoggedIn } = useContext(AuthContext);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const storedCart = localStorage.getItem('cartItems')
        if (storedCart) {
          setProducts(JSON.parse(storedCart))
        }
      } catch (error) {
        console.error("Error loading cart items:", error)
      }
    }
    loadCartItems()
    
    // Load user's available points if logged in
    const loadUserPoints = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const response = await fetch('https://steth-backend.onrender.com/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setPointsAvailable(userData.user?.rewardPoints || 0)
          }
        }
      } catch (error) {
        console.error("Error loading user points:", error)
      }
    }
    
    loadUserPoints()
  }, [])

  useEffect(() => {
    const calculateDiscounts = async () => {
      if (products.length === 0) {
        console.log("No products in cart - resetting discounts");
        setDiscounts({ amount: 0, reasons: [] });
        return;
      }
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        
        // Debug log
        console.log("Calculating discounts with subtotal:", calculateSubtotal());
        console.log("Points to use:", pointsToUse);
        
        // If user is not logged in, we can't calculate discounts
        if (!token) {
          console.log("No token found - user not logged in");
          setDiscounts({ amount: 0, reasons: [] });
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('https://steth-backend.onrender.com/api/orders/calculate-discount', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            subtotal: calculateSubtotal(),
            pointsToUse: pointsToUse
          })
        });
        
        // Debug log for API response status
        console.log("Discount API response status:", response.status);
        
        const data = await response.json();
        console.log("DEBUG - Full discount API response:", data);
        
        if (response.ok) {
          // Always set the discount data, even if zero
          setDiscounts({
            amount: data.discountAmount || 0,
            reasons: data.discountReason ? data.discountReason.split(' + ') : [],
            pointsDiscount: data.pointsDiscount || 0,
            // Include the raw data for debugging
            rawData: data
          });
          
          // Debug log for successful response
          console.log("Discount set to:", {
            amount: data.discountAmount || 0,
            reasons: data.discountReason ? data.discountReason.split(' + ') : [],
            pointsDiscount: data.pointsDiscount || 0
          });
        } else {
          // If there's an error, log it and reset discounts
          console.error("Discount API error:", data);
          setDiscounts({ amount: 0, reasons: [], error: data.message });
        }
      } catch (error) {
        console.error("Error calculating discounts:", error);
        setDiscounts({ amount: 0, reasons: [], error: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateDiscounts();
  }, [products, pointsToUse]);
  
  const increaseQuantity = (id, colorName, size) => {
    const updatedProducts = products.map((product) => {
      if (product.id === id && product.colorName === colorName && product.size === size) {
        const newQuantity = product.quantity + 1
        return {
          ...product,
          quantity: newQuantity,
          totalPrice: product.price * newQuantity
        }
      }
      return product
    })
    setProducts(updatedProducts)
    localStorage.setItem('cartItems', JSON.stringify(updatedProducts))
    // Dispatch cart updated event
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const decreaseQuantity = (id, colorName, size) => {
    const updatedProducts = products.map((product) => {
      if (product.id === id && product.colorName === colorName && product.size === size && product.quantity > 1) {
        const newQuantity = product.quantity - 1
        return {
          ...product,
          quantity: newQuantity,
          totalPrice: product.price * newQuantity
        }
      }
      return product
    })
    setProducts(updatedProducts)
    localStorage.setItem('cartItems', JSON.stringify(updatedProducts))
    // Dispatch cart updated event
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeProduct = (id, colorName, size) => {
    const updatedProducts = products.filter(
      (product) => !(product.id === id && product.colorName === colorName && product.size === size)
    )
    setProducts(updatedProducts)
    localStorage.setItem('cartItems', JSON.stringify(updatedProducts))
    // Dispatch cart updated event
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const calculateSubtotal = () => {
    return products.reduce((total, product) => total + product.totalPrice, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const totalDiscounts = (discounts.amount || 0) + (pointsToUse || 0)
    return subtotal + shipping - totalDiscounts
  }
  
  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0
    // Limit points to available points and ensure not negative
    setPointsToUse(Math.min(Math.max(0, value), pointsAvailable))
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cart-item", {
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all",
      })

      gsap.from(".summary-section", {
        x: 30,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        clearProps: "all",
      })
    }, cartRef)

    return () => ctx.revert()
  }, [])

  const handleCheckout = () => {
    // GTM BEGIN CHECKOUT EVENT
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "PKR",
        value: calculateTotal(),
        items: products.map(product => ({
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: product.quantity,
          item_variant: `${product.colorName} - ${product.size}`
        }))
      }
    });
    console.log("checkout initiated")
    if (window.fbq) {
      console.log("fbq active")
      window.fbq('track', 'InitiateCheckout', {
        content_ids: products.map(i => i.id),
        value: products.reduce((sum, i) => sum + i.totalPrice, 0),
        currency: 'PKR'
      });
    }
  
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    
    // Existing checkout logic
    const orderData = {
      items: products.map(product => ({
        product: product.id,
        color: product.colorName,
        size: product.size,
        quantity: product.quantity
      })),
      pointsToUse: pointsToUse
    };
  
    localStorage.setItem('checkoutData', JSON.stringify(orderData));
    navigate('/checkout');
  };

  // Add this component near the return statement
  const LoginPromptModal = () => (
    <Dialog
      open={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-navy/30" aria-hidden="true" />
      
      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md border border-hairline bg-shirting p-8">
          <Dialog.Title className="font-caslon text-2xl mb-4 text-navy">
            Login Required for Checkout
          </Dialog.Title>

          <Dialog.Description className="mb-6">
            <div className="space-y-4 text-ink font-spectral">
              <p>Please log in to proceed with your purchase.</p>

              <div className="bg-paper border border-brass p-4">
                <h3 className="font-archivo font-semibold uppercase tracking-[0.14em] text-xs text-navy mb-3">
                  Benefits of creating an account
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-flannel">
                  <li>Earn reward points with every purchase</li>
                  <li>Get 10% off your first order</li>
                  <li>Track your order history</li>
                  <li>Faster checkout experience</li>
                </ul>
              </div>
            </div>
          </Dialog.Description>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/login', { state: { from: '/cart' } });
              }}
              className="flex-1 py-3 bg-navy text-paper font-archivo font-semibold uppercase tracking-[0.16em] text-sm hover:bg-ink transition-colors"
            >
              Login / Register
            </button>
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                // Proceed to checkout as guest
                navigate('/checkout');
              }}
              className="flex-1 py-3 bg-shirting text-ink border border-navy font-archivo font-semibold uppercase tracking-[0.16em] text-sm hover:bg-paper transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );


  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-paper">
        {/* Navigation */}
      <div className="bg-shirting shadow-sm w-full">
            <Header />
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-4 font-archivo text-xs uppercase tracking-[0.14em]">
              <a href="/" className="text-flannel hover:text-claret no-underline">
                Home
              </a>
              <span className="text-flannel/40">/</span>
              <a href="/checkout" className="text-flannel hover:text-claret no-underline">
                Checkout
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow w-full">
          <div className="container px-4 py-6 mx-auto">
            <div
              ref={cartRef}
              className="flex flex-col lg:flex-row max-w-6xl mx-auto bg-shirting border border-hairline"
            >
              {/* Cart Items Section */}
              <div className="flex-1 p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="font-caslon text-2xl md:text-3xl text-navy">Shopping Cart</h1>
                  <span className="font-archivo text-xs uppercase tracking-wide text-flannel/70">{products.length} items</span>
                </div>

              {products.length === 0 ? (
                <div className="border-t border-hairline py-12 text-center">
                  <div className="font-spectral text-lg text-flannel/80 mb-4">Your cart is empty</div>
                  <a href="/" className="inline-block py-3 px-6 bg-navy text-paper font-archivo font-semibold uppercase tracking-[0.16em] text-sm hover:bg-ink transition-colors no-underline">
                    Continue Shopping
                  </a>
                </div>
              ) : (
                <div className="border-t border-hairline">
                  {products.map((product) => (
                    <div
                      key={`${product.id}-${product.colorName}-${product.size}`}
                      className="cart-item py-4 md:py-6 flex flex-col sm:flex-row items-start sm:items-center border-b border-hairline"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-paper">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex-1">
                        <div className="font-archivo text-[11px] uppercase tracking-wide text-flannel/70 truncate">{product.category}</div>
                        <div className="font-caslon text-lg text-navy truncate">{product.name}</div>
                        <div className="text-sm font-spectral text-flannel/80">
                          Color: {product.colorName} | Size: {product.size}
                        </div>
                      </div>

                      <div className="flex items-center mt-2 sm:mt-0">
                        <button
                          onClick={() => decreaseQuantity(product.id, product.colorName, product.size)}
                          className="w-8 h-8 flex items-center justify-center bg-shirting border border-hairline text-ink hover:border-navy text-xl font-archivo"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <input
                          type="text"
                          value={product.quantity}
                          readOnly
                          className="mx-2 w-10 h-8 text-center bg-shirting border border-hairline text-ink font-archivo"
                          aria-label="Quantity"
                        />

                        <button
                          onClick={() => increaseQuantity(product.id, product.colorName, product.size)}
                          className="w-8 h-8 flex items-center justify-center bg-shirting text-ink border border-hairline hover:border-navy text-xl font-archivo"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="ml-auto sm:ml-6 w-24 text-right mt-2 sm:mt-0 font-archivo text-ink">
                        Rs. {product.totalPrice.toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeProduct(product.id, product.colorName, product.size)}
                        className="ml-2 sm:ml-6 bg-shirting text-flannel/70 hover:text-claret p-1"
                        aria-label="Remove item"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

                <div className="mt-6">
                  <a href="/" className="flex items-center text-ink no-underline hover:text-claret font-archivo text-sm uppercase tracking-wide">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to shop
                  </a>
                </div>

              {/* Show YouMayAlsoLike only when cart is not empty */}
              {products.length > 0 && <YouMayAlsoLike />}
              </div>

              {/* Summary Section */}
              <div className="summary-section w-full lg:w-1/3 p-4 md:p-8 bg-paper border-t lg:border-t-0 lg:border-l border-hairline">
                <h2 className="font-caslon text-xl md:text-2xl mb-6 text-navy">Summary</h2>

                <div className="border-t border-hairline pt-4">
                  <div className="flex justify-between mb-2 font-archivo text-sm">
                    <span className="text-flannel uppercase tracking-wide text-xs">Items {products.length}</span>
                  <span className="text-ink">Rs. {calculateSubtotal().toFixed(2)}</span>
                </div>

                {/* Shipping costs if any */}
                {shipping > 0 && (
                  <div className="flex justify-between mb-2 font-archivo text-sm">
                    <span className="text-flannel">Shipping</span>
                    <span className="text-ink">Rs. {shipping.toFixed(2)}</span>
                  </div>
                )}

                {/* Discounts section */}
                {discounts && (discounts.amount > 0 || discounts.reasons.length > 0) && (
  <div className="mt-4 mb-2">
    <div className="flex items-center">
      <span className="font-archivo text-xs uppercase tracking-wide text-flannel">Discounts</span>
      <div className="relative group ml-2">
        <Info size={16} className="text-flannel/70" />
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-shirting border border-hairline p-2 shadow-md text-sm w-48 z-10">
          <p className="mb-1 font-archivo text-xs uppercase tracking-wide text-navy">Available Discounts:</p>
          <ul className="list-disc list-inside font-spectral">
            {discounts.reasons.map((reason, index) => (
              <li key={index} className="text-xs">{reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {/* Always show the discount amount if there is one */}
    {discounts.amount > 0 && (
      <div className="flex justify-between text-sm mt-1 font-archivo">
        <span className="text-green-700">
          {discounts.reasons.length > 0
            ? discounts.reasons[0]
            : "Discount"}
        </span>
        <span className="text-green-700">-Rs. {discounts.amount.toFixed(2)}</span>
      </div>
    )}

    {/* Show additional discount reasons if any */}
    {discounts.reasons.slice(1).map((reason, index) => (
      <div key={index} className="flex justify-between text-sm mt-1 font-archivo">
        <span className="text-green-700">{reason}</span>
        <span className="text-green-700"></span>
      </div>
    ))}
  </div>
)}

                {/* Points section - only show if logged in */}
                {pointsAvailable > 0 && (
                  <div className="mt-4 mb-2">
                    <div className="flex items-center">
                      <span className="font-archivo text-xs uppercase tracking-wide text-flannel">Reward Points</span>
                      <div className="relative group ml-2">
                        <Info size={16} className="text-flannel/70" />
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-shirting border border-hairline p-2 shadow-md text-sm w-48 z-10 font-spectral">
                          <p className="mb-1">You have {pointsAvailable} points available</p>
                          <p className="text-xs">1 point = Rs. 1 discount</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                    <input
                        type="number"
                        min="0"
                        max={pointsAvailable}
                        value={pointsToUse}
                        onChange={handlePointsChange}
                        className="w-20 p-1 border border-hairline text-sm font-archivo focus:outline-none focus:border-claret"
                      />
                      <span className="ml-2 text-sm font-spectral text-flannel/80">/ {pointsAvailable} available</span>
                    </div>
                    {pointsToUse > 0 && (
                      <div className="flex justify-between text-sm mt-1 font-archivo">
                        <span className="text-green-700">Points Discount</span>
                        <span className="text-green-700">-Rs. {pointsToUse.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                </div>

                <div className="border-t border-hairline pt-4 mt-4">
                  <div className="flex justify-between mb-6 font-archivo">
                    <span className="text-navy uppercase tracking-wide text-sm font-semibold">Total Price</span>
                  <span className="text-ink font-semibold">Rs. {calculateTotal().toFixed(2)}</span>
                  </div>

                {products.length > 0 ? (
                    <button
                    onClick={handleCheckout}
                      className="w-full py-3.5 bg-navy text-paper font-archivo font-semibold uppercase tracking-[0.18em] text-sm hover:bg-ink transition-colors"
                      aria-label="Proceed to checkout"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Calculating...' : 'Checkout'}
                  </button>
                ) : (
                  <button
                    className="w-full py-3.5 bg-chalk text-flannel/60 font-archivo font-semibold uppercase tracking-[0.18em] text-sm cursor-not-allowed"
                    disabled
                    >
                      Checkout
                    </button>
                )}

                {/* Show how many points will be earned */}
                {products.length > 0 && (
                  <div className="mt-4 text-center text-sm font-spectral text-flannel/80">
                    <div>1 Reward Point = 1 Rs</div>
                    You'll earn {Math.floor(calculateTotal() / 100)} reward points from this purchase

                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginPromptModal />
    </div>
  )
}

export default Cart