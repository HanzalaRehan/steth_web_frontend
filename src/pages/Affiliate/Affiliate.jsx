import Header from "../../components/Header"
import Footer from "../../components/Footer"

// Static info page only - the real request-submission flow
// (AffiliatePartner/AffiliateRequest models + admin review) is
// backend-only for now, per B.4, and comes later.
const Affiliate = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Affiliate Program</h1>
          <p className="text-gray-600 mb-6">
            Love STETH? Earn commission by sharing your favorite scrubs with your community.
            We're opening applications soon - reach out and we'll get you on the list.
          </p>
          <a
            href="mailto:info@stethset.com?subject=Affiliate%20Program%20Interest"
            className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Email us to get started
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Affiliate
