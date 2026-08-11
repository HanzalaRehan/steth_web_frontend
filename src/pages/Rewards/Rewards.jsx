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

  // Signed in: the personalised payload (balance + per-rule status + history).
  // Signed out: the public catalogue, so the grid still renders.
  const load = useCallback(async () => {
    setError("")

    try {
      const token = localStorage.getItem("accessToken")

      if (!isLoggedIn || !token) {
        const res = await fetch(`${API_BASE_URL}/api/rewards/catalogue`)
        if (!res.ok) throw new Error("Failed to load rewards")
        const data = await res.json()
        setCatalogue(data.data.rules)
        setRewards(null)
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/rewards/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to load your rewards")
      const data = await res.json()
      setRewards(data.data)
      setCatalogue(data.data.rules)
    } catch (err) {
      setError(err.message || "Failed to load your rewards")
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
