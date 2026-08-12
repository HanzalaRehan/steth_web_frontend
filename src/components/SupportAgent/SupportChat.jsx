/**
 * Author(s): 1. Zainab Raza
 * Description: The customer support chat widget - a floating launcher and
 *              panel available on every page, backed by the support agent at
 *              POST /api/support/chat.
 *
 *              The agent is stateless server-side, so this component owns the
 *              conversation: the backend returns the updated history on every
 *              reply and we send it back on the next turn. That is what lets
 *              the same agent serve WhatsApp, where there is no session to
 *              hang state off either.
 *
 *              The customer's token is sent when they have one, which is what
 *              unlocks order and reward answers - the agent refuses those for
 *              anyone it cannot identify, so a signed-out visitor gets product
 *              and sizing help and nothing personal.
 *
 *              The widget hides itself entirely when the agent is not
 *              configured (GET /api/support/status), rather than offering a
 *              chat that would fail on the first message.
 *
 * Date created: August 13th, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 13th, 2026
 * Run: Not directly runnable - rendered globally by src/App.jsx
 */

import { useEffect, useRef, useState } from "react"
import { MessageCircle, Send, X } from "lucide-react"
import { API_BASE_URL } from "../../config/api"

// A stalled request must not leave the customer watching a spinner forever.
// Generous, because a reply can involve several tool round trips.
const REQUEST_TIMEOUT_MS = 45000

const GREETING =
  "Hi! I'm here to help with sizing, orders, and anything else about Steth. What can I do for you?"

// Shown as tappable chips on an empty conversation — most people don't know
// what to ask an agent until they see examples.
const SUGGESTIONS = [
  "What size should I get?",
  "Where is my order?",
  "How many reward points do I have?",
]

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [messages, setMessages] = useState([{ role: "agent", text: GREETING }])
  const [history, setHistory] = useState([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const scrollRef = useRef(null)

  // Only show the launcher if the agent can actually answer.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/support/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsReady(Boolean(data?.data?.ready)))
      .catch(() => setIsReady(false))
  }, [])

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  const send = async (text) => {
    const outgoing = String(text ?? input).trim()
    if (!outgoing || isSending) return

    setInput("")
    setError("")
    setMessages((prev) => [...prev, { role: "customer", text: outgoing }])
    setIsSending(true)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const token = localStorage.getItem("accessToken")
      const headers = { "Content-Type": "application/json" }
      // Sent only when present — the endpoint accepts anonymous visitors.
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_BASE_URL}/api/support/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: outgoing, history }),
        signal: controller.signal,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Support is unavailable right now.")
      }

      setMessages((prev) => [...prev, { role: "agent", text: data.data.reply }])
      // The server owns conversation shape (it differs per LLM provider), so
      // store what it returns rather than rebuilding it here.
      setHistory(data.data.history)
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "That took too long. Please try again."
          : err.message
      )
    } finally {
      clearTimeout(timer)
      setIsSending(false)
    }
  }

  if (!isReady) return null

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#0B132B] px-5 py-4 text-white">
            <div>
              <p className="font-semibold">Steth Support</p>
              <p className="text-xs text-gray-300">Sizing, orders and rewards</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((entry, index) => (
              <div
                key={index}
                className={`flex ${entry.role === "customer" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    entry.role === "customer"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {entry.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  Typing...
                </div>
              </div>
            )}

            {messages.length === 1 && !isSending && (
              <div className="flex flex-wrap gap-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-black"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-center text-xs text-red-600">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-gray-100 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizing, orders..."
              aria-label="Message"
              className="flex-grow rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default SupportChat
