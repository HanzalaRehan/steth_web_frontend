/**
 * Author(s): 1. Zainab Raza
 * Description: The "How It Works" band at the top of the rewards page - the
 *              three-step explainer (sign up, earn, redeem) from the
 *              programme design.
 *
 *              Purely presentational and static: it explains the programme
 *              rather than reporting any customer's state, so it renders
 *              identically signed in or out and makes no API calls. The point
 *              values deliberately live in the earn grid below, which reads
 *              them from the backend - stating any number here would risk it
 *              drifting from what the engine actually pays.
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - rendered by src/pages/Rewards/Rewards.jsx
 */

import { Gift, ShoppingBag, UserPlus } from "lucide-react"

const STEPS = [
  {
    icon: UserPlus,
    title: "SIGN UP",
    copy: "Create an account and start earning points.",
  },
  {
    icon: ShoppingBag,
    title: "EARN POINTS",
    copy: "Every order brings you closer to your next reward.",
  },
  {
    icon: Gift,
    title: "REDEEM",
    copy: "Redeem points for elevated rewards.",
  },
]

const HowItWorks = () => (
  <section className="max-w-6xl mx-auto px-4 py-16">
    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">
      HOW IT WORKS
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {STEPS.map((step) => (
        <div key={step.title} className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <step.icon size={30} strokeWidth={1.5} className="text-gray-900" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
            {step.title}
          </h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">{step.copy}</p>
        </div>
      ))}
    </div>
  </section>
)

export default HowItWorks
