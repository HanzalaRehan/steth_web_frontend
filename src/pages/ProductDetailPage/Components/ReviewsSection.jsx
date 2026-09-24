"use client"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"

// Sample review data==

const initialReviewsData = {
  averageRating: 4.7,
  totalReviews: 8742,
  reviews: [
    {
      id: 1,
      rating: 5,
      date: "April 25, 2025",
      title: "MashAllah perfect fit and timely delivery!",
      content: "Alhamdulillah, these scrubs are exactly what I needed for my duty at Shifa International. The fabric quality is top-notch and delivery to Islamabad was faster than expected. Will definitely order again from this website, 100% recommended for all doctors and nurses in Pakistan.",
      isExpanded: false,
    },
    {
      id: 2,
      rating: 5,
      date: "April 10, 2025",
      title: "Best value for Lahore Medical Staff",
      content: "As a resident at Mayo Hospital Lahore, I need durable scrubs that can withstand long shifts. These are perfectly suited for our hospital environment and much better quality than what's available locally at Liberty Market. The deep pockets are ideal for keeping my phone, prescription pad and small equipment. Even after multiple washes in our harsh water, the color stays perfect. Worth every rupee!",
      isExpanded: false,
    },
    {
      id: 3,
      rating: 4,
      date: "March 23, 2025",
      title: "Good quality but sizing runs large",
      content: "I work at Agha Khan University Hospital in Karachi and ordered these scrubs on my colleague's recommendation. The material is excellent for our hot climate - breathable even during summer duties. Only issue is they run slightly large compared to local brands. I'm normally a medium but should have ordered small. Otherwise perfect for long OPD shifts.",
      isExpanded: false,
    },
    {
      id: 4,
      rating: 5,
      date: "March 5, 2025",
      title: "Survived a full shift in Emergency ward!",
      content: "Working in the Emergency Department at Jinnah Hospital requires comfortable yet professional attire. These scrubs are brilliant - withstood a 36-hour shift during a major emergency situation last week. The stitching is strong and the pockets are spacious enough for essentials. Also dried quickly after washing which is important in Rawalpindi's unpredictable weather. Already ordered another set!",
      isExpanded: false,
    },
  ],
  // Additional reviews that will be loaded when clicking "Load More"
  additionalReviews: [
    {
      id: 5,
      rating: 5,
      date: "February 28, 2025",
      title: "Perfect for nursing students in Peshawar",
      content: "Our entire batch at Khyber Medical College ordered these scrubs and everyone is satisfied. The navy blue color meets our college requirements perfectly. The fabric doesn't wrinkle easily which is important when you're rushing between wards. Delivery to Peshawar was prompt despite the distance. Also appreciated the discount for bulk orders!",
      isExpanded: false,
    },
    {
      id: 6,
      rating: 4,
      date: "February 15, 2025",
      title: "Good for Multan's hot climate",
      content: "As a doctor at Nishtar Hospital Multan, I need scrubs that can handle extreme heat. These are lightweight and don't show sweat stains easily, which is perfect for our 45°C summers. The only reason for 4 stars is I wish they offered more traditional Pakistani colors like deep green. Otherwise, the quality and comfort are excellent for the price.",
      isExpanded: false,
    },
    {
      id: 7,
      rating: 5,
      date: "January 30, 2025",
      title: "Best scrubs for female doctors",
      content: "Finding modest yet practical scrubs has always been challenging in Faisalabad. These scrubs are perfect - not too tight, appropriate length, and still look professional. I appreciate that they considered our cultural requirements while designing these. My colleagues at Allied Hospital have now ordered after seeing mine. The fabric quality is superior to anything available at local markets.",
      isExpanded: false,
    },
    {
      id: 8,
      rating: 5,
      date: "January 12, 2025",
      title: "Excellent for dentists in Hyderabad",
      content: "Our dental clinic in Hyderabad shifted to these scrubs last month and patients have noticed the improvement in our professional appearance. The material resists stains from dental materials and washes easily without special care. The price is reasonable compared to imported brands from Dubai. Will continue ordering for our entire staff.",
      isExpanded: false,
    },
    {
      id: 9,
      rating: 4,
      date: "December 28, 2024",
      title: "Good but customs duty was unexpected",
      content: "The scrubs themselves are excellent quality and perfect for my work at DHQ Hospital Gujranwala. My only issue was the unexpected customs charges when delivery arrived. Please mention this on your website for Pakistani customers. Otherwise, very satisfied with the product itself - comfortable even during 12-hour shifts in our overcrowded wards.",
      isExpanded: false,
    },
    {
      id: 10,
      rating: 5,
      date: "December 15, 2024",
      title: "Durable for paramedical staff",
      content: "Working with Rescue 1122 in Sialkot means my uniform goes through a lot. These scrubs have survived countless emergency situations and still look presentable. The reinforced stitching at stress points is especially appreciated. Worth the investment for any paramedical staff looking for reliability. Just a suggestion - consider adding reflective strips for night shift workers.",
      isExpanded: false,
    },
    {
      id: 11,
      rating: 5,
      date: "November 30, 2024",
      title: "Perfect for Lady Reading Hospital staff",
      content: "After the hospital administration changed our dress code, I was worried about finding appropriate scrubs in Peshawar. These exceeded expectations - modest design, breathable in our hot weather, and the navy blue matches our hospital requirements perfectly. Delivery to KPK was surprisingly fast considering most companies delay shipments to our region.",
      isExpanded: false,
    },
    {
      id: 12,
      rating: 5,
      date: "November 18, 2024",
      title: "Best purchase for medical students",
      content: "Our entire class at King Edward Medical University ordered these scrubs for our clinical rotations. The price is reasonable for students on a budget, especially with the student discount. The fabric doesn't wrinkle easily which is important when rushing between different wards. They also dry quickly which is helpful in Lahore's humid climate. Highly recommended for all medical students in Pakistan!",
      isExpanded: false,
    }
  ],
}

export default function ProductReviews() {
  const [reviews, setReviews] = useState(initialReviewsData.reviews)
  const [hasMoreReviews, setHasMoreReviews] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  // Refs for GSAP animations
  const containerRef = useRef(null)
  const headerRef = useRef(null)
  const summaryRef = useRef(null)
  const reviewRefs = useRef([])
  const loadMoreRef = useRef(null)

  useEffect(() => {
    // Make sure all elements are visible first in case animation fails
    gsap.set([headerRef.current, summaryRef.current, ...reviewRefs.current, loadMoreRef.current], {
      opacity: 1,
      visibility: "visible",
    })

    // Then apply animations with a slight delay to ensure DOM is ready
    setTimeout(() => {
      try {
        // Simple fade-in animations that won't interfere with visibility
        gsap.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => {
            // Ensure element is visible after animation
            gsap.set(headerRef.current, { opacity: 1, visibility: "visible" })
          },
        })

        gsap.from(summaryRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(summaryRef.current, { opacity: 1, visibility: "visible" })
          },
        })

        // Animate reviews with stagger
        reviewRefs.current.forEach((ref, index) => {
          if (ref) {
            gsap.from(ref, {
              y: 20,
              opacity: 0,
              duration: 0.5,
              delay: 0.3 + index * 0.1,
              ease: "power2.out",
              onComplete: () => {
                gsap.set(ref, { opacity: 1, visibility: "visible" })
              },
            })
          }
        })

        if (loadMoreRef.current) {
          gsap.from(loadMoreRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: 0.5 + reviewRefs.current.length * 0.1,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(loadMoreRef.current, { opacity: 1, visibility: "visible" })
              setAnimationComplete(true)
            },
          })
        }
      } catch (error) {
        console.error("Animation error:", error)
        // If animation fails, make sure everything is visible
        gsap.set([headerRef.current, summaryRef.current, ...reviewRefs.current, loadMoreRef.current], {
          opacity: 1,
          visibility: "visible",
        })
        setAnimationComplete(true)
      }
    }, 100)

    return () => {
      // Cleanup animations on unmount
      gsap.killTweensOf([headerRef.current, summaryRef.current, ...reviewRefs.current, loadMoreRef.current])
    }
  }, [])

  // Update refs when reviews change
  useEffect(() => {
    // Reset refs array to match current reviews length
    reviewRefs.current = reviewRefs.current.slice(0, reviews.length)

    // If we've loaded new reviews, animate them
    if (reviews.length > initialReviewsData.reviews.length && animationComplete) {
      const newReviewElements = reviewRefs.current.slice(initialReviewsData.reviews.length)

      // Make sure new elements are visible first
      gsap.set(newReviewElements, { opacity: 1, visibility: "visible" })

      // Then animate them
      newReviewElements.forEach((ref, index) => {
        if (ref) {
          gsap.from(ref, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            delay: index * 0.1,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(ref, { opacity: 1, visibility: "visible" })
            },
          })
        }
      })
    }
  }, [reviews, animationComplete])

  const toggleReadMore = (id) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === id) {
          return { ...review, isExpanded: !review.isExpanded }
        }
        return review
      }),
    )
  }

  const loadMoreReviews = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setReviews([...reviews, ...initialReviewsData.additionalReviews])
      setHasMoreReviews(false) // No more reviews to load after this
      setIsLoading(false)
    }, 800)
  }

  // Function to render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 md:w-5 md:h-5 ${star <= rating ? "text-ink" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full bg-paper" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 text-ink">
        {/* Header - Made responsive for mobile */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4 sm:gap-0"
          style={{ opacity: 1 }} // Ensure visibility even before animations
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink">The Reviews Are In</h2>
          <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 border-2 border-navy text-ink bg-shirting rounded-none font-medium hover:bg-navy hover:text-paper transition-colors text-sm md:text-base">
            SEE ALL REVIEWS
          </button>
        </div>

        {/* Rating Summary */}
        <div
          ref={summaryRef}
          className="bg-shirting border border-hairline p-6 md:p-8 mb-6 text-center"
          style={{ opacity: 1 }} // Ensure visibility even before animations
        >
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">4.5/5</div>
          <div className="flex justify-center mb-2">{renderStars(4.5)}</div>
          <p className="text-sm md:text-base text-flannel/80">
            Based On {initialReviewsData.totalReviews.toLocaleString()} Reviews
          </p>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4 md:space-y-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-shirting border border-hairline p-4 md:p-6"
              ref={(el) => (reviewRefs.current[index] = el)}
              style={{ opacity: 1 }} // Ensure visibility even before animations
            >
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-flannel/80 text-xs md:text-sm">{review.date}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{review.title}</h3>
              <div className="text-flannel text-sm md:text-base">
                {review.content.length > 150 && !review.isExpanded ? (
                  <>
                    <p>{review.content.substring(0, 150)}...</p>
                    <button
                      onClick={() => toggleReadMore(review.id)}
                      className="bg-navy rounded-none font-medium mt-2 hover:underline text-paper px-3 py-1 text-xs md:text-sm"
                    >
                      Read More
                    </button>
                  </>
                ) : (
                  <>
                    <p>{review.content}</p>
                    {review.content.length > 150 && (
                      <button
                        onClick={() => toggleReadMore(review.id)}
                        className="text-paper font-medium mt-2 hover:underline text-xs md:text-sm"
                      >
                        Read Less
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreReviews && (
          <div
            className="mt-6 md:mt-8 text-center"
            ref={loadMoreRef}
            style={{ opacity: 1 }} // Ensure visibility even before animations
          >
            <button
              onClick={loadMoreReviews}
              disabled={isLoading}
              className="px-6 md:px-8 py-2 md:py-3 border-2 bg-navy text-paper rounded-none border-navy font-medium hover:bg-shirting hover:text-claret transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {isLoading ? "Loading..." : "LOAD MORE"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
