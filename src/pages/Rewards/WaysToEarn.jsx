/**
 * Author(s): 1. Zainab Raza
 * Description: The "How To Earn Points" grid on the rewards page - one card
 *              per reward, laid out to match the programme design we were
 *              given (icon, name, point value, action arrow).
 *
 *              Renders from the backend catalogue (GET /api/rewards/catalogue
 *              signed out, GET /api/rewards/me signed in) rather than a
 *              hardcoded list, so the point values shown to customers can
 *              never drift from what the engine actually pays. They are still
 *              provisional pending business sign-off, which is why this file
 *              states no numbers of its own.
 *
 *              Interaction rules, which differ by sign-in state:
 *
 *                Signed out - every card is clickable, and any click opens the
 *                             "join the programme" prompt. The grid works as a
 *                             marketing page that always leads to sign-up.
 *
 *                Signed in  - only rewards the customer can actually action
 *                             are clickable: the ones they self-declare
 *                             (social follows, email/WhatsApp opt-ins) plus
 *                             the birthday, which opens a date prompt. Rewards
 *                             that are earned automatically from orders and
 *                             reviews are shown but inert - no pointer cursor,
 *                             because there is nothing to click.
 *
 *                Earned     - dimmed and inert, whatever their type, so the
 *                             page reads at a glance as "done" vs "still
 *                             available".
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): Rebuilt to the programme design - icons, point values, action
 *        arrows, sign-in-aware click behaviour and the join prompt.
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - rendered by src/pages/Rewards/Rewards.jsx
 */

import { useState } from "react"
import {
  ArrowRight,
  Award,
  Cake,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MessageCircle,
  MessageSquare,
  Music2,
  Ruler,
  ShoppingBag,
  UserPlus,
  X,
} from "lucide-react"
import { API_BASE_URL } from "../../config/api"

// One icon per reward, keyed by the catalogue's stable rule keys.
const RULE_ICONS = {
  SIGN_UP: UserPlus,
  SUBSCRIBE_EMAIL: Mail,
  SUBSCRIBE_WHATSAPP: MessageCircle,
  FOLLOW_FACEBOOK: Facebook,
  FOLLOW_INSTAGRAM: Instagram,
  FOLLOW_TIKTOK: Music2,
  SIZING_QUIZ: Ruler,
  PRODUCT_REVIEW: MessageSquare,
  BIRTHDAY: Cake,
  LOYALTY_ANNIVERSARY: Award,
  HIGH_VALUE_ORDER: ShoppingBag,
  SECOND_ORDER: ShoppingBag,
  SECOND_ORDER_FAST: Clock,
  ORDER_COUNT_MILESTONE: ShoppingBag,
  RECURRING_PURCHASE: ShoppingBag,
}

const WaysToEarn = ({ rules, isLoggedIn, onClaimed, openAuthPanel, onBirthdayClick }) => {
  const [claiming, setClaiming] = useState(null)
  const [message, setMessage] = useState(null)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false)
  const [whatsappFor, setWhatsappFor] = useState(null)
  const [whatsappNumber, setWhatsappNumber] = useState("")

  const claim = async (ruleKey, extra = {}) => {
    setClaiming(ruleKey)
    setMessage(null)

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
      if (!res.ok || !data.success) throw new Error(data.message || "Could not claim that reward")

      setWhatsappFor(null)
      setWhatsappNumber("")
      setMessage({ tone: "success", text: data.message })
      // Refetch rather than patching locally - the balance, the card's earned
      // state and the activity table all change together.
      onClaimed()
    } catch (err) {
      setMessage({ tone: "error", text: err.message })
    } finally {
      setClaiming(null)
    }
  }

  /**
   * Whether this card responds to a click at all, and what happens if it does.
   * Signed-out visitors can click anything (it leads to sign-up); signed-in
   * customers can only click what they can actually action.
   */
  const getAction = (rule) => {
    if (!isLoggedIn) return "join"
    // `available` is the backend's own "can this be earned right now?" - it
    // already accounts for cadence, so a one-time reward is spent forever
    // while an annual one reopens next year. Checking it here rather than
    // re-deriving from cadence keeps the two in step.
    if (rule.available === false) return null
    if (rule.key === "BIRTHDAY" && rule.blockedBy === "dateOfBirth") return "birthday"
    if (rule.claimable) return rule.key === "SUBSCRIBE_WHATSAPP" ? "whatsapp" : "claim"
    return null
  }

  /**
   * "Done" styling: earned, and not earnable again right now. Covers annual
   * rewards already collected this year as well as one-time ones, while
   * repeatable rewards (orders, reviews) never dim.
   */
  const isEarnedOut = (rule) => rule.timesEarned > 0 && rule.available === false

  const handleClick = (rule) => {
    const action = getAction(rule)
    if (!action) return

    if (action === "join") setShowJoinPrompt(true)
    else if (action === "birthday") onBirthdayClick()
    else if (action === "whatsapp") setWhatsappFor(rule.key)
    else {
      // Social rewards carry the profile they're paying the customer to
      // follow. Open it first, so the click actually performs the action
      // rather than just collecting points for nothing. Opened before the
      // claim, and synchronously inside the click handler, or the browser
      // treats it as an unrequested popup and blocks it.
      if (rule.actionUrl) {
        window.open(rule.actionUrl, "_blank", "noopener,noreferrer")
      }
      claim(rule.key)
    }
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 text-center tracking-tight">
          HOW TO EARN POINTS
        </h2>
        <p className="text-gray-500 text-center mb-12">
          Earn points every time you stock up on Steth essentials.
        </p>

        {message && (
          <div
            className={`max-w-xl mx-auto mb-8 rounded-lg px-4 py-3 text-sm text-center border ${
              message.tone === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
          {rules.map((rule) => {
            const Icon = RULE_ICONS[rule.key] || Award
            const action = getAction(rule)
            const isInteractive = Boolean(action)
            const isDone = isEarnedOut(rule)

            return (
              <div
                key={rule.key}
                onClick={() => handleClick(rule)}
                onKeyDown={(e) => {
                  if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    handleClick(rule)
                  }
                }}
                role={isInteractive ? "button" : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-disabled={!isInteractive}
                className={`text-center transition-opacity ${
                  isDone ? "opacity-40" : ""
                } ${
                  isInteractive
                    ? "cursor-pointer hover:opacity-70"
                    : "cursor-default"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full border border-gray-900 flex items-center justify-center">
                    <Icon size={26} strokeWidth={1.5} className="text-gray-900" />
                  </div>
                </div>

                <p className="font-semibold text-gray-900 leading-snug mb-1">
                  {rule.label}
                </p>
                <p className="text-gray-600 text-sm mb-3">{rule.points} Points</p>

                {/* The action arrow only appears on cards that do something,
                    so the grid never invites a click that goes nowhere. */}
                {isInteractive && (
                  <div className="flex justify-center">
                    {claiming === rule.key ? (
                      <span className="text-xs text-gray-500">Claiming...</span>
                    ) : (
                      <span className="w-7 h-7 rounded-full border border-gray-900 flex items-center justify-center">
                        <ArrowRight size={14} className="text-gray-900" />
                      </span>
                    )}
                  </div>
                )}

                {isDone && (
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Earned
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Signed-out click target: one prompt for the whole grid. */}
      {showJoinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center relative">
            <button
              onClick={() => setShowJoinPrompt(false)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Sign up for rewards
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Create an account to start collecting points on every order.
            </p>
            <button
              onClick={() => {
                setShowJoinPrompt(false)
                openAuthPanel("signup")
              }}
              className="w-full bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 transition-colors mb-3"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setShowJoinPrompt(false)
                openAuthPanel("login")
              }}
              className="w-full border border-gray-300 rounded-md px-6 py-3 font-medium text-gray-700 hover:border-black transition-colors"
            >
              I already have an account
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp is the one claim that needs an input before it can be paid. */}
      {whatsappFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 relative">
            <button
              onClick={() => setWhatsappFor(null)}
              aria-label="Close"
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Subscribe on WhatsApp
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              We will send order updates and early access to your number.
            </p>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              onClick={() => claim(whatsappFor, { whatsappNumber })}
              disabled={claiming === whatsappFor || !whatsappNumber.trim()}
              className="w-full bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              {claiming === whatsappFor ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default WaysToEarn
