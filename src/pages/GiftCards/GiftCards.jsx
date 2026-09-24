import { useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"
import { API_BASE_URL } from "../../config/api"

const PRESET_AMOUNTS = [2000, 5000, 10000]

const GiftCards = () => {
  const [amount, setAmount] = useState(PRESET_AMOUNTS[1])
  const [customAmount, setCustomAmount] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [purchasedCard, setPurchasedCard] = useState(null)

  const effectiveAmount = customAmount ? Number(customAmount) : amount

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!effectiveAmount || effectiveAmount < 1) {
      setError("Please choose or enter a valid amount")
      return
    }
    if (!recipientEmail) {
      setError("Please enter a recipient email")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/gift-cards/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: effectiveAmount, recipientEmail, note }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to purchase gift card")
      }

      setPurchasedCard(data.data)
    } catch (err) {
      setError(err.message || "Failed to purchase gift card")
    } finally {
      setIsLoading(false)
    }
  }

  if (purchasedCard) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-shirting">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full text-center bg-paper  p-8 border border-hairline">
            <h1 className="font-caslon text-2xl text-navy mb-2">Gift card purchased!</h1>
            <p className="text-flannel/80 mb-6">
              PKR {purchasedCard.initialBalance.toLocaleString()} for {purchasedCard.recipientEmail}
            </p>
            <div className="bg-navy text-paper  py-4 px-6 text-2xl font-mono tracking-widest mb-4">
              {purchasedCard.code}
            </div>
            <p className="text-sm text-flannel/70">
              Save this code - it's needed to redeem the balance at checkout. Valid until{" "}
              {new Date(purchasedCard.expiryDate).toLocaleDateString()}.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-shirting">
      <Header />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="font-caslon text-3xl md:text-4xl text-navy mb-2 text-center">Gift Cards</h1>
          <p className="text-flannel/80 mb-8 text-center">Give the gift of STETH scrubs.</p>

          {error && (
            <div className="mb-4 p-3 bg-shirting border border-claret text-red-700  text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-paper  p-6 border border-hairline">
            <div>
              <label className="block text-sm font-medium text-flannel mb-2">Amount (PKR)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset)
                      setCustomAmount("")
                    }}
                    className={`py-2  border text-sm font-medium transition-colors ${
                      !customAmount && amount === preset
                        ? "bg-navy text-paper border-navy"
                        : "bg-shirting text-flannel border-hairline hover:border-gray-400"
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                placeholder="Or enter a custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-3 py-2 border border-hairline  focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="recipientEmail" className="block text-sm font-medium text-flannel mb-1">
                Recipient Email
              </label>
              <input
                id="recipientEmail"
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full px-3 py-2 border border-hairline  focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-flannel mb-1">
                Note (optional)
              </label>
              <textarea
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-hairline  focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-navy text-paper  font-medium hover:bg-ink transition-colors disabled:opacity-50"
            >
              {isLoading ? "Processing..." : `Purchase Gift Card - PKR ${effectiveAmount ? effectiveAmount.toLocaleString() : "0"}`}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default GiftCards
