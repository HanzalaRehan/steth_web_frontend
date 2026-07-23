import Header from "../../components/Header"
import Footer from "../../components/Footer"

// Placeholder for the navbar's "Rewards" link and the footer's "Loyalty
// Program" link - the real rewards page is a later session (issue #22).
// A real page beats a dead link for the same cost.
const Rewards = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loyalty & Rewards</h1>
          <p className="text-gray-600">
            Our rewards program is coming soon. In the meantime, every account already earns
            points on purchases - check your balance under My Orders once you're signed in.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Rewards
