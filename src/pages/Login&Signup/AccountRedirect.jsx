import { useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "./AuthContext"
import { useAccountOverlay } from "../../context/AccountContext"

/**
 * Compat shim for direct navigation to /profile (bookmarks, old links) now
 * that the account experience is a slide-over rather than a routed page.
 * Mirrors AuthRedirect.jsx exactly.
 */
const AccountRedirect = ({ tab = "profile" }) => {
  const navigate = useNavigate()
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const { openAccountOverlay } = useAccountOverlay()

  useEffect(() => {
    if (isLoggedIn) {
      openAccountOverlay(tab)
    } else {
      openAuthPanel("login")
    }
    navigate("/", { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default AccountRedirect
