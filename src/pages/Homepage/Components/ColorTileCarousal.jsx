"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useNavigate } from "react-router-dom"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const ColorTileCarousel = () => {
  const navigate = useNavigate()
  const [colorTiles, setColorTiles] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(0)
  const [isTouching, setIsTouching] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const carouselRef = useRef(null)
  const intervalRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const directionRef = useRef("next")

  // Fetch color tiles from API
  useEffect(() => {
    const fetchColorTiles = async () => {
      try {
        const response = await fetch('https://steth-backend.onrender.com/api/color-tiles/')
        const data = await response.json()
        
        if (data.success) {
          setColorTiles(data.data)
          setPrevIndex(data.data.length - 1)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching color tiles:', error)
        setIsLoading(false)
      }
    }

    fetchColorTiles()
  }, [])

  // Function to handle color tile click
  const handleColorTileClick = (colorName) => {
    navigate(`/color-products/${encodeURIComponent(colorName.toLowerCase())}`)
  }

  // Function to move to the next slide
  const nextSlide = () => {
    if (isAnimating) return

    directionRef.current = "next"
    setPrevIndex(activeIndex)
    setActiveIndex((prev) => (prev === colorTiles.length - 1 ? 0 : prev + 1))
  }

  // Function to move to the previous slide
  const prevSlide = () => {
    if (isAnimating) return

    directionRef.current = "prev"
    setPrevIndex(activeIndex)
    setActiveIndex((prev) => (prev === 0 ? colorTiles.length - 1 : prev - 1))
  }

  // Function to handle dot navigation
  const goToSlide = (index) => {
    if (isAnimating || index === activeIndex) return

    // Determine direction based on index
    if (
      (index > activeIndex && !(activeIndex === 0 && index === colorTiles.length - 1)) ||
      (activeIndex === colorTiles.length - 1 && index === 0)
    ) {
      directionRef.current = "next"
    } else {
      directionRef.current = "prev"
    }

    setPrevIndex(activeIndex)
    setActiveIndex(index)
  }

  // Touch handlers for manual sliding
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsTouching(true)
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    setIsTouching(false)
    const diff = touchStartX.current - touchEndX.current
    // If swipe distance is significant
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - move to next
        nextSlide()
      } else {
        // Swipe right - move to previous
        prevSlide()
      }
    }
  }

  // Setup animations
  useEffect(() => {
    // Animation for sliding tiles
    if (carouselRef.current) {
      const tiles = carouselRef.current.querySelectorAll(".color-tile")
      const prevTile = tiles[prevIndex]
      const activeTile = tiles[activeIndex]

      if (prevTile && activeTile) {
        setIsAnimating(true)

        if (directionRef.current === "next") {
          // Next slide animation (prev exits left, new enters from right)
          gsap.set(prevTile, {
            x: 0,
            opacity: 1,
            zIndex: 10,
          })
          gsap.set(activeTile, {
            x: "100%",
            opacity: 1,
            zIndex: 5,
          })

          const tl = gsap.timeline({
            onComplete: () => {
              setIsAnimating(false)
            },
          })

          tl.to(prevTile, {
            x: "-100%",
            duration: 0.8,
            ease: "power2.inOut",
          })

          tl.to(
            activeTile,
            {
              x: 0,
              duration: 0.8,
              ease: "power2.inOut",
            },
            "-=0.8",
          )
        } else {
          // Previous slide animation (prev exits right, new enters from left)
          gsap.set(prevTile, {
            x: 0,
            opacity: 1,
            zIndex: 10,
          })
          gsap.set(activeTile, {
            x: "-100%",
            opacity: 1,
            zIndex: 5,
          })

          const tl = gsap.timeline({
            onComplete: () => {
              setIsAnimating(false)
            },
          })

          tl.to(prevTile, {
            x: "100%",
            duration: 0.8,
            ease: "power2.inOut",
          })

          tl.to(
            activeTile,
            {
              x: 0,
              duration: 0.8,
              ease: "power2.inOut",
            },
            "-=0.8",
          )
        }
      }
    }
  }, [activeIndex, prevIndex])

  // Auto-slide effect
  useEffect(() => {
    // Auto-slide functionality
    intervalRef.current = setInterval(() => {
      if (!isTouching && !isAnimating) {
        nextSlide()
      }
    }, 5000) // Longer interval for better viewing of each slide

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTouching, isAnimating])

  // #2 - React attaches JSX onTouchMove as a non-passive listener (so it
  // can support preventDefault), which forces the browser to wait on the
  // handler before it can start scroll compositing. This handler never
  // calls preventDefault, so it's attached manually here as passive:true
  // instead - removed from the JSX below.
  useEffect(() => {
    const node = carouselRef.current
    if (!node) return

    node.addEventListener("touchmove", handleTouchMove, { passive: true })
    return () => node.removeEventListener("touchmove", handleTouchMove)
  }, [])

  if (isLoading) {
    return (
      <div className="relative w-full bg-white py-8 my-20">
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  if (colorTiles.length === 0) {
    return (
      <div className="relative w-full bg-white py-8 my-20">
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-500">No color tiles available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full bg-white py-8 my-20">
      <div
        ref={carouselRef}
        className="relative w-full flex flex-col items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
          {colorTiles.map((tile, index) => (
            <div
              key={tile._id}
              className={`color-tile absolute inset-0 mx-4 sm:mx-8 md:mx-12 flex justify-center items-center cursor-pointer group
                          ${index !== activeIndex && index !== prevIndex ? "opacity-0" : "opacity-100"}`}
              style={{ zIndex: index === activeIndex ? 5 : index === prevIndex ? 10 : 0 }}
              onClick={() => handleColorTileClick(tile.colorName)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleColorTileClick(tile.colorName)
              }}
            >
              <div className="w-full h-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-5xl relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    style={{
                      backgroundImage: `url(${tile.imageUrl})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center items-center space-x-2 mt-6">
          {colorTiles.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? "bg-black scale-125" 
                  : "bg-black/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 text-black bg-transparent rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 items-center justify-center text-2xl sm:text-3xl md:text-4xl z-20"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 border-none text-black bg-transparent rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 items-center justify-center text-2xl sm:text-3xl md:text-4xl z-20"
          aria-label="Next slide"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default ColorTileCarousel