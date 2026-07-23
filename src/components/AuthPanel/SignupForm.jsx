import { useState, useEffect, useContext } from "react"
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../pages/Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

const GOOGLE_CLIENT_ID = "6304398994-dgvpsh05hj0qkngmu002kr2q5e0ch7dq.apps.googleusercontent.com"

const SignupForm = ({ meta }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)

  const { login, openAuthPanel, closeAuthPanel } = useContext(AuthContext)
  const navigate = useNavigate()

  // Same script-reuse pattern as LoginForm - no One Tap prompt().
  useEffect(() => {
    const initializeGoogleLogin = () => {
      if (!window.google) return
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: "popup",
        })

        window.google.accounts.id.renderButton(document.getElementById("googleSignInDivSignup"), {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "rectangular",
          width: "100%",
          logo_alignment: "left",
        })
      } catch (err) {
        console.error("Failed to initialize Google Sign-In:", err)
      }
    }

    if (document.getElementById("google-oauth")) {
      if (window.google) initializeGoogleLogin()
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.id = "google-oauth"
    script.async = true
    script.defer = true
    script.onload = initializeGoogleLogin
    script.onerror = () => {
      console.error("Failed to load Google OAuth script")
      setError("Google Sign-In is currently unavailable")
    }
    document.body.appendChild(script)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGoogleResponse = async (response) => {
    try {
      setGoogleLoading(true)

      const result = await fetch(`${API_BASE_URL}/api/users/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      })

      const data = await result.json()
      if (!result.ok) {
        throw new Error(data.message || "Google authentication failed")
      }

      // Google-authenticated accounts are pre-verified server-side, so this
      // always goes through login() (unlike the old SignUp.jsx, which wrote
      // localStorage directly and never updated AuthContext).
      login(data.accessToken)
      closeAuthPanel()
      navigate(meta?.from === "/cart" ? "/checkout" : meta?.from || "/")
    } catch (err) {
      console.error("Google authentication error:", err)
      setError(err.message || "Failed to authenticate with Google. Please try again.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!username || !email || !password || !confirmPassword) {
      setError("Fill all fields")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // A6 wiring: registration sends an OTP server-side and leaves the
      // account unverified - route straight into verification instead of
      // the old behavior (redirect to /login with no way to confirm).
      openAuthPanel("verify", { email: data.email || email })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl md:text-3xl font-bold">Create an account</h2>
      <p className="mt-2 text-gray-500 text-sm md:text-base">Fill in the form to get started</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center justify-between">
          <span className="text-sm md:text-base">{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="signupUsername" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              id="signupUsername"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-sm border bg-white border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-gray-900"
              placeholder="johndoe"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              id="signupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:ring-black focus:border-black text-gray-900"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 text-sm border bg-white border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-gray-900"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="signupConfirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="signupConfirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 text-sm border bg-white border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black text-gray-900"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} className="text-gray-400 hover:text-gray-500" />
              ) : (
                <Eye size={18} className="text-gray-400 hover:text-gray-500" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
        >
          {isLoading ? "Creating account..." : (
            <>
              Create account
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div id="googleSignInDivSignup" className="w-full [&>div]:w-full" />

        {googleLoading && (
          <div className="w-full flex justify-center items-center h-[42px] px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white">
            Signing up with Google...
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => openAuthPanel("login", meta)}
            className="font-medium text-black hover:text-gray-800"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupForm
