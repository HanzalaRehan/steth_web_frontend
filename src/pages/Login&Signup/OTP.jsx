"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import Header from "../../components/Header"
import { API_BASE_URL } from "../../config/api"

const OTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [timeLeft, setTimeLeft] = useState(120)
  const [canResend, setCanResend] = useState(false)

  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const inputRefs = useRef([])
  const buttonRef = useRef(null)
  const timerRef = useRef(null)
  const errorRef = useRef(null)
  const successRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  // Get email from location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      // If no email in state, redirect back to login
      navigate("/login")
    }
  }, [location.state, navigate])

  // Initialize animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
      gsap.fromTo(
        [titleRef.current, descriptionRef.current],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" },
      )
      gsap.fromTo(
        inputRefs.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: "power2.out" },
      )
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.7, ease: "power2.out" },
      )
    })

    return () => ctx.revert()
  }, [])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
  }, [timeLeft, canResend])

  // Error animation
  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
    }
  }, [error])

  // Success animation
  useEffect(() => {
    if (successMessage && successRef.current) {
      gsap.fromTo(successRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 })
    }
  }, [successMessage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      setError("Please enter the complete verification code")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp.join("")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Save resetToken to localStorage
      localStorage.setItem('resetToken', data.resetToken);

      setSuccessMessage("OTP verified successfully! Redirecting to password recovery...");
      
      // Wait for 2 seconds before redirecting to password recovery page
      setTimeout(() => {
        navigate("/password-recovery", { state: { email } });
      }, 2000);

    } catch (err) {
      setError(err.message);
      // Shake animation for error
      gsap.to(inputRefs.current, {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: "power2.inOut",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // Reset timer to 2 minutes and disable resend button
      setTimeLeft(120)
      setCanResend(false)

      // Success animation
      gsap.to(timerRef.current, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      })

    } catch (err) {
      setError(err.message);
    }
  }

  const handleGoBack = () => {
    navigate("/login");
  }

  return (
    <div className="min-h-screen w-screen flex-col items-center justify-center bg-gray-50">
      <Header/>
      <div className="flex items-center justify-center bg-gray-50 px-4 py-12">
        <div ref={containerRef} className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-black text-white">
            <button
              onClick={handleGoBack}
              className="mb-4 flex items-center text-sm text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to login
            </button>

            <h2 ref={titleRef} className="text-2xl font-bold">
              Verification code
            </h2>
            <p ref={descriptionRef} className="mt-2 text-gray-300 flex items-center">
              <Mail size={16} className="mr-2" />
              We sent a code to {email}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div ref={errorRef} className="mx-6 sm:mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div ref={successRef} className="mx-6 sm:mx-8 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="space-y-6">
              {/* OTP Inputs */}
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
                    className="w-12 h-12 text-center text-xl bg-white text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div ref={buttonRef}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <>
                      Verify
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </div>

              {/* Timer and Resend Button */}
              <div className="mt-4 flex items-center justify-between">
                <div ref={timerRef} className="text-sm text-gray-500">
                  {canResend ? (
                    "OTP expired"
                  ) : (
                    <>
                      Resend OTP in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend}
                  className={`text-sm font-medium ${
                    canResend
                      ? "text-black hover:text-gray-700"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OTP
