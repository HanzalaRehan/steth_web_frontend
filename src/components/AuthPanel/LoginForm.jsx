import { useState, useEffect, useContext } from "react"
import { Eye, EyeOff, ArrowRight, Mail, Lock, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../pages/Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

const GOOGLE_CLIENT_ID = "6304398994-dgvpsh05hj0qkngmu002kr2q5e0ch7dq.apps.googleusercontent.com"

const LoginForm = ({ meta }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [usernameOrEmail, setUsernameOrEmail] = useState(meta?.email || "")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)

  const { setIsLoggedIn, login, openAuthPanel, closeAuthPanel } = useContext(AuthContext)
  const navigate = useNavigate()

  const redirectAfterLogin = () => {
    closeAuthPanel()
    if (meta?.from === "/cart") {
      navigate("/checkout")
    } else {
      navigate(meta?.from || "/")
    }
  }

  // Load Google Identity Services script once, then render the standard
  // button only - no One Tap prompt() (dropped per your decision, since the
  // panel can now open repeatedly per page load instead of via fresh mounts).
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

        window.google.accounts.id.renderButton(document.getElementById("googleSignInDivLogin"), {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
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

      login(data.accessToken)

      if (data.role === "admin") {
        closeAuthPanel()
        navigate("/admin")
      } else {
        redirectAfterLogin()
      }
    } catch (err) {
      console.error("Google authentication error:", err)
      setError("Failed to authenticate with Google. Please try again.")
      setIsLoggedIn(false)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    if (!usernameOrEmail || !password) {
      setError("Fill all fields")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Unverified account - the backend sends {message, email}. Route
        // straight into OTP verification instead of leaving the admin
        // stuck reading a red error banner (this is A6's frontend wiring).
        if (response.status === 403 && data.email) {
          openAuthPanel("verify", { email: data.email })
          return
        }
        throw new Error(data.message || "Login failed")
      }

      login(data.accessToken)

      if (data.role === "admin") {
        closeAuthPanel()
        navigate("/admin")
      } else {
        redirectAfterLogin()
      }
    } catch (err) {
      localStorage.removeItem("accessToken")
      setIsLoggedIn(false)
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!usernameOrEmail) {
      setError("Please enter your username or email first")
      return
    }

    setForgotPasswordLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/password-forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: usernameOrEmail }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP")
      }

      closeAuthPanel()
      navigate("/otp", { state: { email: usernameOrEmail } })
    } catch (err) {
      setError(err.message)
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl md:text-3xl font-bold">Welcome back</h2>
      <p className="mt-2 text-gray-500 text-sm md:text-base">Enter your credentials to access your account</p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center justify-between">
          <span className="text-sm md:text-base">{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center justify-between">
          <span className="text-sm md:text-base">{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="loginUsernameOrEmail" className="block text-sm font-medium text-gray-700">
            Username or Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              id="loginUsernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 bg-white rounded-md shadow-sm focus:ring-black focus:border-black text-gray-900"
              placeholder="username or email@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              className="text-xs font-medium text-black hover:text-gray-700"
            >
              {forgotPasswordLoading ? "Sending..." : "Forgot password?"}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="loginPassword"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
        >
          {isLoading ? "Signing in..." : (
            <>
              Sign in
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

        <div id="googleSignInDivLogin" className="w-full [&>div]:w-full" />

        {googleLoading && (
          <div className="w-full flex justify-center items-center h-[42px] px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white">
            Signing in with Google...
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => openAuthPanel("signup", meta)}
              className="font-medium text-black hover:text-gray-800"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
