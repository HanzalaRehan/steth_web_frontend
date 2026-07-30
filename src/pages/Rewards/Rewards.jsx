import { useContext, useEffect, useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import RewardsCTA from "../../components/DiscountOffers"
import { AuthContext } from "../Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

// Issue #22, revisited for the storefront design-alignment session: the
// original shell avoided stating any earn-rate/redemption numbers here
// since the plan flagged them as TBD. They're not actually TBD anymore -
// DiscountOffers.jsx (rendered on Homepage/WomenPage/MensPage) already
// ships real, approved numbers for exactly this ("1 point = 1 PKR
// discount", 10% first order, 5% student). Reusing that component here
// (RewardsCTA) surfaces already-live, already-approved info on the one
// page a customer would most expect to find it, rather than inventing
// anything new.
const Rewards = () => {
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false)
      return
    }

    const token = localStorage.getItem("accessToken")
    if (!token) {
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to load your rewards")
        const data = await res.json()
        setProfile(data.user)
      } catch (err) {
        setError(err.message || "Failed to load your rewards")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [isLoggedIn])

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
                Sign in to see your reward points balance.
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
            // DESIGN.md's one documented dark-surface pattern (same #0B132B
            // tone as DiscountOffers.jsx's cards below) - the account's own
            // point balance gets the same "premium membership" treatment as
            // the program tiers, instead of a plain gray placeholder box.
            <div className="bg-[#0B132B] rounded-2xl p-8 text-center text-white">
              <p className="text-sm text-gray-300 mb-1">Your Points Balance</p>
              <p className="text-5xl font-bold text-white">{profile?.rewardPoints ?? 0}</p>

              {profile?.firstOrderPlaced && (
                <span className="inline-block mt-4 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  First order complete
                </span>
              )}

              {/*
                EXTENSION POINT (redemption mechanics, pending finalized
                program rules): once rules exist, a redemption UI - e.g.
                a "Redeem" button, a list of redemption options with point
                costs - goes here, wired to the backend redemption endpoint
                described in user.routes.js's own extension-point comment.
                Do not build this ahead of the rules being confirmed.
              */}
            </div>
          )}
        </div>

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
