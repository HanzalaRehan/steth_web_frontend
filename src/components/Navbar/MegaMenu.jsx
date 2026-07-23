// Desktop dropdown panel for Women/Men: three columns (Shop By Color /
// Shop By Fabric / Shop By Category) linking into the gender-scoped product
// listing with the new ref-based filters (categoryRef/colorRefs/fabric),
// per issue #23.
const MegaMenu = ({ gender, categories, fabrics, colors, loading }) => {
  const basePath = gender === "Women" ? "/women" : "/men"

  return (
    <div className="absolute top-full left-0 mt-2 w-[560px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl p-6 grid grid-cols-3 gap-6 z-40">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shop By Color</h3>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : colors.length > 0 ? (
          <ul className="space-y-2">
            {colors.map((color) => (
              <li key={color._id}>
                <a
                  href={`${basePath}?colorRefs=${color._id}`}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-sm inline-block border border-gray-200 shrink-0"
                    style={{ backgroundColor: color.hexCode }}
                  />
                  {color.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No colors yet</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shop By Fabric</h3>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : fabrics.length > 0 ? (
          <ul className="space-y-2">
            {fabrics.map((fabric) => (
              <li key={fabric._id}>
                <a
                  href={`${basePath}?fabric=${fabric._id}`}
                  className="text-sm text-gray-700 hover:text-black transition-colors"
                >
                  {fabric.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No fabrics yet</p>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shop By Category</h3>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : categories.length > 0 ? (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category._id}>
                <a
                  href={`${basePath}?categoryRef=${category._id}`}
                  className="text-sm text-gray-700 hover:text-black transition-colors"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No categories yet</p>
        )}
      </div>
    </div>
  )
}

export default MegaMenu
