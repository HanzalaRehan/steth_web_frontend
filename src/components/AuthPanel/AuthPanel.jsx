import { useContext, useEffect } from "react"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { X } from "lucide-react"
import { AuthContext } from "../../pages/Login&Signup/AuthContext"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"
import VerifyOtpForm from "./VerifyOtpForm"

const AuthPanel = () => {
  const { authPanel, closeAuthPanel } = useContext(AuthContext)
  const { isOpen, mode, meta } = authPanel

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAuthPanel()
    }
    window.addEventListener("keydown", handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, closeAuthPanel])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            key="auth-panel-backdrop"
            className="fixed inset-0 bg-black/50 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeAuthPanel}
          />
          <Motion.div
            key="auth-panel"
            className="fixed inset-y-0 left-0 z-[10001] w-full sm:max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
          >
            {/* Header bar matching CartDrawer/AccountOverlay's px-4 py-4
                border-b treatment - this panel previously had the close
                button floating absolutely over the content with no header
                row at all, the one real structural difference between the
                three slide-overs. Each form below keeps its own richer
                heading+subtitle in the content area; this bar just unifies
                the close-button's position/border, not the title text. */}
            <div className="flex items-center justify-end px-4 py-4 border-b border-gray-200">
              <button
                type="button"
                onClick={closeAuthPanel}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {mode === "login" && <LoginForm meta={meta} />}
            {mode === "signup" && <SignupForm meta={meta} />}
            {mode === "verify" && <VerifyOtpForm meta={meta} />}
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthPanel
