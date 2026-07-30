// Small 2-item dropdown for "About STETH": Our Story (existing /aboutus
// anchor) and Blog (new page).
const AboutDropdown = () => {
  return (
    // Same fix as MegaMenu.jsx: padding (part of the element's own
    // hoverable box) instead of margin (dead space no element covers) for
    // the gap above the panel, so the trigger's wrapping onMouseEnter/Leave
    // div in Header.jsx never sees a premature mouseleave while the cursor
    // crosses from the trigger into the panel.
    <div className="absolute top-full left-0 pt-2 w-48 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl py-2">
        <a href="/aboutus#our-story" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
          Our Story
        </a>
        <a href="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
          Blog
        </a>
      </div>
    </div>
  )
}

export default AboutDropdown
