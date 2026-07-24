import { useContext, useEffect, useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { AuthContext } from "../Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

// Issue #22 - shell only. Program rules (earn rate, redemption options,
// tiers) are explicitly TBD per the master plan and the session brief -
// nothing here invents numbers. The "How It Works" copy below is a
// deliberately generic placeholder pending real copy from the business
// side; do not fill in a rate or redemption value without being told one.
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
      <main className="flex-grow py-16 px-4">
        <div className="max-w-2xl mx-auto">
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
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Your Points Balance</p>
                <p className="text-5xl font-bold text-black">{profile?.rewardPoints ?? 0}</p>
              </div>

              {profile?.firstOrderPlaced && (
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    First order complete
                  </span>
                </div>
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

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
            {/* Placeholder copy - deliberately generic, no earn rate or
                redemption value stated. Replace once real program rules
                are provided; anything specific written here would look
                official to a customer. */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-gray-600 space-y-2">
              <p>Every account earns reward points on purchases automatically.</p>
              <p>Redemption options are being finalized and will appear here soon.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Rewards
