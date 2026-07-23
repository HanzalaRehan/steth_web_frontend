import Header from "../../components/Header"
import Footer from "../../components/Footer"

// Starting content adapted/expanded from TermsAndConditions.jsx's embedded
// "6. Privacy Policy" section into its own page, per issue #24. Not legal
// advice - have this reviewed before treating it as final.
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600">Effective Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="space-y-12">
            <section className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <p className="text-lg text-gray-700 leading-relaxed">
                This Privacy Policy explains how STETH ("we", "us", or "our") collects, uses, and protects your
                personal information when you visit or make a purchase on our website.
              </p>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start"><span className="text-black mr-2">•</span>Contact details you provide at checkout or signup (name, email, phone, shipping address).</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>Order history and payment method (we do not store full card numbers).</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>Basic usage data (pages visited, device type) for improving the site.</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start"><span className="text-black mr-2">•</span>To process and deliver your orders.</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>To send order confirmations, shipping updates, and (if you opt in) marketing emails.</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>To improve our products, website, and customer service.</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sharing Your Information</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start"><span className="text-black mr-2">•</span>We do not sell your personal data.</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>We share only what's necessary with delivery partners and payment processors to fulfill your order.</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>We may disclose information if required by law.</li>
              </ul>
            </section>

            <section className="bg-gray-50 p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Choices</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start"><span className="text-black mr-2">•</span>You can update your account details or unsubscribe from marketing emails at any time.</li>
                <li className="flex items-start"><span className="text-black mr-2">•</span>You can request deletion of your account data by contacting us.</li>
              </ul>
            </section>

            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
              <p className="text-gray-700">For any privacy-related questions, contact us at info@stethset.com.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PrivacyPolicy
