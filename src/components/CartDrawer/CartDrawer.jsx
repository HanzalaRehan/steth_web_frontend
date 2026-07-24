import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { X, Minus, Plus } from "lucide-react"
import { useCartDrawer } from "../../context/CartDrawerContext"

// #16 - slide-from-right cart preview. Structurally mirrors AuthPanel.jsx
// (backdrop + sliding panel via AnimatePresence, Escape + body-scroll-lock),
// but item data is read straight from localStorage and kept in sync via the
// existing cartUpdated event - the same mechanism Header.jsx's cart badge
// and Cart.jsx already use, per CLAUDE.md's "don't invent a second cart
// state mechanism" note. Quantity +/- and remove here write back through
// that same event so the full /cart page never drifts out of sync.
const CartDrawer = () => {
  const { isOpen, closeCartDrawer } = useCartDrawer()
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    const loadItems = () => {
      try {
        const stored = localStorage.getItem("cartItems")
        setItems(stored ? JSON.parse(stored) : [])
      } catch (error) {
        console.error("Error loading cart items:", error)
      }
    }

    loadItems()
    window.addEventListener("cartUpdated", loadItems)
    return () => window.removeEventListener("cartUpdated", loadItems)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCartDrawer()
    }
    window.addEventListener("keydown", handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, closeCartDrawer])

  const updateItems = (updated) => {
    setItems(updated)
    localStorage.setItem("cartItems", JSON.stringify(updated))
    window.dispatchEvent(new Event("cartUpdated"))
  }

  const changeQuantity = (id, colorName, size, delta) => {
    const updated = items
      .map((item) => {
        if (item.id === id && item.colorName === colorName && item.size === size) {
          const newQuantity = item.quantity + delta
          if (newQuantity <= 0) return null
          return { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
        }
        return item
      })
      .filter(Boolean)
    updateItems(updated)
  }

  const removeItem = (id, colorName, size) => {
    updateItems(items.filter((item) => !(item.id === id && item.colorName === colorName && item.size === size)))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const goTo = (path) => {
    closeCartDrawer()
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            key="cart-drawer-backdrop"
            className="fixed inset-0 bg-black/50 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCartDrawer}
          />
          <Motion.div
            key="cart-drawer"
            className="fixed inset-y-0 right-0 z-[10001] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Your Cart ({items.length})</h2>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <button
                  type="button"
                  onClick={() => goTo("/")}
                  className="py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.colorName}-${item.size}`} className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-100">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.colorName} / {item.size}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => changeQuantity(item.id, item.colorName, item.size, -1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.id, item.colorName, item.size, 1)}
                            className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded bg-white hover:bg-gray-50"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-medium text-black">Rs. {item.totalPrice.toFixed(2)}</span>
                        <button
                          onClick={() => removeItem(item.id, item.colorName, item.size)}
                          className="text-gray-400 hover:text-gray-700"
                          aria-label="Remove item"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                  <div className="flex justify-between font-medium text-black">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => goTo("/cart")}
                    className="w-full py-2.5 border border-black text-black rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    View Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo("/checkout")}
                    className="w-full py-2.5 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
                  >
                    Checkout
                  </button>
                </div>
              </>
            )}
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
