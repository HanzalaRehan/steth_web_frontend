/**
 * Author(s): 1. Zainab Raza
 * Description: The standalone "Take Our Sizing Quiz" page at /size-quiz - the
 *              rewards-linked entry point to the size recommendation feature.
 *
 *              Same engine and same modal as the "What's My Size?" button on
 *              a product page; the difference is that this one requires a
 *              sign-in, saves the result to the customer's size profile and
 *              pays loyalty points the first time it is completed. That split
 *              mirrors the backend exactly (POST /api/size/quiz vs
 *              /api/size/recommend), so there is one set of sizing logic
 *              rather than two that can drift.
 *
 *              Signed-out visitors get the pitch and a sign-in prompt instead
 *              of the quiz, since the points cannot be credited to nobody.
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - routed at /size-quiz by src/router/Router.jsx
 */

import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import SizeFinder from "../../components/SizeFinder/SizeFinder"
import { AuthContext } from "../Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

const SizeQuiz = () => {
  const navigate = useNavigate()
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  // Show a returning customer the size we already have for them, rather than
  // asking the same questions as if we had never met.
  useEffect(() => {
    if (!isLoggedIn) return

    const token = localStorage.getItem("accessToken")
    if (!token) return

    fetch(`${API_BASE_URL}/api/size/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setProfile(data.data)
      })
      .catch(() => {
        // Non-critical - the quiz still works without the saved profile.
      })
  }, [isLoggedIn, isQuizOpen])

  const savedSize = profile?.latest?.recommendation?.recommendedSize
  // 'quiz' or 'whats-my-size' - the two entry points that share the engine.
  const savedFromQuiz = profile?.latest?.recommendation?.source === "quiz"

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Take Our Sizing Quiz
          </h1>
          <p className="text-gray-500 mb-8">
            A few quick questions and we'll find your size — and you'll earn
            reward points for it.
          </p>

          {savedSize && (
            <div className="bg-[#0B132B] rounded-2xl p-8 text-white mb-8">
              <p className="text-sm text-gray-300 mb-1">Your size</p>
              <p className="text-6xl font-bold">{savedSize}</p>

              {/* Say where this size came from. Without it, someone who used
                  "What's My Size?" on a product page arrives here, sees a size
                  already filled in, and reasonably assumes they have already
                  done the quiz - and never earns the points. */}
              <p className="text-sm text-gray-300 mt-3">
                {savedFromQuiz
                  ? "From your sizing quiz."
                  : "From “What’s My Size?” on a product page."}
              </p>

              {profile.quizCompleted ? (
                <p className="text-xs text-gray-400 mt-2">
                  You’ve already earned {profile.quizPointsAwarded} points for this
                  quiz. You can retake it any time — it just won’t pay again.
                </p>
              ) : (
                <p className="text-xs text-amber-300 mt-2">
                  You haven’t taken the quiz yet — take it to earn your points.
                </p>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <button
              onClick={() => setIsQuizOpen(true)}
              className="bg-black text-white rounded-md px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              {/* Keyed to whether the quiz was actually completed, not to
                  whether a size exists - a size from "What's My Size?" is not
                  a quiz, and calling it a retake would tell them they had
                  already earned points they have not. */}
              {profile?.quizCompleted ? "Retake the quiz" : "Start the quiz"}
            </button>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <p className="text-gray-600 mb-4">
                Sign in to take the quiz and collect your points.
              </p>
              <button
                onClick={() => openAuthPanel("login")}
                className="bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <SizeFinder
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        mode="quiz"
        // Sends them back to the rewards page, but only when they press the
        // button - the result stays on screen until they are done with it.
        onDone={() => {
          setIsQuizOpen(false)
          navigate("/rewards")
        }}
      />
    </div>
  )
}

export default SizeQuiz
