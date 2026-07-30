"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Filter, ArrowRight } from 'lucide-react'
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Link, useParams } from "react-router-dom"
import Header from "../../components/Header"
import AwsomeHumansFooter from "../../components/Footer"
import { API_BASE_URL } from "../../config/api"

export default function ColorProductsPage() {
  // Color id from the URL (a Color entity _id, not a name string - this
  // page used to string-match Product.inventory.color against a decoded
  // name; now it filters server-side via ?colorRefs=<id> like the rest of
  // the site's "shop by color" links do).
  const { colorId } = useParams()
  const [colorInfo, setColorInfo] = useState(null)

  // State for products
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isClient, setIsClient] = useState(false)

  // Filter states - size and style still available for additional filtering
  const [sizeFilter, setSizeFilter] = useState("All")
  const [styleFilter, setStyleFilter] = useState("All")

  // Dropdown states
  const [sizeOpen, setSizeOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)

  // Filtered products
  const [filteredProducts, setFilteredProducts] = useState([])

  // Refs for GSAP animations
  const heroRef = useRef(null)
  const productsRef = useRef(null)
  const productRefs = useRef([])
  const filterSectionRef = useRef(null)
  
  // Animation control flags
  const animationsInitialized = useRef(false)
  const isFirstLoad = useRef(true)
  const [animationsReady, setAnimationsReady] = useState(false)

  // Client-side check
  useEffect(() => {
    setIsClient(true)
    // Register GSAP plugins only on client side
    if (typeof window !== "undefined") {
      try {
        gsap.registerPlugin(ScrollTrigger)
      } catch (error) {
        console.warn('GSAP plugin registration failed:', error)
      }
    }
  }, [])

  // Reset productRefs when filteredProducts changes
  useEffect(() => {
    // Reset the refs array to the correct length
    productRefs.current = Array(filteredProducts.length).fill(null)
  }, [filteredProducts.length])

  // Size options
  const sizeOptions = ["All", "Extra Small", "Small", "Medium", "Large", "Extra Large"]
  const styleOptions = ["All", "Classic"]

  // Fetch the Color entity itself (for its display name) and the products
  // tagged with it server-side via colorRefs - replaces the old approach of
  // fetching every product and string-matching inventory colors client-side.
  useEffect(() => {
    const fetchColorAndProducts = async () => {
      if (!colorId) {
        setLoading(false)
        setAnimationsReady(true)
        return
      }

      try {
        setLoading(true)
        // Reset animation flag when fetching new data
        animationsInitialized.current = false
        setAnimationsReady(false)

        const [colorResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/colors/${colorId}`),
          fetch(`${API_BASE_URL}/api/products?colorRefs=${colorId}&limit=100`),
        ])

        if (!colorResponse.ok) {
          throw new Error("Failed to fetch color")
        }
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products")
        }

        const colorData = await colorResponse.json()
        const productsData = await productsResponse.json()

        if (!colorData.success) {
          throw new Error("API returned unsuccessful response for color")
        }
        if (!productsData.success) {
          throw new Error("API returned unsuccessful response for products")
        }

        const matchedColorName = colorData.data.name
        setColorInfo(colorData.data)

        // Server already filtered to products tagged with this colorRef, but
        // a product's inventory can span multiple colors - still need to
        // pick out the specific matching variant per product for the card
        // image/label, same as before.
        const transformedProducts = productsData.data.reduce((acc, product) => {
          const uniqueColors = [...new Set(product.inventory.map(item => item.color))];

          const colorVariants = uniqueColors.map((color) => ({
            id: `${product._id}-${color.replace(/\s+/g, "-").toLowerCase()}`,
            _id: product._id,
            name: product.name,
            price: product.price,
            color: color,
            colorCount: uniqueColors.length,
            primaryImage: product.defaultImages[0]?.url || "",
            images: product.defaultImages,
            colorSlug: color.replace(/\s+/g, "-").toLowerCase(),
          }))

          const filteredVariants = colorVariants.filter(
            variant => variant.color.toLowerCase() === matchedColorName.toLowerCase()
          )
          return [...acc, ...filteredVariants]
        }, [])

        setProducts(transformedProducts)
        setFilteredProducts(transformedProducts)
        setLoading(false)

        // Set animations ready after a short delay to ensure DOM is updated
        setTimeout(() => {
          setAnimationsReady(true)
        }, 100)
      } catch (err) {
        console.error("Error fetching color/products:", err)
        setError(err.message)
        setLoading(false)
        setAnimationsReady(true) // Still set ready to show products even on error
      }
    }

    fetchColorAndProducts()
  }, [colorId])

  // Enhanced GSAP animations with better fallback
  useEffect(() => {
    // Only run animations if we're ready and haven't initialized yet
    if (!isClient || loading || !animationsReady || animationsInitialized.current) return

    const runAnimations = () => {
      // Comprehensive fallback: Make elements visible immediately if GSAP fails
      const makeVisible = () => {
        if (heroRef.current) {
          heroRef.current.style.opacity = '1'
          heroRef.current.style.transform = 'translateY(0)'
        }
        if (filterSectionRef.current) {
          filterSectionRef.current.style.opacity = '1'
          filterSectionRef.current.style.transform = 'translateY(0)'
        }
        productRefs.current.forEach(ref => {
          if (ref) {
            ref.style.opacity = '1'
            ref.style.transform = 'translateY(0)'
          }
        })
      }

      try {
        // Check if GSAP is available and working
        if (typeof gsap === 'undefined' || !gsap.set) {
          console.warn('GSAP not available, using fallback')
          makeVisible()
          animationsInitialized.current = true
          return
        }

        // Test GSAP functionality
        const testElement = document.createElement('div')
        gsap.set(testElement, { opacity: 0 })
        if (testElement.style.opacity !== '0') {
          console.warn('GSAP not working properly, using fallback')
          makeVisible()
          animationsInitialized.current = true
          return
        }

        // Set initial states to prevent flash
        if (heroRef.current) {
          gsap.set(heroRef.current, { opacity: 0, y: -30 })
        }
        if (filterSectionRef.current) {
          gsap.set(filterSectionRef.current, { opacity: 0, y: 20 })
        }

        const validRefs = productRefs.current.filter((ref) => ref !== null && ref !== undefined)
        if (validRefs.length > 0) {
          gsap.set(validRefs, { y: 50, opacity: 0 })
        }

        // Create master timeline with comprehensive error handling
        const masterTL = gsap.timeline({
          onComplete: () => {
            animationsInitialized.current = true
            // Ensure visibility as backup
            makeVisible()
          },
          onReverseComplete: makeVisible,
          onError: (error) => {
            console.warn('GSAP timeline error:', error)
            makeVisible()
            animationsInitialized.current = true
          }
        })

        // Hero section animation
        if (heroRef.current) {
          masterTL.to(
            heroRef.current,
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8, 
              ease: "power2.out"
            },
            0
          )
        }

        // Filter section animation
        if (filterSectionRef.current) {
          masterTL.to(
            filterSectionRef.current,
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.6, 
              ease: "power2.out"
            },
            0.3
          )
        }

        // Product animations
        if (validRefs.length > 0) {
          masterTL.to(
            validRefs,
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              duration: 0.8,
              ease: "power3.out"
            },
            0.5
          )
        }

        // Shorter fallback timeout for production
        setTimeout(() => {
          if (!animationsInitialized.current) {
            console.warn('Animation timeout reached, making elements visible')
            makeVisible()
            animationsInitialized.current = true
          }
        }, 1500) // Reduced from 3000ms

      } catch (error) {
        console.warn('GSAP animation failed, falling back to CSS:', error)
        makeVisible()
        animationsInitialized.current = true
      }
    }

    // Immediate fallback for slow environments
    const immediateTimeout = setTimeout(() => {
      if (!animationsInitialized.current) {
        console.warn('Immediate fallback triggered')
        if (heroRef.current) {
          heroRef.current.style.opacity = '1'
          heroRef.current.style.transform = 'translateY(0)'
        }
        if (filterSectionRef.current) {
          filterSectionRef.current.style.opacity = '1'
          filterSectionRef.current.style.transform = 'translateY(0)'
        }
        productRefs.current.forEach(ref => {
          if (ref) {
            ref.style.opacity = '1'
            ref.style.transform = 'translateY(0)'
          }
        })
        animationsInitialized.current = true
      }
    }, 500)

    // Use requestAnimationFrame to ensure DOM is ready
    const animationFrame = requestAnimationFrame(() => {
      // Additional delay to ensure everything is mounted
      setTimeout(runAnimations, 150)
    })
    
    return () => {
      cancelAnimationFrame(animationFrame)
      clearTimeout(immediateTimeout)
    }
  }, [isClient, loading, animationsReady, filteredProducts])

  // Cleanup function for page unmount
  useEffect(() => {
    return () => {
      // #2 - this component never creates a ScrollTrigger instance (no
      // `scrollTrigger:` config anywhere in its animation timeline above),
      // so ScrollTrigger.getAll().kill() here did nothing for this page's
      // own animations - it only ever killed OTHER components' still-active
      // ScrollTriggers the moment this page unmounted. Removed; the
      // gsap.killTweensOf("*") guard below still cleans up this page's own
      // in-flight tweens.
      try {
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf("*")
        }
      } catch (error) {
        console.warn('GSAP cleanup failed:', error)
      }
    }
  }, [])

  // Format price to display properly
  const formatPrice = (price) => {
    return `Rs.${price}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
        <AwsomeHumansFooter />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
        <AwsomeHumansFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-screen overflow-x-hidden">
      <div className="w-screen overflow-x-hidden">
        <Header />
        
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="w-full py-16 bg-gradient-to-br from-gray-800 to-black text-white relative overflow-hidden"
          style={{ opacity: animationsReady ? (animationsInitialized.current ? 1 : 0) : 1 }}
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl overflow-hidden">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 break-words max-w-full">
                {colorInfo ? `${colorInfo.name.toUpperCase()} COLLECTION` : "COLOR COLLECTION"}
              </h1>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold break-words max-w-full">
                {colorInfo ? `${colorInfo.name} Products` : "Color Products"}
              </h2>
              <p className="text-gray-600 mt-2 break-words max-w-full">
                {filteredProducts.length} products available in {colorInfo ? colorInfo.name : "various colors"}
              </p>
            </div>

            {/* Filter section */}
            <div 
              ref={filterSectionRef}
              className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-12"
              style={{ opacity: animationsReady ? (animationsInitialized.current ? 1 : 0) : 1 }}
            >
              <div className="p-6 sm:p-8 flex flex-wrap gap-6 items-center">
                {/* Color indicator */}
                <div className="flex items-center gap-2 font-medium text-black">
                  <span className="text-gray-600">COLOR:</span>
                  <span className="font-bold">{colorInfo ? colorInfo.name.toUpperCase() : "ALL"}</span>
                </div>

                {/* Total count */}
                <div className="ml-auto text-black font-medium">
                  {filteredProducts.length} Total
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div ref={productsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((product, index) => (
                <Link
                  to={`/product/${product._id}?color=${product.color}`}
                  key={product.id}
                  state={{ selectedColor: product.color }}
                >
                  <div
                    ref={(el) => (productRefs.current[index] = el)}
                    className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                    style={{ 
                      opacity: animationsReady ? (animationsInitialized.current ? 1 : 0) : 1,
                      transform: animationsReady ? (animationsInitialized.current ? 'translateY(0)' : 'translateY(50px)') : 'none'
                    }}
                  >
                    {/* Product image */}
                    <div className="bg-gray-100 overflow-hidden aspect-[3/4.5]">
                      <img
                        src={product.primaryImage || "/placeholder.svg"}
                        alt={`${product.name} - ${product.color}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Product details */}
                    <div className="flex flex-col p-4">
                      {/* Product name */}
                      <h3 className="text-gray-900 font-medium text-base md:text-lg lg:text-xl mb-2">{product.name}</h3>

                      {/* Color and color count */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-700 text-xs md:text-sm">{product.color}</span>
                        <span className="text-gray-500 text-xs md:text-sm">{product.colorCount} Colors</span>
                      </div>

                      {/* Price */}
                      <div className="text-gray-900 font-bold text-sm md:text-base lg:text-lg">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-gray-800 to-black text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 break-words max-w-full">
              Find Your Perfect Style
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 break-words max-w-full">
              Explore our complete collection and discover more colors and styles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Shop All Products
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors"
              >
                Browse All Colors
              </Link>
            </div>
          </div>
        </section>

        <AwsomeHumansFooter />
      </div>
    </div>
  )
}