"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import gsap from "gsap"
import { Link, useSearchParams } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

// Initialize the font

import product1Img1 from "../../../assets/Mens/products/men_product_01_img_01.png"
import product2Img1 from "../../../assets/Mens/products/men_product_02_img_01.png"
import product3Img1 from "../../../assets/Mens/products/men_product_03_img_01.png"
import product4Img1 from "../../../assets/Mens/products/men_product_04_img_01.png"
import product5Img1 from "../../../assets/Mens/products/men_product_05_img_01.png"

export default function ProductPage() {
  // State for products
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  // Filter states
  const [colorFilter, setColorFilter] = useState("All")
  const [sizeFilter, setSizeFilter] = useState("All")
  const [styleFilter, setStyleFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")

  // Dropdown states
  const [colorOpen, setColorOpen] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  // Filtered products
  const [filteredProducts, setFilteredProducts] = useState([])

  // All colors from products for filter
  const [availableColors, setAvailableColors] = useState(["All"])

  // Refs for GSAP animations
  const productsRef = useRef(null)
  const productRefs = useRef([])

  // Size options
  const sizeOptions = ["All", "Small", "Medium", "Large", "Extra Large"]
  const styleOptions = ["All", "Classic"]

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

  // Add category options and colorHexMap (if you want colored dots in the future)
  const categoryOptions = [
    'All',
    'Scrubs',
    'Lab Coats',
    'Caps',
    'Masks',
    'Bottles',
  ]

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // categoryRef/colorRefs/fabric come from the navbar megamenu's
        // "Shop By" links (issue #23) - additive on top of the existing
        // client-side CATEGORY/COLOR/SIZE/STYLE filter bar below, which
        // still works as a secondary refinement on whatever this narrows
        // down first.
        const params = new URLSearchParams({ gender: "Men" })
        const categoryRef = searchParams.get("categoryRef")
        const colorRefs = searchParams.get("colorRefs")
        const fabric = searchParams.get("fabric")
        if (categoryRef) params.set("categoryRef", categoryRef)
        if (colorRefs) params.set("colorRefs", colorRefs)
        if (fabric) params.set("fabric", fabric)

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
        const allColors = new Set(["All"])

        responseData.data.forEach(product => {
          // Get unique colors from inventory
          const uniqueColors = [...new Set(product.inventory.map(item => item.color))]
          
          uniqueColors.forEach(color => {
            // Add color to available colors for filter
            allColors.add(color)
            
            // Create product entry for this color
            transformedProducts.push({
              id: `${product._id}-${color.replace(/\s+/g, '-').toLowerCase()}`,
              _id: product._id,
              name: product.name,
              price: product.price,
              color: color,
              colorCount: uniqueColors.length,
              // Use the first default image as primary image
              primaryImage: product.defaultImages[0]?.url || '',
              // Keep all default images
              images: product.defaultImages,
              category: product.category,
            })
          })
        })

        setProducts(transformedProducts)
        setFilteredProducts(transformedProducts)
        setAvailableColors(Array.from(allColors))
        setLoading(false)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  // Apply filters
  useEffect(() => {
    let result = [...products]

    if (colorFilter !== "All") {
      result = result.filter((product) => product.color === colorFilter)
    }
    if (categoryFilter !== "All") {
      result = result.filter((product) => product.category === categoryFilter)
    }

    // In a real app, you would filter by size and style as well
    // This is just a placeholder for demonstration

    setFilteredProducts(result)
  }, [colorFilter, sizeFilter, styleFilter, categoryFilter, products])

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
    // Remove any existing currency formatting and ensure it's a number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `Rs.${numericPrice}`;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
  }

  return (
    <div id="products" className="mx-auto px-4 lg:px-20 py-8 w-full">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-black px-4">Accessories</h1>

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
                setStyleOpen(false)
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
                setStyleOpen(false)
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

          {/* Size filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setSizeOpen(!sizeOpen)
                setColorOpen(false)
                setStyleOpen(false)
                setCategoryOpen(false)
              }}
            >
              SIZE <ChevronDown className={`h-4 w-4 transition-transform ${sizeOpen ? "rotate-180" : ""}`} />
            </button>
            {sizeOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white shadow-lg rounded-md py-1 border">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    className={`block px-4 py-2 text-xs md:text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${sizeFilter === size ? "font-bold" : ""}`}
                    onClick={() => {
                      setSizeFilter(size)
                      setSizeOpen(false)
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style filter */}
          <div className="relative">
            <button
              className="flex items-center gap-2 font-medium bg-white text-black text-sm md:text-base lg:text-lg border border-gray-300 rounded-md px-4 py-2 shadow-sm"
              onClick={() => {
                setStyleOpen(!styleOpen)
                setColorOpen(false)
                setSizeOpen(false)
                setCategoryOpen(false)
              }}
            >
              STYLE <ChevronDown className={`h-4 w-4 transition-transform ${styleOpen ? "rotate-180" : ""}`} />
            </button>
            {styleOpen && (
              <div className="absolute z-10 mt-2 w-48 bg-white shadow-lg rounded-md py-1 border">
                {styleOptions.map((style) => (
                  <button
                    key={style}
                    className={`block px-4 py-2 text-xs md:text-sm w-full bg-white text-black rounded-none text-left hover:bg-gray-100 ${styleFilter === style ? "font-bold" : ""}`}
                    onClick={() => {
                      setStyleFilter(style)
                      setStyleOpen(false)
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Total count */}
        <div className="text-black px-4 font-medium text-sm md:text-base lg:text-lg">
          {filteredProducts.length} Total
        </div>
      </div>

      {/* Products grid or No Products message */}
      {filteredProducts.length > 0 ? (
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
                    src={product.primaryImage || "/placeholder.svg"}
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
              setStyleFilter("All");
              setCategoryFilter("All");
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