import { useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AuthContext } from "./AuthContext"

/**
 * Compat shim for direct navigation to /login or /signup (Cart, Profile,
 * AdminLayout, Student, PopUp, bookmarks, etc.) now that both are a
 * slide-over rather than a routed page. Opens the panel over the homepage
 * and preserves the {state:{from}} pattern those callers already use.
 */
const AuthRedirect = ({ mode }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { openAuthPanel } = useContext(AuthContext)

  useEffect(() => {
    openAuthPanel(mode, { from: location.state?.from })
    navigate("/", { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default AuthRedirect
