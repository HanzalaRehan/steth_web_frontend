import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence, motion as Motion } from "framer-motion"

const STORAGE_KEY = "steth_gender_prompt_seen"

// First-visit "who are you shopping for" prompt, inspired by jaanuu.com's
// own gender-select modal (minus its discount mechanic - this is purely a
// shopping-preference shortcut). Framer Motion per CLAUDE.md's convention
// of reserving it for overlay/slide-over UI, matching the same
// backdrop+panel shell as AuthPanel/CartDrawer/AccountOverlay.
const GenderQuickSelect = ({ onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === "undefined") return
    const alreadySeen = window.localStorage.getItem(STORAGE_KEY)
    if (!alreadySeen) {
      setIsOpen(true)
    } else {
      onDismiss()
    }
  }, [onDismiss])

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "true")
    setIsOpen(false)
    onDismiss()
  }

  const choose = (path) => {
    window.localStorage.setItem(STORAGE_KEY, "true")
    setIsOpen(false)
    onDismiss()
    if (path) navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            key="gender-select-backdrop"
            className="fixed inset-0 bg-black/50 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
          />
          {/* The centering shell must itself be a Motion component (not a
              plain <div>) - AnimatePresence only defers unmounting for its
              own direct children, so a plain wrapper here would strip the
              nested panel's exit animation and let it disappear mid-fade,
              overlapping whatever renders next (e.g. RegistrationPopup). */}
          <Motion.div
            key="gender-select-panel"
            className="fixed inset-0 z-[10001] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Motion.div
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            >
              <div className="px-8 py-10 text-center">
                <h2 className="text-2xl font-bold text-black mb-2">Welcome to STETH</h2>
                <p className="text-gray-600 mb-8">Who are you shopping for?</p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => choose("/women")}
                    className="bg-black text-white rounded-md py-3 font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
                  >
                    Shop Women
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("/men")}
                    className="bg-black text-white rounded-md py-3 font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
                  >
                    Shop Men
                  </button>
                  <button
                    type="button"
                    onClick={() => choose(null)}
                    className="border border-gray-300 text-black rounded-md py-3 font-medium uppercase tracking-wide hover:bg-gray-100 transition-colors"
                  >
                    Shop All
                  </button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GenderQuickSelect
