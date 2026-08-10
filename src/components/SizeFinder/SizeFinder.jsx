/**
 * Author(s): 1. Zainab Raza
 * Description: The "What's My Size?" / "Size Quiz" modal - one component
 *              serving both entry points, mirroring the backend where both
 *              run the same recommendation engine and differ only in whether
 *              the result is saved and points are awarded.
 *
 *                mode="whats-my-size" -> POST /api/size/recommend. Works for
 *                                        guests; saves automatically if the
 *                                        shopper happens to be signed in.
 *                mode="quiz"          -> POST /api/size/quiz. Requires sign-in
 *                                        and pays loyalty points once.
 *
 *              We ask for measurements but never require them: the backend
 *              falls back to a height/weight estimate, so the form stays
 *              answerable by someone without a tape measure. Whatever comes
 *              back, we show the single recommended size plus the engine's own
 *              explanation notes - including the "your measurements said S,
 *              but you wanted a looser fit, so we're recommending M" line,
 *              which is why baseSize is rendered alongside the recommendation
 *              rather than hidden.
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - rendered by DetailSection.jsx and SizeQuiz.jsx
 */

import { useState } from "react"
import { API_BASE_URL } from "../../config/api"

const EMPTY_FORM = {
  chest: "",
  waist: "",
  hip: "",
  heightInches: "",
  weightKg: "",
  fitPreference: "regular",
}

const FIELDS = [
  { name: "chest", label: "Chest", hint: "around the fullest part" },
  { name: "waist", label: "Waist", hint: "around your natural waist" },
  { name: "hip", label: "Hip", hint: "optional" },
]

const SizeFinder = ({ isOpen, onClose, mode = "whats-my-size", onSized }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const isQuiz = mode === "quiz"

  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))

  const reset = () => {
    setForm(EMPTY_FORM)
    setResult(null)
    setError("")
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      // Send only what was filled in - the backend decides which combinations
      // are usable, and empty strings would fail its numeric validation.
      const payload = Object.entries(form).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null) acc[key] = value
        return acc
      }, {})

      const token = localStorage.getItem("accessToken")
      const headers = { "Content-Type": "application/json" }
      // The quiz needs auth to pay out; the finder sends the token when there
      // is one purely so the result gets saved to the shopper's profile.
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/api/size/${isQuiz ? "quiz" : "recommend"}`,
        { method: "POST", headers, body: JSON.stringify(payload) }
      )
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "We couldn't work out your size")
      }

      setResult(data.data)
      if (onSized) onSized(data.data.recommendedSize)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">
            {isQuiz ? "Take Our Sizing Quiz" : "What's My Size?"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-black text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">We recommend</p>
            <p className="text-6xl font-bold text-gray-900 mb-4">
              {result.recommendedSize}
            </p>

            {/* The whole point of showing both: the shopper can see the chart
                answer and why we moved off it for their fit preference. */}
            {result.adjustedForFit && (
              <p className="text-sm text-gray-600 mb-4">
                Your measurements are a{" "}
                <span className="font-semibold">{result.baseSize}</span> — we
                sized up for the looser fit you asked for.
              </p>
            )}

            {result.notes?.length > 0 && (
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-5">
                {result.notes.map((note, index) => (
                  <li key={index} className="flex gap-2">
                    <span aria-hidden="true">→</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}

            {result.rewards?.pointsAwarded > 0 && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 mb-5">
                You earned {result.rewards.pointsAwarded} reward points!
              </div>
            )}

            {result.confidence === "low" && (
              <p className="text-xs text-gray-400 mb-4">
                Based on your height and weight. Add your measurements for a
                sharper match.
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm font-medium hover:border-black transition-colors"
              >
                Start over
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-black text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6">
            <p className="text-sm text-gray-500 mb-5">
              Fill in what you know — everything is optional, and we'll estimate
              the rest.
            </p>

            <div className="space-y-4">
              {FIELDS.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    {field.label}{" "}
                    <span className="font-normal text-gray-400">
                      (inches, {field.hint})
                    </span>
                  </label>
                  <input
                    id={field.name}
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={form[field.name]}
                    onChange={(e) => update(field.name, e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="heightInches"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Height{" "}
                    <span className="font-normal text-gray-400">(inches)</span>
                  </label>
                  <input
                    id="heightInches"
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={form.heightInches}
                    onChange={(e) => update("heightInches", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="weightKg"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    Weight{" "}
                    <span className="font-normal text-gray-400">(kg)</span>
                  </label>
                  <input
                    id="weightKg"
                    type="number"
                    step="0.5"
                    inputMode="decimal"
                    value={form.weightKg}
                    onChange={(e) => update("weightKg", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-900 mb-2">
                  How do you like it to fit?
                </legend>
                <div className="flex gap-3">
                  {[
                    { value: "regular", label: "True to size" },
                    { value: "loose", label: "Looser fit" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => update("fitPreference", option.value)}
                      className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${
                        form.fitPreference === option.value
                          ? "border-black bg-black text-white"
                          : "border-gray-300 text-gray-700 hover:border-black"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-black text-white rounded-md px-4 py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              {isSubmitting ? "Working it out..." : "Find my size"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default SizeFinder
