import { useState } from "react"
import Header from "../../components/Header"
import Footer from "../../components/Footer"

const FAQ_ITEMS = [
  {
    question: "How long does shipping take?",
    answer: "Standard delivery across Pakistan takes 3-7 working days. Delays may occur during peak seasons.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns and exchanges within 7 days of delivery for unworn, unwashed items with original tags. Customised items are non-returnable unless defective.",
  },
  {
    question: "How do I find my size?",
    answer: "Check the size chart on each product page. If you're between sizes, we generally recommend sizing up for a relaxed fit.",
  },
  {
    question: "Do you offer a student discount?",
    answer: "Yes - verified students get 5% off. Apply through the Student Program page and we'll verify your enrollment.",
  },
  {
    question: "How do gift cards work?",
    answer: "Purchase a gift card with any amount and a recipient's email. They'll receive a redeemable code to apply at checkout.",
  },
]

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen flex flex-col w-full bg-shirting">
      <Header />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-caslon text-3xl md:text-4xl text-navy mb-8 text-center">Frequently Asked Questions</h1>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.question} className="border border-hairline  overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-ink hover:bg-paper transition-colors"
                >
                  {item.question}
                  <span className="text-flannel/50">{openIndex === index ? "−" : "+"}</span>
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-4 text-flannel/80 text-sm">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default FAQs
