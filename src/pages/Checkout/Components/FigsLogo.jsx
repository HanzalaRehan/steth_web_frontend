import { Link } from "react-router-dom"

// No logo mark, wordmark only - matches Header.jsx's navbar rebuild.
const FigsLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="no-underline">
        <span className="font-caslon text-2xl tracking-[0.1em] text-navy">STETH</span>
      </Link>
    </div>
  )
}

export default FigsLogo
