/**
 * Author(s): 1. Zainab Raza
 * Description: The "ways to earn" grid on the rewards page - one card per
 *              reward, matching the programme layout we were briefed on.
 *
 *              Renders straight from the backend catalogue
 *              (GET /api/rewards/catalogue) rather than a hardcoded list, so
 *              the point values shown to customers can never drift from the
 *              values the engine actually pays. They are still provisional
 *              pending business sign-off, which is exactly why this component
 *              does not restate them anywhere in its own source.
 *
 *              Signed-out visitors see the full catalogue as a marketing
 *              grid. Signed-in customers additionally see what they have
 *              already earned, and get a Claim button on the self-declared
 *              rewards (social follows and subscriptions).
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - rendered by src/pages/Rewards/Rewards.jsx
 */

import { useState } from "react"
import { API_BASE_URL } from "../../config/api"

// Rules the customer confirms themselves need a "did you actually do it?"
// step. Social follows just confirm; WhatsApp needs a number to message.
const NEEDS_WHATSAPP_NUMBER = "SUBSCRIBE_WHATSAPP"

const CATEGORY_LABELS = {
  engagement: "Get involved",
  celebration: "On us",
  purchase: "When you shop",
}

const WaysToEarn = ({ rules, isLoggedIn, onClaimed, openAuthPanel }) => {
  const [claiming, setClaiming] = useState(null)
  const [claimError, setClaimError] = useState("")
  const [whatsappFor, setWhatsappFor] = useState(null)
  const [whatsappNumber, setWhatsappNumber] = useState("")

  const claim = async (ruleKey, extra = {}) => {
    setClaiming(ruleKey)
    setClaimError("")

    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_BASE_URL}/api/rewards/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ruleKey, ...extra }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not claim that reward")
      }

      setWhatsappFor(null)
      setWhatsappNumber("")
      // Let the page refetch rather than patching state locally - the balance
      // and history both change, and the server is the source of truth.
      onClaimed()
    } catch (err) {
      setClaimError(err.message)
    } finally {
      setClaiming(null)
    }
  }

  const handleClaimClick = (rule) => {
    if (!isLoggedIn) {
      openAuthPanel("login")
      return
    }
    if (rule.key === NEEDS_WHATSAPP_NUMBER) {
      setWhatsappFor(rule.key)
      return
    }
    claim(rule.key)
  }

  // Group by category so the grid reads in sections rather than as one long
  // undifferentiated wall of cards.
  const grouped = rules.reduce((acc, rule) => {
    const key = rule.category || "engagement"
    acc[key] = acc[key] || []
    acc[key].push(rule)
    return acc
  }, {})

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
        Ways to Earn
      </h2>
      <p className="text-gray-500 text-center mb-10">
        Every point counts toward your next order.
      </p>

      {claimError && (
        <div className="max-w-xl mx-auto mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
          {claimError}
        </div>
      )}

      {Object.entries(grouped).map(([category, categoryRules]) => (
        <div key={category} className="mb-12">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            {CATEGORY_LABELS[category] || category}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryRules.map((rule) => {
              const earned = rule.timesEarned > 0
              // Both payloads carry `claimable`, and it already means the
              // right thing in each: the public catalogue sets it for every
              // self-declared reward, and /me narrows it to ones this
              // customer has not claimed yet. So there is nothing to work out
              // here - trust it, and let signed-out clicks route to sign-in.
              const showClaimButton = rule.claimable === true

              return (
                <div
                  key={rule.key}
                  className="border border-gray-200 rounded-2xl p-6 flex flex-col hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-gray-900">{rule.label}</p>
                    {earned && (
                      <span className="shrink-0 rounded-full bg-green-100 text-green-800 text-xs font-medium px-2 py-1">
                        {rule.timesEarned > 1 ? `x${rule.timesEarned}` : "Earned"}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 flex-grow">{rule.description}</p>

                  <p className="text-lg font-bold text-gray-900 mt-4">
                    {rule.points} Points
                  </p>

                  {/* Birthday cannot pay out until we know the date, so say so
                      instead of showing a reward that silently never lands. */}
                  {rule.blockedBy === "dateOfBirth" && (
                    <p className="text-xs text-amber-700 mt-2">
                      Add your birthday below to unlock this.
                    </p>
                  )}

                  {whatsappFor === rule.key ? (
                    <div className="mt-4">
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <button
                        onClick={() => claim(rule.key, { whatsappNumber })}
                        disabled={claiming === rule.key || !whatsappNumber.trim()}
                        className="w-full bg-black text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
                      >
                        {claiming === rule.key ? "Subscribing..." : "Subscribe"}
                      </button>
                    </div>
                  ) : showClaimButton ? (
                    // Signed-out visitors get the same button; clicking it
                    // opens sign-in, so the grid stays a working call to
                    // action rather than a read-only poster.
                    <button
                      onClick={() => handleClaimClick(rule)}
                      disabled={claiming === rule.key}
                      className="mt-4 w-full border border-black text-black rounded-md px-4 py-2 text-sm font-medium hover:bg-black hover:text-white disabled:opacity-40 transition-colors"
                    >
                      {claiming === rule.key ? "Claiming..." : "Claim"}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

export default WaysToEarn
