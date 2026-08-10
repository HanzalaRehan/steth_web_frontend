/**
 * Author(s): 1. Hanzala B. Rehan
 *            2. Zainab Raza
 * Description: The customer-facing rewards page. Shows the points balance,
 *              the full "ways to earn" grid, and recent points history.
 *
 *              Reads from the loyalty programme API (/api/rewards). Signed-out
 *              visitors get the public catalogue so the page still works as a
 *              marketing page; signed-in customers get their balance, what
 *              they have already earned, and the ability to claim the
 *              self-declared rewards.
 *
 *              Opening the page calls GET /api/rewards/me, which re-derives
 *              purchase and celebration rewards server-side - so a customer
 *              who qualified for a milestone before the programme launched
 *              sees it credited the moment they land here.
 *
 * Date created: July 2026
 * Edit(s):
 *   (1): Replaced the balance-only shell with the full programme UI - ways to
 *        earn, claiming, birthday capture and points history - now that the
 *        rewards backend exists.
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - routed at /rewards by src/router/Router.jsx
 */

import { useCallback, useContext, useEffect, useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import RewardsCTA from "../../components/DiscountOffers"
import WaysToEarn from "./WaysToEarn"
import { AuthContext } from "../Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

const Rewards = () => {
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const [rewards, setRewards] = useState(null)
  const [catalogue, setCatalogue] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [birthday, setBirthday] = useState("")
  const [birthdayMessage, setBirthdayMessage] = useState("")

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
      load()
    } catch (err) {
      setBirthdayMessage(err.message)
    }
  }

  // Only prompt for a birthday when the backend says it is what's blocking
  // the reward - never ask for a date we already hold.
  const needsBirthday = Boolean(
    rewards && rewards.rules.some((rule) => rule.blockedBy === "dateOfBirth")
  )

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto py-16 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Loyalty & Rewards
          </h1>

          {!isLoggedIn ? (
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center">
              <p className="text-gray-600 mb-4">
                Sign in to see your points balance and start earning.
              </p>
              <button
                onClick={() => openAuthPanel("login")}
                className="bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                Log In
              </button>
            </div>
          ) : isLoading ? (
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 text-center text-gray-500">
              Loading your rewards...
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center text-red-700">
              {error}
            </div>
          ) : (
            <>
              {/* DESIGN.md's one documented dark-surface pattern (same #0B132B
                  tone as DiscountOffers.jsx's cards below). */}
              <div className="bg-[#0B132B] rounded-2xl p-8 text-center text-white">
                <p className="text-sm text-gray-300 mb-1">Your Points Balance</p>
                <p className="text-5xl font-bold text-white">{rewards?.balance ?? 0}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {rewards?.lifetimeEarned ?? 0} points earned all time
                </p>
              </div>

              {/* Points credited by the sync that just ran on page load. */}
              {rewards?.pointsJustAwarded > 0 && (
                <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-center text-green-800 text-sm">
                  You just earned {rewards.pointsJustAwarded} points!
                </div>
              )}

              {needsBirthday && (
                <form
                  onSubmit={saveBirthday}
                  className="mt-6 rounded-2xl border border-gray-200 p-6"
                >
                  <p className="font-semibold text-gray-900 mb-1">
                    Tell us your birthday
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    We will send you points every year. You can only set this once.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      required
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white rounded-md px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                  {birthdayMessage && (
                    <p className="text-sm text-gray-600 mt-3">{birthdayMessage}</p>
                  )}
                </form>
              )}

              {rewards?.history?.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Recent activity
                  </h2>
                  <ul className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                    {rewards.history.map((entry, index) => (
                      <li
                        key={`${entry.ruleKey}-${index}`}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div>
                          <p className="text-sm text-gray-900">{entry.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.awardedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-700">
                          +{entry.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {catalogue.length > 0 && (
          <WaysToEarn
            rules={catalogue}
            isLoggedIn={isLoggedIn}
            onClaimed={load}
            openAuthPanel={openAuthPanel}
          />
        )}

        {/* Full-width, not nested in the max-w-2xl column above - matches
            how this component actually renders on Homepage/WomenPage/
            MensPage (its own py-16 + container mx-auto px-4). */}
        <RewardsCTA />
      </main>
      <Footer />
    </div>
  )
}

export default Rewards
