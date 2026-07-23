// Small 2-item dropdown for "About STETH": Our Story (existing /aboutus
// anchor) and Blog (new page).
const AboutDropdown = () => {
  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-40">
      <a href="/aboutus#our-story" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
        Our Story
      </a>
      <a href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
        Blog
      </a>
    </div>
  )
}

export default AboutDropdown
