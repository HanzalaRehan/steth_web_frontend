/**
 * Author(s): 1. Zainab Raza
 * Description: The signed-in header on the rewards page - "Hi <name>, you have
 *              N points" - plus the balance's expiry date and the activity
 *              table beneath it.
 *
 *              The table is a single feed of two sources merged server-side:
 *              programme rewards from the points ledger, and points earned per
 *              order at checkout. Each row carries its own expiry date, since
 *              points expire a year after they are earned rather than all at
 *              once, and rows already swept by the expiry pass are marked so a
 *              customer can see why a balance dropped.
 *
 * Date created: August 3rd, 2026
 * Edit(s):
 *   (1): None
 * Date last modified: August 3rd, 2026
 * Run: Not directly runnable - rendered by src/pages/Rewards/Rewards.jsx
 */

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—"

const PointsActivity = ({ rewards }) => (
  <section className="max-w-4xl mx-auto px-4 py-16">
    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 text-center tracking-tight">
      HI {(rewards.username || "there").toUpperCase()}, YOU HAVE{" "}
      <span className="font-extrabold">{rewards.balance}</span> POINTS
    </h2>

    {/* A point count means nothing on its own - show what it is worth to
        spend. The rate comes from the API so it can never drift from what
        checkout actually applies. */}
    {rewards.balanceValuePkr > 0 && (
      <p className="text-center text-lg text-gray-700 mt-3">
        Worth{" "}
        <span className="font-semibold text-gray-900">
          PKR {rewards.balanceValuePkr.toLocaleString("en-PK")}
        </span>{" "}
        off your next order
      </p>
    )}

    {rewards.nextExpiryDate && (
      <div className="flex justify-center mt-5">
        <span className="rounded-full bg-gray-100 px-5 py-2 text-sm text-gray-600">
          Expiration Date: {formatDate(rewards.nextExpiryDate)}
        </span>
      </div>
    )}

    {/* Points credited by the sync that ran when this page loaded. */}
    {rewards.pointsJustAwarded > 0 && (
      <p className="text-center text-sm text-green-700 mt-4">
        You just earned {rewards.pointsJustAwarded} points!
      </p>
    )}
    {rewards.pointsJustExpired > 0 && (
      <p className="text-center text-sm text-amber-700 mt-2">
        {rewards.pointsJustExpired} points expired.
      </p>
    )}

    <p className="text-center text-gray-500 mt-6 mb-8">
      Here&apos;s an overview of your current points balance and recent activity
    </p>

    {rewards.history.length === 0 ? (
      <p className="text-center text-gray-400 text-sm">
        No activity yet — start earning below.
      </p>
    ) : (
      // Horizontal scroll container so four columns never force the page
      // itself to scroll sideways on a phone.
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-black text-white text-left">
              <th className="px-5 py-3 font-semibold">ACTIVITY</th>
              <th className="px-5 py-3 font-semibold text-right">POINTS</th>
              <th className="px-5 py-3 font-semibold text-right">DATE</th>
              <th className="px-5 py-3 font-semibold text-right">EXPIRES AT</th>
            </tr>
          </thead>
          <tbody>
            {rewards.history.map((entry, index) => (
              <tr
                key={`${entry.ruleKey}-${entry.awardedAt}-${index}`}
                className={`border-b border-gray-100 ${entry.expired ? "text-gray-400" : "text-gray-900"}`}
              >
                <td className="px-5 py-4">
                  {entry.description}
                  {entry.expired && (
                    <span className="ml-2 text-xs uppercase tracking-wide">expired</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap tabular-nums">
                  {entry.points > 0 ? `+ ${entry.points}` : entry.points} Points
                  {rewards.pointValuePkr > 0 && (
                    <span className="block text-xs text-gray-400">
                      PKR {Math.abs(entry.points * rewards.pointValuePkr).toLocaleString("en-PK")}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  {formatDate(entry.awardedAt)}
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  {formatDate(entry.expiresAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)

export default PointsActivity
