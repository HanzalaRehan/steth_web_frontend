import { createContext, useContext, useState } from "react"

// Mirrors AuthContext's authPanel pattern: pure UI open/closed state for the
// slide-over panel, mounted once at the App root so it can be triggered from
// any page (Header.jsx has no shared app shell and remounts per route).
// Cart item data itself still comes entirely from localStorage + the
// existing cartUpdated event, not from this context.
const CartDrawerContext = createContext(null)

export const CartDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openCartDrawer = () => setIsOpen(true)
  const closeCartDrawer = () => setIsOpen(false)

  return (
    <CartDrawerContext.Provider value={{ isOpen, openCartDrawer, closeCartDrawer }}>
      {children}
    </CartDrawerContext.Provider>
  )
}

export const useCartDrawer = () => useContext(CartDrawerContext)
