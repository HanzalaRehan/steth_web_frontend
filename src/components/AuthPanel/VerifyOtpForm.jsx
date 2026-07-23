import { useState, useEffect, useRef, useContext } from "react"
import { ArrowRight, Mail } from "lucide-react"
import { AuthContext } from "../../pages/Login&Signup/AuthContext"
import { API_BASE_URL } from "../../config/api"

const VerifyOtpForm = ({ meta }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState(120)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef([])
  const { openAuthPanel } = useContext(AuthContext)
  const email = meta?.email

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete verification code")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Verification failed")
      }

      setSuccessMessage("Email verified! Redirecting to login...")
      setTimeout(() => {
        openAuthPanel("login", { email })
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP")
      }

      setTimeLeft(120)
      setCanResend(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl md:text-3xl font-bold">Verify your email</h2>
      <p className="mt-2 text-gray-500 text-sm md:text-base flex items-center">
        <Mail size={16} className="mr-2" />
        We sent a code to {email}
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => {
                const newOtp = [...otp]
                newOtp[index] = e.target.value
                setOtp(newOtp)
                if (e.target.value && index < 5) {
                  inputRefs.current[index + 1].focus()
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit && index > 0) {
                  inputRefs.current[index - 1].focus()
                }
              }}
              className="w-11 h-11 text-center text-lg bg-white text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
        >
          {isLoading ? "Verifying..." : (
            <>
              Verify
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {canResend ? "Code expired" : `Resend code in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`}
          </div>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend}
            className={`text-sm font-medium ${canResend ? "text-black hover:text-gray-700" : "text-gray-400 cursor-not-allowed"}`}
          >
            Resend code
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => openAuthPanel("login", { email })}
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back to login
        </button>
      </div>
    </div>
  )
}

export default VerifyOtpForm
