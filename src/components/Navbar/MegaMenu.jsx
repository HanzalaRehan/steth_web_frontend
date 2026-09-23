// Desktop dropdown panel for Women/Men: three columns (Shop By Color /
// Shop By Fabric / Shop By Category) linking into the gender-scoped product
// listing with the new ref-based filters (categoryRef/colorRefs/fabric),
// per issue #23.
const MegaMenu = ({ gender, categories, fabrics, colors, loading }) => {
  const basePath = gender === "Women" ? "/women" : "/men"

  return (
    // Outer wrapper starts flush at top-full (zero margin) and uses padding
    // instead of margin to create the visual gap above the visible card.
    // Padding is part of an element's own hoverable box, margin isn't - with
    // margin, the gap was dead space no DOM element covered, so the cursor
    // exited the trigger's wrapping <div onMouseEnter/Leave> (Header.jsx)
    // while crossing it, closing the menu before it ever reached the panel.
    <div className="absolute top-full left-0 pt-3 w-[560px] max-w-[90vw] z-40">
      <div className="bg-shirting border border-hairline shadow-xl p-6 grid grid-cols-3 gap-6 border-t-2 border-t-brass">
        <div>
          <h3 className="font-archivo text-[11px] font-semibold text-flannel uppercase tracking-[0.22em] mb-3">Shop By Color</h3>
          {loading ? (
            <p className="text-sm text-flannel/60">Loading...</p>
          ) : colors.length > 0 ? (
            <ul className="space-y-2">
              {colors.map((color) => (
                <li key={color._id}>
                  <a
                    href={`${basePath}?colorRefs=${color._id}`}
                    className="flex items-center gap-2 text-sm text-ink hover:text-claret transition-colors no-underline"
                  >
                    <span
                      className="w-4 h-4 inline-block border border-hairline shrink-0"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    {color.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-flannel/60">No colors yet</p>
          )}
        </div>

        <div>
          <h3 className="font-archivo text-[11px] font-semibold text-flannel uppercase tracking-[0.22em] mb-3">Shop By Fabric</h3>
          {loading ? (
            <p className="text-sm text-flannel/60">Loading...</p>
          ) : fabrics.length > 0 ? (
            <ul className="space-y-2">
              {fabrics.map((fabric) => (
                <li key={fabric._id}>
                  <a
                    href={`${basePath}?fabric=${fabric._id}`}
                    className="text-sm text-ink hover:text-claret transition-colors no-underline"
                  >
                    {fabric.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-flannel/60">No fabrics yet</p>
          )}
        </div>

        <div>
          <h3 className="font-archivo text-[11px] font-semibold text-flannel uppercase tracking-[0.22em] mb-3">Shop By Category</h3>
          {loading ? (
            <p className="text-sm text-flannel/60">Loading...</p>
          ) : categories.length > 0 ? (
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category._id}>
                  <a
                    href={`${basePath}?categoryRef=${category._id}`}
                    className="text-sm text-ink hover:text-claret transition-colors no-underline"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-flannel/60">No categories yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MegaMenu
