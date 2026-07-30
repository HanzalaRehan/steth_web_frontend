"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import gsap from "gsap"
import { Link, useSearchParams } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"
import { getImageUrl } from "../../../utils/imageUrl"

const GRID_PAGE_SIZE = 24
const OPTIONS_FETCH_LIMIT = 100

const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
]

export default function ProductPage() {
  // Grid (paginated, server-filtered) state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filter states
  const [colorFilter, setColorFilter] = useState("All")
  const [sizeFilter, setSizeFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value)

  // Dropdown states
  const [colorOpen, setColorOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Client-local filtered view (Color/Category still refine whatever page
  // the server returned - unchanged mechanic from before, just now applied
  // on top of a paginated grid fetch instead of an unpaginated full set)
  const [filteredProducts, setFilteredProducts] = useState([])

  // Filter option sets - sourced from a dedicated, larger, unpaginated
  // fetch (see fetchFilterOptions below) rather than derived from the grid
  // fetch, since a paginated grid fetch only ever contains one page's worth
  // of products and would make these dropdowns flicker/shrink as the
  // visitor pages or filters.
  const [availableColors, setAvailableColors] = useState(["All"])
  const [availableSizes, setAvailableSizes] = useState(["All"])

  // Refs for GSAP animations
  const productsRef = useRef(null)
  const productRefs = useRef([])

  // Color name to hex code mapping for color dots
  const colorHexMap = {
    'All': '#FFFFFF',
    'Black': '#000000',
    'Dark Harbor': '#22343C',
    'Navy': '#000080',
    'Seaglass': '#7FC6B7',
    'Graphite': '#A7A9AC',
    'Sunset Drift': '#F88379',
    'Ceil Blue': '#7BAFD4',
    'Royal Blue': '#0052CC',
    'Burgundy': '#6C2E35',
    'White': '#FFFFFF',
    'Grey': '#808080',
    'Blue': '#0000FF',
    'Red': '#FF0000',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Purple': '#800080',
    'Pink': '#FFC0CB',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Beige': '#F5F5DC',
    'Khaki': '#F0E68C',
    'Maroon': '#800000',
    'Teal': '#008080',
    'Cyan': '#00FFFF',
    'Magenta': '#FF00FF',
    'Lime': '#00FF00',
    'Olive': '#808000',
    'Aqua': '#00FFFF',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Cream': '#FFFDD0',
    'Tan': '#D2B48C',
    'Mint': '#98FF98',
    'Lavender': '#E6E6FA',
    'Coral': '#FF7F50',
    'Indigo': '#4B0082',
    'Turquoise': '#40E0D0',
    'Violet': '#8B00FF',
    'Peach': '#FFDAB9',
    'Salmon': '#FA8072',
    'Sage': '#BCB88A',
    'Charcoal': '#36454F',
    'Mauve': '#E0B0FF',
    'Rust': '#B7410E',
    'Mustard': '#FFDB58',
    'Wine': '#722F37',
    'Emerald': '#50C878',
    'Ruby': '#E0115F',
    'Sapphire': '#0F52BA',
    'Amber': '#FFBF00',
    'Bronze': '#CD7F32',
    'Copper': '#B87333',
    'Platinum': '#E5E4E2',
    'Pearl': '#F0EAD6',
    'Ivory': '#FFFFF0',
    'Champagne': '#F7E7CE',
    'Cognac': '#9F381D',
    'Espresso': '#614051',
    'Hazel': '#8E7618',
    'Jade': '#00A86B',
    'Lilac': '#C8A2C8',
    'Navy Blue': '#000080',
    'Olive Green': '#808000',
    'Pine Green': '#01796F',
    'Rose': '#FF007F',
    'Sienna': '#A0522D',
    'Slate': '#708090',
    'Steel Blue': '#4682B4',
    'Taupe': '#483C32',
    'Terracotta': '#E2725B',
    'Topaz': '#FFC87C',
    'Umber': '#635147',
    'Vermilion': '#E34234',
    'Viridian': '#40826D',
    'Wisteria': '#C9A0DC',
    'Zinc': '#7A7A7A'
  }

  const categoryOptions = [
    'All',
    'Scrubs',
    'Lab Coats',
    'Caps',
    'Masks',
    'Bottles',
  ]

  // categoryRef/colorRefs/fabric come from the navbar megamenu's "Shop By"
  // links (issue #23) - additive on top of the CATEGORY/COLOR/SIZE filter
  // bar below, which still works as a secondary refinement.
  const categoryRef = searchParams.get("categoryRef")
  const colorRefs = searchParams.get("colorRefs")
  const fabric = searchParams.get("fabric")

  // Options fetch - fires only when the URL-driven refs change, not on
  // every filter/sort/page change, so Color/Size dropdown contents stay
  // stable and complete regardless of which page the grid is showing.
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const params = new URLSearchParams({ gender: "Men", limit: String(OPTIONS_FETCH_LIMIT) })
        if (categoryRef) params.set("categoryRef", categoryRef)
        if (colorRefs) params.set("colorRefs", colorRefs)
        if (fabric) params.set("fabric", fabric)

        const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`)
        const responseData = await response.json()
        if (!responseData.success) return

        const colors = new Set(["All"])
        const sizes = new Set(["All"])
        responseData.data.forEach((product) => {
          product.inventory.forEach((item) => {
            if (item.color) colors.add(item.color)
            if (item.size) sizes.add(item.size)
          })
        })
        setAvailableColors(Array.from(colors))
        setAvailableSizes(Array.from(sizes))
      } catch (err) {
        console.error("Error fetching filter options:", err)
      }
    }

    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryRef, colorRefs, fabric])

  // Grid fetch - real server-side size/sort/pagination.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          gender: "Men",
          sort: sortOption,
          page: String(currentPage),
          limit: String(GRID_PAGE_SIZE),
        })
        if (categoryRef) params.set("categoryRef", categoryRef)
        if (colorRefs) params.set("colorRefs", colorRefs)
        if (fabric) params.set("fabric", fabric)
        if (sizeFilter !== "All") params.set("size", sizeFilter)

        const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const responseData = await response.json()

        if (!responseData.success) {
          throw new Error('API returned unsuccessful response')
        }

        // Transform products to separate by color
        const transformedProducts = []

        responseData.data.forEach(product => {
          const uniqueColors = [...new Set(product.inventory.map(item => item.color))]

          uniqueColors.forEach(color => {
            transformedProducts.push({
              id: `${product._id}-${color.replace(/\s+/g, '-').toLowerCase()}`,
              _id: product._id,
              name: product.name,
              price: product.price,
              color: color,
              colorCount: uniqueColors.length,
              primaryImage: product.defaultImages[0]?.url || '',
              images: product.defaultImages,
              category: product.category,
            })
          })
        })

        setProducts(transformedProducts)
        setTotalPages(responseData.pagination?.pages || 1)
        setTotalCount(responseData.total || 0)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryRef, colorRefs, fabric, sizeFilter, sortOption, currentPage])

  // Color/Category stay client-local filters on top of whichever page the
  // grid fetch returned (unchanged mechanic from before). Known limitation
  // carried forward: combining this with true server pagination means
  // picking a color can shrink the visible count on a page without
  // signaling more matches exist on other pages.
  useEffect(() => {
    let result = [...products]

    if (colorFilter !== "All") {
      result = result.filter((product) => product.color === colorFilter)
    }
    if (categoryFilter !== "All") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    setFilteredProducts(result)
  }, [colorFilter, categoryFilter, products])

  // GSAP animations
  useEffect(() => {
    if (productsRef.current && productRefs.current.length > 0 && !loading) {
      gsap.fromTo(
        productRefs.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
        },
      )
    }
  }, [filteredProducts, loading])

  // Format price to display properly
  const formatPrice = (price) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `Rs.${numericPrice}`;
  }

  const changeSize = (size) => {
    setSizeFilter(size)
    setSizeOpen(false)
    setCurrentPage(1)
  }

  const changeSort = (value) => {
    setSortOption(value)
    setSortOpen(false)
    setCurrentPage(1)
  }

  if (loading) {
    return <div id="products" className="flex justify-center items-center h-64">Loading products...</div>
  }

  if (error) {
    return <div id="products" className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
  }

  const sortLabel = SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? "Sort"

  return (
    <div id="products" className="mx-auto px-4 lg:px-20 py-8 w-full">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-black px-4">Men's Collection</h1>

      {/* Filter section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4">
        <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
          {/* Category filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setCategoryOpen(!categoryOpen)
                setColorOpen(false)
                setSizeOpen(false)
                setSortOpen(false)
              }}
              type="button"
            >
              CATEGORY <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="absolute z-10 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 border">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    className={`block px-4 py-2 text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${categoryFilter === cat ? "font-bold" : ""}`}
                    onClick={() => {
                      setCategoryFilter(cat)
                      setCategoryOpen(false)
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setColorOpen(!colorOpen)
                setSizeOpen(false)
                setSortOpen(false)
                setCategoryOpen(false)
              }}
            >
              COLOR <ChevronDown className={`h-4 w-4 transition-transform ${colorOpen ? "rotate-180" : ""}`} />
            </button>
            {colorOpen && (
              <div className="absolute z-10 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 border">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    className={`flex items-center gap-3 px-4 py-2 text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${colorFilter === color ? "font-bold" : ""}`}
                    onClick={() => {
                      setColorFilter(color)
                      setColorOpen(false)
                    }}
                  >
                    {/* Color dot */}
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: colorHexMap[color] || '#e5e7eb' }}
                    ></span>
                    <span>{color}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size filter - real, server-side */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setSizeOpen(!sizeOpen)
                setColorOpen(false)
                setSortOpen(false)
                setCategoryOpen(false)
              }}
            >
              SIZE <ChevronDown className={`h-4 w-4 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
            </button>
            {sizeOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white shadow-lg rounded-md py-1 border">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`block px-4 py-2 text-xs md:text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${sizeFilter === size ? "font-bold" : ""}`}
                    onClick={() => changeSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setSortOpen(!sortOpen)
                setColorOpen(false)
                setSizeOpen(false)
                setCategoryOpen(false)
              }}
            >
              SORT: {sortLabel} <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute z-10 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 border">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`block px-4 py-2 text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${sortOption === option.value ? "font-bold" : ""}`}
                    onClick={() => changeSort(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Total count */}
        <div className="text-black px-4 font-medium text-sm md:text-base lg:text-lg">
          {totalCount} Total
        </div>
      </div>

      {/* Products grid or No Products message */}
      {filteredProducts.length > 0 ? (
        <>
          <div ref={productsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <Link
                to={`/product/${product._id}?color=${product.color}`}
                key={product.id}
                state={{ selectedColor: product.color }}
              >
               <div
                  ref={(el) => (productRefs.current[index] = el)}
                  className="flex flex-col transition-all duration-300 hover:shadow-md cursor-pointer"
                >
                  {/* Product image */}
                  <div className="bg-gray-100 overflow-hidden mb-3 aspect-[3/4.5]">
                    <img
                      src={getImageUrl(product.primaryImage, { width: 500 }) || "/placeholder.svg"}
                      alt={`${product.name} - ${product.color}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex flex-col p-2">
                    {/* Product name */}
                    <h3 className="text-gray-900 font-medium text-base md:text-lg lg:text-xl mb-1">
                      {product.name}
                    </h3>

                    {/* Color and color count */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-700 text-xs md:text-sm lg:text-base">{product.color}</span>
                      <span className="text-gray-500 text-xs md:text-sm lg:text-base">{product.colorCount} Colors</span>
                    </div>

                    {/* Price */}
                    <div className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-500 text-xl md:text-2xl mb-4">No products found</div>
          <p className="text-gray-400 text-center mb-6">
            There are no products matching your current filter selection.
          </p>
          <button
            onClick={() => {
              setColorFilter("All");
              setSizeFilter("All");
              setCategoryFilter("All");
              setCurrentPage(1);
            }}
            className="bg-black text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
