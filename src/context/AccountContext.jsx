import { createContext, useContext, useState } from "react"

// Mirrors CartDrawerContext/AuthContext's authPanel pattern: pure open/closed
// + active-tab UI state for the account slide-over, mounted once at the App
// root so it can be triggered from Header.jsx, Footer.jsx, or a redirect
// route - none of which nest inside each other.
const AccountContext = createContext(null)

export const AccountProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("orders")

  const openAccountOverlay = (tab = "orders") => {
    setActiveTab(tab)
    setIsOpen(true)
  }

  const closeAccountOverlay = () => setIsOpen(false)

  return (
    <AccountContext.Provider value={{ isOpen, activeTab, setActiveTab, openAccountOverlay, closeAccountOverlay }}>
      {children}
    </AccountContext.Provider>
  )
}

export const useAccountOverlay = () => useContext(AccountContext)
