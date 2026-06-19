"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { X, ChevronLeft, ChevronRight, Check, Plus, Minus, Maximize2, Minimize2 } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import sizeChartImage0 from "/src/assets/sizes/Size chart -images-0.jpg";
import sizeChartImage1 from "/src/assets/sizes/Size chart -images-1.jpg";
import careInstructionsImage from "/src/assets/sizes/Care Instructions.jpg";

export default function ProductDetail({ product }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get color from URL and set it as initial selected color
  const colorFromUrl = searchParams.get('color')
  // Auto-select first color if only one color exists
  const initialColor = colorFromUrl || (product?.colors?.length > 0 ? product.colors[0].name : "")
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [selectedSize, setSelectedSize] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [validationError, setValidationError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [cartItems, setCartItems] = useState([])
  // Auto-select color if only one color or color from URL
  const [isColorSelected, setIsColorSelected] = useState(!!colorFromUrl || (product?.colors?.length === 1))
  
  // Track available sizes for the selected color
  const [availableSizes, setAvailableSizes] = useState({})
  const [sizeInventory, setSizeInventory] = useState({})
  
  // Organize images for rendering - using API data structure
  const [displayImages, setDisplayImages] = useState([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  const productRef = useRef(null)
  const lightboxRef = useRef(null)
  const successMessageRef = useRef(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [mouseStart, setMouseStart] = useState(null)
  const [mouseEnd, setMouseEnd] = useState(null)
  const mainImageRef = useRef(null)
  const [preloadedImages, setPreloadedImages] = useState(new Set())

// Add this function to preload images
const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(imageUrl => {
      if (preloadedImages.has(imageUrl)) {
        return Promise.resolve()
      }
      
      return new Promise((resolve) => {
      const img = new Image()
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, imageUrl]))
          resolve()
        }
        img.onerror = () => resolve() // Resolve even on error to prevent hanging
        img.src = imageUrl
      })
    })
  )
  }

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Set up initial available sizes and inventory based on product data
  useEffect(() => {
    if (product && product.inventory) {
      // Initialize available sizes map for each color
      const sizeAvailability = {}
      const inventoryBySize = {}
      
      // Process inventory data to determine which sizes are available for each color
      product.inventory.forEach(item => {
        if (!sizeAvailability[item.color]) {
          sizeAvailability[item.color] = {}
        }
        
        if (!inventoryBySize[item.color]) {
          inventoryBySize[item.color] = {}
        }
        
        // A size is available for a color if it has stock
        sizeAvailability[item.color][item.size] = item.stock > 0
        inventoryBySize[item.color][item.size] = item.stock
      })
      
      setAvailableSizes(sizeAvailability)
      setSizeInventory(inventoryBySize)
      
      // Auto-select first color if only one color exists
      if (product.colors && product.colors.length === 1 && !selectedColor) {
        const firstColor = product.colors[0].name
        setSelectedColor(firstColor)
        setIsColorSelected(true)
      }
      
      // If we already have a selected color, reset selected size if it's not available
      if (selectedColor && selectedSize) {
        const isCurrentSizeAvailable = sizeAvailability[selectedColor] && 
                                      sizeAvailability[selectedColor][selectedSize]
        
        if (!isCurrentSizeAvailable) {
          setSelectedSize(null)
        }
      }
    }
  }, [product])

  // Set up images based on API data
  useEffect(() => {
  if (!product) return;

  let imagesToLoad = [];

  // If color is selected (either from URL or user selection), show color-specific images
          if (isColorSelected) {
    // Find images for the selected color
            const colorImagesObj = product.colorImages?.find(ci => ci.color === selectedColor)
            const colorImages = colorImagesObj?.images || []
    imagesToLoad = colorImages.length > 0 ? colorImages : (product.defaultImages || [])
            } else {
    imagesToLoad = product.defaultImages || []
  }

  // Only reset index if we're switching to a different set of images
  const currentImageUrls = displayImages.map(img => img.url)
  const newImageUrls = imagesToLoad.map(img => img.url)
  const isDifferentImageSet = JSON.stringify(currentImageUrls) !== JSON.stringify(newImageUrls)
  if (isDifferentImageSet) {
          setCurrentImageIndex(0)
        }
  setDisplayImages(imagesToLoad)

  // Preload only the images for the current color in the background
  imagesToLoad.forEach(img => {
    if (!preloadedImages.has(img.url)) {
      const image = new window.Image()
      image.onload = () => setPreloadedImages(prev => new Set([...prev, img.url]))
      image.onerror = () => setPreloadedImages(prev => new Set([...prev, img.url])) // Mark as loaded to avoid spinner forever
      image.src = img.url
    }
  })
  }, [product, selectedColor, isColorSelected])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1400)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
 
    // GSAP animations
    gsap.from(productRef.current, {
      // Animation properties can be added here
    })

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)

    // GSAP animation for lightbox
    gsap.fromTo(lightboxRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
  }

  const closeLightbox = () => {
    gsap.to(lightboxRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setLightboxOpen(false),
    })
  }

  // Updated unified swipe handlers
  const handleSwipeStart = (clientX) => {
      setTouchStart(clientX)
      setTouchEnd(null)
      setMouseStart(clientX)
      setMouseEnd(null)
    setIsDragging(true)
  }

  const handleSwipeEnd = (clientX) => {
  const startPos = touchStart || mouseStart
    if (!startPos) return

    const distance = startPos - clientX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

      if (isLeftSwipe) {
        handleSlide('next')
      } else if (isRightSwipe) {
        handleSlide('prev')
      }

  // Reset all states
      setTouchStart(null)
      setTouchEnd(null)
      setMouseStart(null)
      setMouseEnd(null)
    setIsDragging(false)
  }

// REPLACE your existing onTouchStart
  const onTouchStart = (e) => {
    handleSwipeStart(e.targetTouches[0].clientX)
  }

// REPLACE your existing onTouchMove
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

// REPLACE your existing onTouchEnd
const onTouchEnd = () => {
    if (touchEnd) {
      handleSwipeEnd(touchEnd)
    }
  }

// REPLACE your existing onMouseDown
  const onMouseDown = (e) => {
    e.preventDefault()
    handleSwipeStart(e.clientX)
  }

// REPLACE your existing onMouseMove
  const onMouseMove = (e) => {
  if (!isDragging || !mouseStart) return
    e.preventDefault()
    setMouseEnd(e.clientX)
  }

// REPLACE your existing onMouseUp
  const onMouseUp = (e) => {
  if (!isDragging || !mouseStart) {
    setIsDragging(false)
    return
  }
  
    e.preventDefault()
    const currentMouseEnd = mouseEnd || e.clientX
    handleSwipeEnd(currentMouseEnd)
  }

// REPLACE your existing onMouseLeave
  const onMouseLeave = () => {
  if (isDragging) {
    setIsDragging(false)
    setTouchStart(null)
    setTouchEnd(null)
    setMouseStart(null)
    setMouseEnd(null)
    }
}

  // Unified slide animation for both mobile and desktop
  const handleSlide = (direction) => {
  if (isLoadingImages || displayImages.length <= 1) return
  
    const nextIndex = direction === 'next' 
      ? (currentImageIndex + 1) % displayImages.length
      : (currentImageIndex - 1 + displayImages.length) % displayImages.length
    
  // Since all images are preloaded, use consistent fast animation
    if (direction === 'next') {
      gsap.to(mainImageRef.current, {
        x: -100,
        opacity: 0,
      duration: 0.15,
        onComplete: () => {
          setCurrentImageIndex(nextIndex)
          gsap.fromTo(mainImageRef.current,
            { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.15 }
          )
        }
      })
    } else {
      gsap.to(mainImageRef.current, {
        x: 100,
        opacity: 0,
      duration: 0.15,
        onComplete: () => {
          setCurrentImageIndex(nextIndex)
          gsap.fromTo(mainImageRef.current,
            { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.15 }
          )
        }
      })
    }
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Helper function for validation
  const validateInputs = () => {
    // Reset validation error
    setValidationError("")
    
    // Validation checks
    // Only require color if product has multiple colors
    if (product.colors && product.colors.length > 1 && !selectedColor) {
      setValidationError("Please select a color")
      return false
    }
    if (!selectedSize) {
      setValidationError("Please select a size")
      return false
    }
    if (quantity <= 0) {
      setValidationError("Quantity must be greater than 0")
      return false
    }
    
    // Check if the selected size is available
    // If color is selected, check for that color, otherwise check any color
    if (selectedColor) {
      if (!availableSizes[selectedColor] || !availableSizes[selectedColor][selectedSize]) {
        setValidationError("Selected size is not available for this color")
        return false
      }
    } else {
      // Check if size is available in any color
      let sizeFound = false
      for (const color in availableSizes) {
        if (availableSizes[color]?.[selectedSize]) {
          sizeFound = true
          break
        }
      }
      if (!sizeFound) {
        setValidationError("Selected size is not available")
        return false
      }
    }
    
    // Check if there's sufficient stock
    const stock = selectedColor 
      ? (sizeInventory[selectedColor]?.[selectedSize] || 0)
      : (getSizeStock(selectedSize) || 0)
    if (stock < quantity) {
      setValidationError(`Only ${stock} items available in this size and color`)
      return false
    }
    
    return true
  }

  const validateAndAddToBag = () => {
    // Reset success message
    setSuccessMessage("")
    
    // Auto-select first color if only one color exists and none is selected
    let colorToUse = selectedColor
    if (!colorToUse && product.colors && product.colors.length === 1) {
      colorToUse = product.colors[0].name
      setSelectedColor(colorToUse)
      setIsColorSelected(true)
    }
    
    console.log("Validation Before")
    // Validate inputs
    if (!validateInputs()) {
      console.log("Validation Failed")
      return
    }
    console.log("Validation After")

    // Get selected color object for complete information
    const selectedColorObj = product.colors.find(color => color.name === colorToUse)
    
    // Find an appropriate image to use (use first image or default)
    const productImage = displayImages.length > 0 ? displayImages[0].url : ""
    
    // Create item object with ALL required information
    const item = {
      id: product._id,
      name: product.name,
      price: product.price,
      colorName: colorToUse,
      colorHex: selectedColorObj?.code || product.colors[0]?.code || "#000000",
      size: selectedSize,
      quantity: quantity,
      image: productImage,
      timestamp: new Date().toISOString(),
      totalPrice: product.price * quantity,
      material: product.material,
      category: product.category,
      description: product.description,
      availableSizes: colorToUse ? availableSizes[colorToUse] : {},
      sizeInventory: colorToUse ? sizeInventory[colorToUse] : {}
    }

    // GTM ADD TO CART EVENT
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "PKR",
        value: item.price * item.quantity,
        items: [
          {
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_variant: `${item.colorName} - ${item.size}`
          }
        ]
      }
    });
    console.log("Add to Cart fired!")
    if (window.fbq) {
      console.log("fbq active")
      window.fbq('track', 'AddToCart', {
        content_name: item.name,
        content_ids: [item.id],
        content_type: 'product',
        value: item.totalPrice,
        currency: 'PKR'
      });
    }

    try {
      // Read existing cart items
      const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
    
      // Check if item already exists in cart
      const existingItemIndex = existingCart.findIndex(
        cartItem => cartItem.id === item.id && 
                    cartItem.colorName === item.colorName && 
                    cartItem.size === item.size
      )

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        existingCart[existingItemIndex].quantity += item.quantity
        existingCart[existingItemIndex].totalPrice = existingCart[existingItemIndex].price * existingCart[existingItemIndex].quantity
      } else {
        // Add new item if it doesn't exist
        existingCart.push(item)
      }

      // Save updated cart
      localStorage.setItem('cartItems', JSON.stringify(existingCart))
      
      // Dispatch cart updated event
      window.dispatchEvent(new Event('cartUpdated'))

      // GTM ADD TO CART EVENT
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "add_to_cart",
        ecommerce: {
          currency: "PKR",
          value: item.price * item.quantity,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: item.quantity,
              item_variant: `${item.colorName} - ${item.size}`
            }
          ]
        }
      });
      
      // Clear error if any
      setValidationError("")
    } catch (error) {
      console.error("Error adding to cart:", error)
      setValidationError("Failed to add item to cart")
    }

    // Show success message with animation
    setSuccessMessage("Item added to bag successfully!")
    if (successMessageRef.current) {
      gsap.fromTo(
        successMessageRef.current, 
        { opacity: 0, y: -20 }, 
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        gsap.to(successMessageRef.current, { 
          opacity: 0, 
          y: -20, 
          duration: 0.5, 
          ease: "power2.in",
          onComplete: () => setSuccessMessage("")
        })
      }, 3000)
    }
  }

  const proceedToCheckout = () => {
    // First validate cart has items
    if (!cartItems.length) {
      setValidationError("Your bag is empty. Please add items first.")
      return
    }
    
    // Then validate current selections in case user wants to add the current item
    if (validateInputs()) {
      // Ask user if they want to add current item to cart before proceeding
      const addCurrentItem = window.confirm("Do you want to add the current item to your bag before checkout?")
      
      if (addCurrentItem) {
        validateAndAddToBag()
      }
      
      // Navigate to checkout page with cart data
      console.log("Proceeding to checkout with items:", cartItems)
      
      // Use React Router's navigate to go to checkout page
      navigate('/checkout')
    }
  }

  // Check if a size is available for the selected color
  const isSizeAvailable = (sizeName) => {
    // If no color is selected, check all colors for availability
    if (!selectedColor) {
      // Check if size is available in any color
      for (const color in availableSizes) {
        if (availableSizes[color]?.[sizeName]) {
          return true
        }
      }
      // Fallback to size object availability
      const sizeObj = product.sizes.find(size => size.name === sizeName)
      return sizeObj?.isAvailable || false
    }
    
    // If a color is selected, check if the size is available for that color
    return availableSizes[selectedColor]?.[sizeName] || false
  }
  
  // Check if a size has stock
  const getSizeStock = (sizeName) => {
    // If no color selected, get stock from first available color or sum all colors
    if (!selectedColor) {
      // Get stock from first color that has this size
      for (const color in sizeInventory) {
        if (sizeInventory[color]?.[sizeName]) {
          return sizeInventory[color][sizeName]
        }
      }
      return 0
    }
    return sizeInventory[selectedColor]?.[sizeName] || 0
  }

  // Handle color selection
  const handleColorSelect = (colorName) => {
    setIsColorSelected(true)
    setSelectedColor(colorName)
    
    // Reset size selection if the current size isn't available for the new color
    if (selectedSize && (!availableSizes[colorName] || !availableSizes[colorName][selectedSize])) {
      setSelectedSize(null)
    }
  }

  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false)
  const [isSizeChartMinimized, setIsSizeChartMinimized] = useState(false)
  const [currentSizeChartIndex, setCurrentSizeChartIndex] = useState(0)
  const sizeChartRef = useRef(null)

  const sizeChartImages = [
    sizeChartImage0,
    sizeChartImage1,
    careInstructionsImage
  ]

  const handleSizeChartNavigation = (direction) => {
    if (direction === 'next') {
      setCurrentSizeChartIndex((prev) => (prev + 1) % sizeChartImages.length)
    } else {
      setCurrentSizeChartIndex((prev) => (prev - 1 + sizeChartImages.length) % sizeChartImages.length)
    }
  }

  // Add size chart modal component
  const SizeChartModal = () => {
    if (!isSizeChartOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div 
          ref={sizeChartRef}
          className={`bg-white transition-all duration-300 ${
            isSizeChartMinimized ? 'w-64 h-48' : 'w-[90%] max-w-3xl h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white">
            <h3 className="text-lg font-semibold">Size Chart</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="p-1 bg-white hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 h-[calc(100%-4rem)] overflow-auto bg-white relative">
            {/* Navigation Arrows */}
            <button
              onClick={() => handleSizeChartNavigation('prev')}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => handleSizeChartNavigation('next')}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image */}
            <img
              src={sizeChartImages[currentSizeChartIndex]}
              alt={`Size Chart ${currentSizeChartIndex + 1}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />

           {/* Dots Indicator */}
           <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-3">
              {sizeChartImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSizeChartIndex(index)}
                  className={`w-3 h-3 rounded-full border-0 p-0 flex-shrink-0 transition-all duration-300 ${
                    index === currentSizeChartIndex 
                      ? "bg-black" 
                      : "bg-black/40 hover:bg-black/60"
                  }`}
                  style={{ 
                    minWidth: '12px', 
                    minHeight: '12px',
                    borderRadius: '50%'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle case where product data isn't loaded yet
  if (!product) {
    return <div>Loading product details...</div>
  }

  // Format price for display
  const formattedPrice = product.price
  
  // Calculate discount if applicable
  const discountPercentage = product.discount?.percentage || 0
  const hasDiscount = discountPercentage > 0
  
  // Determine if product has a badge
  const productBadge = product.category || ""

  return (
    <div className="bg-white min-h-screen w-full text-black" ref={productRef}>
      {/* Mobile/Tablet View (below 1400px) */}
      {isMobile ? (
        <div className="px-4 pt-4 pb-8 max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="mb-4 relative">
            {displayImages.length > 0 ? (
                <>
                  <div 
                  className="w-full max-w-md mx-auto aspect-[3/4] relative overflow-hidden"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                    onMouseLeave={onMouseLeave}
                  >
                  {preloadedImages.has(displayImages[currentImageIndex]?.url) ? (
                    <img
                      ref={mainImageRef}
                      src={displayImages[currentImageIndex]?.url || "/placeholder.svg"}
                      alt={displayImages[currentImageIndex]?.alt || product.name}
                      className="w-full h-full object-contain absolute top-0 left-0 cursor-pointer"
                      onClick={() => openLightbox(currentImageIndex)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 absolute top-0 left-0">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                  )}
                  </div>
                  
                  {/* Thumbnail strip for larger screens */}
                  <div className="hidden md:flex justify-center items-center space-x-2 mt-4 overflow-x-auto px-4">
                    {displayImages.map((image, index) => (
                      <div
                        key={index}
                        className={`w-16 h-16 lg:w-20 lg:h-20 border-2 ${
                          index === currentImageIndex ? "border-black" : "border-gray-200"
                        } cursor-pointer flex-shrink-0`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt || `Product view ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Dots indicator for mobile */}
                  <div className="flex md:hidden justify-center items-center space-x-2 mt-4">
                    {displayImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentImageIndex 
                            ? "bg-black scale-110" 
                            : "bg-black/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
            ) : (
              <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            )}
          </div>
  
          {/* Product Info Section */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">{product.name}</h1>
            {product.material && (
              <div className="mb-2 text-sm md:text-base">{product.material}</div>
            )}
  
            <p className="text-2xl md:text-3xl font-bold mb-4 lg:mb-6">Rs.{formattedPrice}</p>
  
            {productBadge && (
              <div className="inline-block px-3 py-1 md:px-4 md:py-2 bg-white text-sm md:text-base font-medium mb-4 lg:mb-6 border border-gray-200 rounded-md">
                {productBadge}
              </div>
            )}
  
            {/* Color Selection */}
            <div className="mb-4 lg:mb-6">
              <p className="font-medium mb-2 md:mb-3 text-base md:text-lg">
                COLOR {isColorSelected && <span className="ml-2 font-normal">{selectedColor}</span>}
              </p>
              <div className="flex gap-1.5 md:gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color._id}
                    className={`w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full p-0 flex items-center justify-center transition-all ${
                      selectedColor === color.name ? "ring-2 ring-black" : ""
                    }`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => handleColorSelect(color.name)}
                    disabled={!color.isAvailable}
                  >
                  </button>
                ))}
              </div>
            </div>
  
            {/* Size Selection */}
            <div className="mb-4 lg:mb-6">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <p className="font-medium text-base md:text-lg">SIZE</p>
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-gray-600 bg-white underline text-sm md:text-base"
                >
                  Size Chart
                </button>
              </div>
              <div className="flex gap-3 md:gap-4 flex-wrap">
                {product.sizes.map((size) => {
                  const sizeAvailable = isSizeAvailable(size.name);
                  const sizeStock = getSizeStock(size.name);
                  
                  return (
                    <button
                      key={size._id}
                      className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center border text-sm md:text-base ${
                        selectedSize === size.name 
                          ? "border-black bg-white text-black" // CHANGED: Remove bg-black text-white, keep bg-white text-black
                          : "border-gray-300 bg-white text-black" // ADDED: Explicit bg-white text-black for unselected
                      } ${
                        (!sizeAvailable || sizeStock === 0)
                          ? "opacity-60 cursor-not-allowed" 
                          : "hover:border-black" // CHANGED: Remove bg-white text-black from here since it's now explicit above
                      } text-center relative rounded-md transition-all`}
                      onClick={() => sizeAvailable && sizeStock > 0 && setSelectedSize(size.name)}
                      disabled={!sizeAvailable || sizeStock === 0}
                    >
                      {size.name}
                      {sizeAvailable && sizeStock === 0 && (
                        <span className="absolute -bottom-6 left-0 right-0 text-xs text-red-500">
                          Out of stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

  
            {/* Quantity Selector */}
            <div className="mb-4 lg:mb-6">
              <p className="font-medium mb-2 md:mb-3 text-base md:text-lg">QUANTITY</p>
              <div className="flex items-center border border-gray-300 inline-flex rounded-md">
                <button 
                  onClick={decrementQuantity} 
                  className="px-3 py-2 md:px-4 md:py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 md:px-6 md:py-3 min-w-[40px] text-center font-medium">
                  {quantity}
                </span>
                <button 
                  onClick={incrementQuantity} 
                  className="px-3 py-2 md:px-4 md:py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
  
            {/* Validation Error */}
            {validationError && (
              <div className="mb-4 lg:mb-6 text-red-500 text-sm md:text-base p-3 bg-red-50 border border-red-200 rounded-md">
                {validationError}
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div 
                className="mb-4 lg:mb-6 bg-green-100 text-green-800 p-3 border border-green-200 rounded-md"
                ref={successMessageRef}
              >
                {successMessage}
              </div>
            )}
  
            {/* Add to Bag Button */}
            <button 
              className="w-full py-4 md:py-5 bg-black text-white font-medium mb-4 lg:mb-6 rounded-none hover:bg-gray-800 transition-colors text-base md:text-lg"
              onClick={validateAndAddToBag}
            >
              ADD TO BAG
            </button>
  
            {/* Product Info */}
            <p className="text-center text-gray-600 text-sm md:text-base mb-4 lg:mb-6">
              {product.material || ""}
            </p>
  
            <p className="text-center font-medium text-sm md:text-base lg:text-lg">
              FREE SHIPPING FOR Rs.5000+ ORDERS AND FREE RETURNS
            </p>
  
            {/* Product Description */}
            <div className="mt-8 lg:mt-12 border-t border-gray-200 pt-8 lg:pt-12">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">
                Product Description
              </h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-base md:text-lg">
                {product.description || "No description available."}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop View (1400px and above) */
        <div className="mx-10 px-20 py-8 flex">
          {/* Thumbnail Gallery */}
          <div className="w-45 mr-6">
            {isLoadingImages ? (
              <div className="w-40 h-40 mb-4 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : (
              displayImages.slice(0, 7).map((image, index) => (
                <div
                  key={index}
                  className={`w-40 h-40 mb-4 border ${currentImageIndex === index ? "border-gray-300" : "border-gray-200"} cursor-pointer`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt || `Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))
            )}
          </div>
          
          {/* Main Image */}
          <div className="flex-1 relative mr-20 ml-10">
            {displayImages.length > 0 ? (
                <div 
                  className="relative w-[95%] h-[80%] cursor-grab active:cursor-grabbing select-none"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                style={{ userSelect: 'none' }}
                >
                {preloadedImages.has(displayImages[currentImageIndex]?.url) ? (
                  <img
                    ref={mainImageRef}
                    src={displayImages[currentImageIndex]?.url || "/placeholder.svg"}
                    alt={displayImages[currentImageIndex]?.alt || product.name}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                    onClick={(e) => {
                      if (!isDragging && Math.abs((mouseStart || 0) - e.clientX) < 5) {
                        openLightbox(currentImageIndex)
                      }
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 absolute top-0 left-0">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
                </div>
                )}
              </div>
            ) : (
              <div className="w-[95%] h-[80%] flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
              </div>
            )}
          </div>
  
          {/* Product Details - Desktop */}
          <div className="w-1/3 pl-12">
            <h1 className="text-3xl font-bold mb-1">{product.name}</h1>
            {product.material && (
              <div className="mb-2 text-sm">{product.material}</div>
            )}
  
            <p className="text-2xl font-bold mb-8">Rs.{formattedPrice}</p>
  
            {productBadge && (
              <div className="inline-block px-4 py-1 bg-white text-sm font-medium mb-8 border border-gray-200 rounded-md">
                {productBadge}
              </div>
            )}
  
            <div className="mb-8">
              <p className="font-medium mb-2">
                COLOR {isColorSelected && <span className="ml-2 font-normal">{selectedColor}</span>}
              </p>
              <div className="flex gap-1.5">
                {product.colors.map((color) => (
                  <button
                    key={color._id}
                    className={`w-6 h-6 rounded-full p-0 flex items-center justify-center ${selectedColor === color.name ? "ring-1 ring-black" : ""}`}
                    style={{ backgroundColor: color.code }}
                    onClick={() => handleColorSelect(color.name)}
                    disabled={!color.isAvailable}
                  >
                  </button>
                ))}
              </div>
            </div>
  
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">SIZE</p>
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-gray-600 underline bg-white"
                >
                  Size Chart
                </button>
              </div>
              <div className="flex gap-4">
                {product.sizes.map((size) => {
                  const sizeAvailable = isSizeAvailable(size.name);
                  const sizeStock = getSizeStock(size.name);
                  
                  return (
                    <button
                      key={size._id}
                      className={`w-10 h-10 flex items-center justify-center border ${
                        selectedSize === size.name 
                          ? "border-black" 
                          : "border-gray-300"
                      } ${
                        (!sizeAvailable || sizeStock === 0)
                          ? "opacity-60 cursor-not-allowed" 
                          : "bg-white text-black"
                      } text-center relative rounded-md`}
                      onClick={() => sizeAvailable && sizeStock > 0 && setSelectedSize(size.name)}
                      disabled={!sizeAvailable || sizeStock === 0}
                    >
                      {size.name}
                      {sizeAvailable && sizeStock === 0 && <span className="block text-xs">Out of stock</span>}
                    </button>
                  );
                })}
              </div>
            </div>
  
            {/* Quantity Selector */}
            <div className="mb-8">
              <p className="font-medium mb-3">QUANTITY</p>
              <div className="flex items-center border border-gray-300 inline-flex rounded-md">
                <button 
                  onClick={decrementQuantity} 
                  className="px-3 py-2 bg-white"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 min-w-[40px] text-center">{quantity}</span>
                <button 
                  onClick={incrementQuantity} 
                  className="px-3 py-2 bg-white"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
  
            {/* Validation Error */}
            {validationError && (
              <div className="mb-6 text-red-500 text-sm">{validationError}</div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div 
                className="mb-6 bg-green-100 text-green-800 p-2 border border-green-200"
                ref={successMessageRef}
              >
                {successMessage}
              </div>
            )}
  
            <button 
              className="w-full py-4 bg-black text-white rounded-none font-medium text-sm mb-4"
              onClick={validateAndAddToBag}
            >
              ADD TO BAG
            </button>
  
            <p className="text-center text-gray-600 text-sm mb-6">{product.material || ""}</p>
  
            <p className="text-center text-sm font-medium">FREE SHIPPING FOR Rs.5000+ ORDERS AND FREE RETURNS</p>
  
            {/* Product Description */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold mb-6">Product Description</h2>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description || "No description available."}
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* Lightbox - remains the same */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex bg-white items-center justify-center" ref={lightboxRef}>
          <button className="absolute top-4 right-4 p-2 bg-white text-black rounded-full" onClick={closeLightbox}>
            <X size={50} />
          </button>
  
          <button
            className="absolute bg-white text-black left-4 rounded-full top-1/2 transform -translate-y-1/2 p-2"
            onClick={() => handleSlide('prev')}
          >
            <ChevronLeft size={50} />
          </button>
  
          {displayImages.length > 0 && (
            <img
              src={displayImages[currentImageIndex]?.url || "/placeholder.svg"}
              alt={displayImages[currentImageIndex]?.alt || product.name}
              className="lightbox-image max-h-[80vh] max-w-[80vw]"
              loading="lazy"
            />
          )}
  
          <button
            className="absolute right-4 bg-white text-black rounded-full top-1/2 transform -translate-y-1/2 p-2"
            onClick={() => handleSlide('next')}
          >
            <ChevronRight size={50} />
          </button>
  
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {displayImages.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? "bg-black scale-110" 
                    : "bg-black/40"
                }`}
              />
            ))}
          </div>
        </div>
      )}
      <SizeChartModal />
    </div>
  )
}
