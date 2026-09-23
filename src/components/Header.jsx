"use client"

import { useState, useEffect, useRef, useContext } from "react"
import gsap from "gsap"
import { AuthContext } from "../pages/Login&Signup/AuthContext"
import { API_BASE_URL } from "../config/api"
import { useCatalogTaxonomy } from "../hooks/useCatalogTaxonomy"
import { useCartDrawer } from "../context/CartDrawerContext"
import { useAccountOverlay } from "../context/AccountContext"
import MegaMenu from "./Navbar/MegaMenu"
import AboutDropdown from "./Navbar/AboutDropdown"
import { trackSearch } from "../lib/analytics"

// `transparent`: used on pages whose first section is a full-bleed hero
// (Homepage, MensPage, WomenPage) so the nav row can float over the photo -
// see the Savile Row design system's navbar spec (sleek, minimal, no logo
// mark, transparent-until-scrolled-or-hovered). Every other page renders a
// normal solid, in-flow sticky nav, same as before this rebuild.
const Header = ({ className = "", transparent = false }) => {
  const { isLoggedIn, openAuthPanel } = useContext(AuthContext)
  const { openCartDrawer } = useCartDrawer()
  const { openAccountOverlay } = useAccountOverlay()
  const { fabrics, categories, colors, loading: taxonomyLoading } = useCatalogTaxonomy()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null) // 'Women' | 'Men' | 'About' | null
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null) // 'Women' | 'Men' | 'About' | null
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [navHovered, setNavHovered] = useState(false)
  const headerRef = useRef(null)
  const wordmarkRef = useRef(null)
  const navItemsRef = useRef([])
  const searchRef = useRef(null)
  const iconsRef = useRef(null)
  const sliderRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isSearchOverlayActive, setIsSearchOverlayActive] = useState(false)

  // Add effect to track cart items count
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]")
      // Count unique items instead of total quantities
      const uniqueItems = new Set(cartItems.map((item) => `${item.id}-${item.colorName}-${item.size}`))
      setCartCount(uniqueItems.size)
    }

    // Initial count
    updateCartCount()

    // Listen for storage changes
    window.addEventListener("storage", updateCartCount)

    // Also listen for custom event when cart is updated
    window.addEventListener("cartUpdated", updateCartCount)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", updateCartCount)
    }
  }, [])

  // Only relevant in transparent mode: once the visitor scrolls past the
  // hero, the nav switches from an absolutely-positioned overlay to a fixed,
  // solid bar - otherwise it would scroll away with the hero instead of
  // staying reachable.
  useEffect(() => {
    if (!transparent) return
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [transparent])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    setMobileExpandedSection(null)
  }

  const toggleMobileSection = (section) => {
    setMobileExpandedSection((prev) => (prev === section ? null : section))
  }

  // Prevent body scroll while the mobile menu is open, restoring whatever
  // was there before rather than hardcoding "auto" - matches the
  // save/restore pattern AccountOverlay/AuthPanel/CartDrawer already use.
  // (The previous version set `document.body.style.overflow` directly
  // inside toggleMenu, plus a separate unconditional-on-unmount cleanup
  // effect that ran regardless of whether the menu was ever opened - under
  // React StrictMode's dev double-invoke, that cleanup fired once on every
  // mount, leaving body with a stray inline `overflow: auto` permanently.
  // That inline style is exactly what breaks `position: sticky` sitewide,
  // since it makes body a CSS scroll container even though it never
  // actually scrolls independently of the window.)
  useEffect(() => {
    if (!isMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  useEffect(() => {
    // Text Slider Animation
    const slider = sliderRef.current
    if (!slider) return

    const sliderContent = slider.querySelector(".slider-content")
    if (!sliderContent) return

    // Create multiple copies for smoother transition
    const items = sliderContent.querySelectorAll(".slider-item")
    if (!items.length) return

    // Clear existing content and create a proper loop
    sliderContent.innerHTML = ""

    // Add multiple copies for a smoother infinite loop
    for (let i = 0; i < 4; i++) {
      items.forEach((item) => {
        sliderContent.appendChild(item.cloneNode(true))
      })
    }

    // Set initial position
    gsap.set(sliderContent, { x: 0 })

    // Create the infinite scroll animation
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "linear" },
    })

    // Calculate the width of a single set of items
    const singleSetWidth = sliderContent.scrollWidth / 4

    tl.to(sliderContent, {
      x: -singleSetWidth,
      duration: 50, // Increased duration to reduce speed (was 8)
      ease: "linear", // Use linear for smooth constant speed
      onComplete: () => {
        // Reset position without animation for seamless loop
        gsap.set(sliderContent, { x: 0 })
      },
    })

    // Cleanup
    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    // GSAP animations on mount for header elements
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
      },
    )

    gsap.fromTo(
      wordmarkRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        delay: 0.3,
        ease: "power2.out",
      },
    )

    // Animate nav items one by one
    navItemsRef.current.forEach((item, index) => {
      gsap.fromTo(
        item,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          delay: 0.4 + index * 0.1,
          ease: "power2.out",
        },
      )
    })

    // Opacity-only fade-in - animating `width` here used to permanently
    // override the Tailwind width class with an inline style once the
    // tween finished (GSAP sets inline styles, which beat any CSS class),
    // silently undoing whatever responsive width rule was in place.
    gsap.fromTo(
      searchRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        delay: 0.7,
        ease: "power2.inOut",
      },
    )

    gsap.fromTo(
      iconsRef.current,
      { x: 20, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.5,
        delay: 0.9,
        ease: "power2.out",
      },
    )
  }, [])

  // Animation for mobile menu
  useEffect(() => {
    if (isMenuOpen) {
      gsap.fromTo(
        ".mobile-menu-container",
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
      )
    }
  }, [isMenuOpen])

  // Debounced search function
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300) // 300ms delay for debouncing

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const performSearch = async (query) => {
    if (!query.trim()) return

    setIsSearching(true)
    trackSearch(window.location.pathname, query.trim())
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()

      if (data.success && data.data) {
        const filteredResults = data.data.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.gender.toLowerCase().includes(query.toLowerCase()),
        )

        setSearchResults(filteredResults.slice(0, 5)) // Limit to 5 results
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleResultClick = (productId) => {
    // Navigate to product page or handle result click
    window.location.href = `/product/${productId}`
    setShowResults(false)
    setSearchQuery("")
  }

  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200)
  }

  // Whether the nav should currently render as a solid bar. Always true off
  // the hero pages; on a hero page it's true once scrolled past the hero or
  // while the visitor's cursor is over the bar.
  const solid = !transparent || scrolled || navHovered
  const overlay = transparent && !scrolled

  const navLinkClass = `font-archivo text-xs font-medium uppercase tracking-[0.18em] transition-colors whitespace-nowrap no-underline ${
    solid ? "text-ink hover:text-claret" : "text-paper hover:text-chalk"
  }`

  const iconClass = `transition-colors ${solid ? "text-ink hover:text-claret" : "text-paper hover:text-chalk"}`

  return (
    <>
      {/* Flair - the site-wide promise band, always above the navbar. */}
      <div className="w-full bg-claret text-shirting overflow-hidden h-9 relative z-50">
        <div ref={sliderRef} className="h-9 flex items-center">
          <div className="slider-content flex whitespace-nowrap">
            <div className="slider-item flex-shrink-0 ml-10 mr-10 font-archivo text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] py-2">
              No compromise on your experience! No questions asked return within 7 days.
            </div>
            <div className="slider-item flex-shrink-0 ml-10 mr-10 font-archivo text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] py-2">
              No compromise on your experience! No questions asked return within 7 days.
            </div>
            <div className="slider-item flex-shrink-0 ml-10 mr-10 font-archivo text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] py-2">
              No compromise on your experience! No questions asked return within 7 days.
            </div>
            <div className="slider-item flex-shrink-0 ml-10 mr-10 font-archivo text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] py-2">
              No compromise on your experience! No questions asked return within 7 days.
            </div>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => setNavHovered(false)}
        className={`w-full z-40 transition-colors duration-300 ${
          overlay
            ? "absolute top-9 left-0 right-0"
            : transparent
            // Once scrolled past the hero, `sticky` would be bounded by the
            // small Header+Hero wrapper it sits in (see Homepage.jsx) and
            // run out of containing block long before the rest of the page
            // does - `fixed` is bounded by the viewport instead, so it
            // stays put for the remainder of the page.
            ? "fixed top-0 left-0 right-0"
            : "sticky top-0"
        } ${solid ? "bg-shirting border-b border-hairline" : "bg-transparent border-b border-transparent"} ${className}`}
      >
        {/* Desktop nav - single sleek row: links left, wordmark centered, icons right */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center py-4 px-[clamp(1.5rem,3vw,3rem)]">
          <nav className="flex items-center gap-x-[clamp(1rem,2vw,2.25rem)] justify-self-start">
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("Women")}
              onMouseLeave={() => setActiveDropdown((prev) => (prev === "Women" ? null : prev))}
              ref={(el) => (navItemsRef.current[0] = el)}
            >
              <a href="/women" className={navLinkClass}>
                Women
              </a>
              {activeDropdown === "Women" && (
                <MegaMenu gender="Women" categories={categories} fabrics={fabrics} colors={colors} loading={taxonomyLoading} />
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("Men")}
              onMouseLeave={() => setActiveDropdown((prev) => (prev === "Men" ? null : prev))}
              ref={(el) => (navItemsRef.current[1] = el)}
            >
              <a href="/men" className={navLinkClass}>
                Men
              </a>
              {activeDropdown === "Men" && (
                <MegaMenu gender="Men" categories={categories} fabrics={fabrics} colors={colors} loading={taxonomyLoading} />
              )}
            </div>

            <a href="/rewards" className={navLinkClass} ref={(el) => (navItemsRef.current[2] = el)}>
              Rewards
            </a>

            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("About")}
              onMouseLeave={() => setActiveDropdown((prev) => (prev === "About" ? null : prev))}
              ref={(el) => (navItemsRef.current[3] = el)}
            >
              <a href="/aboutus" className={navLinkClass}>
                About STETH
              </a>
              {activeDropdown === "About" && <AboutDropdown />}
            </div>

            {/* Hamburger for the narrow mid-range where the full row can't fit */}
            <button
              onClick={toggleMenu}
              className={`lg:hidden p-1 transition-colors ${solid ? "text-ink" : "text-paper"}`}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>

          <a href="/" ref={wordmarkRef} className="justify-self-center no-underline">
            <span className="font-caslon text-2xl lg:text-3xl tracking-[0.1em] leading-none" style={{ color: solid ? "#1B2440" : "#EFECE4" }}>
              STETH
            </span>
          </a>

          <div className="flex items-center justify-end gap-3 lg:gap-5 justify-self-end">
            {/* Desktop Search - Responsive sizing */}
            {!isSearchOverlayActive ? (
              <div className="relative w-[clamp(120px,14vw,220px)] shrink-0 hidden lg:block" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    setIsSearchOverlayActive(true)
                    handleSearchFocus()
                  }}
                  className={`w-full px-3 py-1.5 pl-9 text-sm font-spectral focus:outline-none transition-colors border-b ${
                    solid
                      ? "bg-transparent border-hairline text-ink placeholder:text-flannel/60 focus:border-claret"
                      : "bg-transparent border-paper/50 text-paper placeholder:text-paper/70 focus:border-paper"
                  }`}
                />
                <svg
                  className={`absolute left-2.5 top-2 h-4 w-4 ${solid ? "text-flannel/60" : "text-paper/70"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            ) : null}

            {/* Search icon trigger for narrower desktop widths */}
            <button
              type="button"
              onClick={() => setIsSearchOverlayActive(true)}
              className={`lg:hidden ${iconClass}`}
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Full Screen Search Overlay */}
            {isSearchOverlayActive && (
              <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999]">
                <div className="max-w-2xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search products, category, gender ..."
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                        onFocus={handleSearchFocus}
                        onBlur={(e) => {
                          if (!e.relatedTarget?.closest(".search-overlay-content")) {
                            setTimeout(() => {
                              setShowResults(false)
                            }, 200)
                          }
                        }}
                        className="w-full px-4 lg:px-6 py-2.5 lg:py-3 pl-12 lg:pl-14 pr-4 lg:pr-6 text-sm lg:text-base font-spectral bg-shirting text-ink focus:outline-none border border-hairline"
                        autoFocus
                      />
                      <svg
                        className="absolute left-4 lg:left-5 top-3 lg:top-4 h-4 lg:h-5 w-4 lg:w-5 text-flannel/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    <button
                      onClick={() => {
                        setIsSearchOverlayActive(false)
                        setSearchQuery("")
                        setSearchResults([])
                        setShowResults(false)
                      }}
                      className="p-2 transition-colors bg-shirting hover:bg-paper border border-hairline"
                      title="Close search"
                    >
                      <svg className="h-4 lg:h-5 w-4 lg:w-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Search Results in Overlay */}
                  {showResults && (
                    <div className="search-overlay-content mt-3 lg:mt-4 bg-shirting border border-hairline shadow-lg max-h-72 lg:max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 lg:p-6 text-center text-flannel/70">
                          <div className="animate-spin rounded-full h-5 lg:h-6 w-5 lg:w-6 border-b-2 border-navy mx-auto"></div>
                          <span className="mt-2 lg:mt-3 block text-xs lg:text-sm font-spectral">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="p-2 lg:p-3">
                          <h3 className="font-archivo text-[11px] font-semibold uppercase tracking-[0.18em] text-ink mb-2 lg:mb-3 px-1">Search Results</h3>
                          <div className="space-y-1 lg:space-y-2">
                            {searchResults.map((product) => (
                              <div
                                key={product._id}
                                onClick={() => {
                                  handleResultClick(product._id)
                                  setIsSearchOverlayActive(false)
                                }}
                                className="flex items-center p-2 lg:p-3 hover:bg-paper cursor-pointer border border-hairline transition-colors"
                              >
                                <img
                                  src={product.defaultImages[0]?.url || "/placeholder.svg?height=40&width=40"}
                                  alt={product.name}
                                  className="w-8 lg:w-10 h-8 lg:h-10 object-cover mr-2 lg:mr-3 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs lg:text-sm font-spectral font-medium text-ink truncate">{product.name}</p>
                                  <p className="font-archivo text-[10px] lg:text-[11px] tracking-wide text-flannel/70 mt-0.5">
                                    {product.category} • {product.gender} • PKR {product.price.toLocaleString()}
                                  </p>
                                </div>
                                <svg
                                  className="h-3 lg:h-4 w-3 lg:w-4 text-flannel/60"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="p-4 lg:p-6 text-center text-flannel/70">
                          <svg
                            className="h-6 lg:h-8 w-6 lg:w-8 text-chalk mx-auto mb-2 lg:mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p className="text-xs lg:text-sm font-spectral">No products found for "{searchQuery}"</p>
                          <p className="text-xs mt-1 font-spectral">Try searching with different keywords</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 lg:gap-5" ref={iconsRef}>
              {isLoggedIn ? (
                <a
                  href="/profile"
                  onClick={(e) => {
                    e.preventDefault()
                    openAccountOverlay("profile")
                  }}
                  className={iconClass}
                  title="Profile"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthPanel("login")}
                  className={`font-archivo text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                    solid ? "text-ink hover:text-claret" : "text-paper hover:text-chalk"
                  }`}
                >
                  Login
                </button>
              )}
              <a
                href="/cart"
                onClick={(e) => {
                  e.preventDefault()
                  openCartDrawer()
                }}
                className={`relative ${iconClass}`}
                title="Cart"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-claret text-shirting text-[10px] h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <button onClick={toggleMenu} className={`p-2 transition-colors z-50 ${solid ? "text-ink" : "text-paper"}`}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <a href="/" className="flex items-center no-underline">
            <span className="font-caslon text-xl tracking-[0.1em]" style={{ color: solid ? "#1B2440" : "#EFECE4" }}>
              STETH
            </span>
          </a>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsSearchOverlayActive(true)} className={iconClass} aria-label="Search">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <a
              href="/cart"
              onClick={(e) => {
                e.preventDefault()
                openCartDrawer()
              }}
              className={`relative ${iconClass}`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-claret text-shirting text-[10px] h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Mobile Menu Overlay - Simplified */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-shirting z-[9999]">
            {/* Top Navigation */}
            <div className="border-b border-hairline">
              <div className="px-4 py-3 flex items-center justify-between">
                <button onClick={toggleMenu} className="p-2 bg-shirting">
                  <svg className="h-6 w-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <a href="/" className="flex items-center no-underline">
                  <span className="font-caslon text-xl tracking-[0.1em] text-navy">STETH</span>
                </a>
                <div className="w-6"></div> {/* Spacer for alignment */}
              </div>
            </div>

            {/* Simplified Mobile Menu */}
            <div className="h-[calc(100vh-120px)] overflow-y-auto px-4 py-4 bg-shirting">
              <nav className="space-y-2 sm:space-y-3">
                {["Women", "Men"].map((gender) => (
                  <div key={gender} className="border-b border-hairline">
                    <button
                      type="button"
                      onClick={() => toggleMobileSection(gender)}
                      className="w-full flex items-center justify-between font-archivo text-base font-semibold uppercase tracking-[0.14em] py-3 text-navy px-2"
                    >
                      {gender}
                      <span className="text-sm">{mobileExpandedSection === gender ? "−" : "+"}</span>
                    </button>
                    {mobileExpandedSection === gender && (
                      <div className="pb-4 px-2 space-y-4">
                        <div>
                          <h4 className="font-archivo text-[11px] font-semibold text-flannel/70 uppercase tracking-[0.2em] mb-2">Shop By Color</h4>
                          <div className="flex flex-wrap gap-2">
                            {colors.map((color) => (
                              <a
                                key={color._id}
                                href={`/${gender.toLowerCase()}?colorRefs=${color._id}`}
                                className="flex items-center gap-1.5 text-sm font-spectral text-ink py-1 no-underline"
                              >
                                <span
                                  className="w-3.5 h-3.5 inline-block border border-hairline shrink-0"
                                  style={{ backgroundColor: color.hexCode }}
                                />
                                {color.name}
                              </a>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-archivo text-[11px] font-semibold text-flannel/70 uppercase tracking-[0.2em] mb-2">Shop By Fabric</h4>
                          <div className="flex flex-col gap-1">
                            {fabrics.map((fabric) => (
                              <a key={fabric._id} href={`/${gender.toLowerCase()}?fabric=${fabric._id}`} className="text-sm font-spectral text-ink py-1 no-underline">
                                {fabric.name}
                              </a>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-archivo text-[11px] font-semibold text-flannel/70 uppercase tracking-[0.2em] mb-2">Shop By Category</h4>
                          <div className="flex flex-col gap-1">
                            {categories.map((category) => (
                              <a key={category._id} href={`/${gender.toLowerCase()}?categoryRef=${category._id}`} className="text-sm font-spectral text-ink py-1 no-underline">
                                {category.name}
                              </a>
                            ))}
                          </div>
                        </div>
                        <a href={`/${gender.toLowerCase()}`} className="block text-sm font-archivo font-semibold uppercase tracking-[0.12em] text-claret py-1">
                          Shop all {gender}
                        </a>
                      </div>
                    )}
                  </div>
                ))}

                <a href="/rewards" className="block font-archivo text-base font-semibold uppercase tracking-[0.14em] py-3 text-navy px-2 border-b border-hairline no-underline">
                  Rewards
                </a>

                <div className="border-b border-hairline">
                  <button
                    type="button"
                    onClick={() => toggleMobileSection("About")}
                    className="w-full flex items-center justify-between font-archivo text-base font-semibold uppercase tracking-[0.14em] py-3 text-navy px-2"
                  >
                    About STETH
                    <span className="text-sm">{mobileExpandedSection === "About" ? "−" : "+"}</span>
                  </button>
                  {mobileExpandedSection === "About" && (
                    <div className="pb-4 px-2 flex flex-col gap-2">
                      <a href="/aboutus#our-story" className="text-sm font-spectral text-ink py-1 no-underline">Our Story</a>
                      <a href="/blog" className="text-sm font-spectral text-ink py-1 no-underline">Blog</a>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  {!isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        openAuthPanel("login")
                      }}
                      className="block w-full text-left font-archivo text-base font-semibold uppercase tracking-[0.14em] py-2 text-navy px-2"
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        openAccountOverlay("profile")
                      }}
                      className="w-full flex items-center font-archivo text-base font-semibold uppercase tracking-[0.14em] py-2 text-navy px-2"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </button>
                  )}
                  <a
                    href="/cart"
                    className="block font-archivo text-base font-semibold uppercase tracking-[0.14em] py-2 text-navy px-2 no-underline"
                  >
                    Cart
                  </a>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Search Results Panel */}
        {isSearchOverlayActive && (
          <div className="md:hidden fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999]" onClick={() => setIsSearchOverlayActive(false)}>
            <div className="bg-shirting px-4 py-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="w-full px-4 py-2 pl-12 text-sm font-spectral bg-transparent text-ink border border-hairline focus:outline-none focus:border-claret transition-colors"
                  autoFocus
                />
                <svg
                  className="absolute left-4 top-3 h-5 w-5 text-flannel/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {showResults && (
                  <div className="absolute left-0 right-0 mt-2 bg-shirting border border-hairline shadow-lg max-h-96 overflow-y-auto z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-flannel/70">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy mx-auto"></div>
                        <span className="mt-2 block text-sm font-spectral">Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        <div className="space-y-2">
                          {searchResults.map((product) => (
                            <div
                              key={product._id}
                              onClick={() => {
                                handleResultClick(product._id)
                              }}
                              className="flex items-center p-2 hover:bg-paper cursor-pointer border border-hairline transition-colors"
                            >
                              <img
                                src={product.defaultImages[0]?.url || "/placeholder.svg?height=60&width=60"}
                                alt={product.name}
                                className="w-12 h-12 object-cover mr-3 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-spectral font-medium text-ink truncate">{product.name}</p>
                                <p className="font-archivo text-[10px] tracking-wide text-flannel/70 mt-0.5">
                                  {product.category} • {product.gender} • PKR {product.price.toLocaleString()}
                                </p>
                              </div>
                              <svg className="h-4 w-4 text-flannel/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="p-4 text-center text-flannel/70">
                        <svg className="h-8 w-8 text-chalk mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm font-spectral">No products found for "{searchQuery}"</p>
                        <p className="text-xs mt-1 font-spectral">Try searching with different keywords</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
