/**
 * Author(s): 1. Hanzala B. Rehan
 *            2. Zainab Raza
 * Description: The customer-facing rewards page, laid out to the programme
 *              design: a "How It Works" explainer, the signed-in points header
 *              and activity table, and the "How To Earn Points" grid.
 *
 *              Signed-out visitors get the explainer and the full earn grid so
 *              the page still works as a marketing page - clicking any reward
 *              prompts them to join. Signed-in customers additionally get
 *              their balance, expiry date, activity history and the ability to
 *              claim the rewards they self-declare.
 *
 *              Loading the page calls GET /api/rewards/me, which re-derives
 *              purchase and celebration rewards and sweeps expired points
 *              server-side. That is why a customer who qualified for something
 *              before the programme launched sees it credited the moment they
 *              land here.
 *
 * Date created: July 2026
 * Edit(s):
 *   (1): Replaced the balance-only shell with the full programme UI - ways to
 *        earn, claiming, birthday capture and points history - now that the
 *        rewards backend exists.
 *   (2): Rebuilt to the programme design: How It Works band, points header
 *        with expiry date, activity table, and the icon-led earn grid.
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - routed at /rewards by src/router/Router.jsx
 */

import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import RewardsCTA from "../../components/DiscountOffers"
import HowItWorks from "./HowItWorks"
import PointsActivity from "./PointsActivity"
import WaysToEarn from "./WaysToEarn"
import { AuthContext } from "../Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

// fetch() waits indefinitely by default, so a backend that accepts the
// connection and then stalls leaves the page on "Loading..." forever with no
// way out. Abort well before a customer would give up and reload.
const REQUEST_TIMEOUT_MS = 15000

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * A timed-out request and a failed one need different wording - "try again"
 * is useful advice for the first and useless for the second.
 */
const timeoutAwareMessage = (error, fallback) =>
  error.name === "AbortError"
    ? "Rewards are taking longer than usual to load. Please try again."
    : fallback

const Rewards = () => {
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const [rewards, setRewards] = useState(null)
  const [catalogue, setCatalogue] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showBirthdayPrompt, setShowBirthdayPrompt] = useState(false)
  const [birthday, setBirthday] = useState("")
  const [birthdayMessage, setBirthdayMessage] = useState("")
  const activityRef = useRef(null)

  // Loads the page in two independent steps.
  //
  // The order matters: the "ways to earn" grid is the page's main content and
  // must not depend on the personalised call succeeding. Fetching both in one
  // try block meant a rejected /me - an expired token, a cold backend - threw
  // before the catalogue was ever stored, so a signed-in customer whose token
  // had gone stale lost the entire grid as well as their balance.
  const load = useCallback(async () => {
    setError("")
    const token = localStorage.getItem("accessToken")

    // Step 1: the public catalogue. Always runs, for everyone.
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/rewards/catalogue`)
      if (!res.ok) throw new Error("Failed to load rewards")
      const data = await res.json()
      setCatalogue(data.data.rules)
    } catch (err) {
      setError(timeoutAwareMessage(err, "Failed to load rewards"))
    }

    if (!isLoggedIn || !token) {
      setRewards(null)
      setIsLoading(false)
      return
    }

    // Step 2: the customer's own balance and history. A failure here costs
    // them the balance, never the grid.
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/api/rewards/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Signed in as far as the app is concerned, but the API rejected the
      // token. Show the signed-out view - an "authentication failed" error is
      // something the customer can't act on.
      if (res.status === 401) {
        setRewards(null)
        return
      }

      if (!res.ok) throw new Error("We couldn't load your points just now")
      const data = await res.json()
      setRewards(data.data)
      // Richer than the public catalogue - carries earned state per rule.
      setCatalogue(data.data.rules)
    } catch (err) {
      setRewards(null)
      setError(timeoutAwareMessage(err, "We couldn't load your points just now"))
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    setIsLoading(true)
    load()
  }, [load])

  const saveBirthday = async (e) => {
    e.preventDefault()
    setBirthdayMessage("")

    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_BASE_URL}/api/rewards/birthday`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dateOfBirth: birthday }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Could not save your birthday")

      setBirthdayMessage(data.message)
      await load()
      setShowBirthdayPrompt(false)
      // Send them to the table, where the points they just earned now appear.
      if (activityRef.current) {
        activityRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } catch (err) {
      setBirthdayMessage(err.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow">
        <HowItWorks />

        {isLoggedIn && (
          <div ref={activityRef}>
            {isLoading ? (
              <p className="text-center text-gray-500 py-12">Loading your rewards...</p>
            ) : error ? (
              <div className="max-w-xl mx-auto my-12 bg-red-50 rounded-2xl p-6 border border-red-200 text-center text-red-700">
                {error}
              </div>
            ) : (
              rewards && <PointsActivity rewards={rewards} />
            )}
          </div>
        )}

        {catalogue.length > 0 && (
          <WaysToEarn
            rules={catalogue}
            isLoggedIn={isLoggedIn}
            onClaimed={load}
            openAuthPanel={openAuthPanel}
            onBirthdayClick={() => setShowBirthdayPrompt(true)}
          />
        )}

        {/* Full-width, not nested in a narrow column - matches how this
            component renders on Homepage/WomenPage/MensPage. */}
        <RewardsCTA />
      </main>
      <Footer />

      {showBirthdayPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={saveBirthday}
            className="bg-white rounded-2xl w-full max-w-sm p-8 relative"
          >
            <button
              type="button"
              onClick={() => setShowBirthdayPrompt(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Celebrate your birthday
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Tell us the date and we will send you points every year. You can
              only set this once.
            </p>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="submit"
              className="w-full bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              Save
            </button>
            {birthdayMessage && (
              <p className="text-sm text-gray-600 mt-4 text-center">{birthdayMessage}</p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

export default Rewards
