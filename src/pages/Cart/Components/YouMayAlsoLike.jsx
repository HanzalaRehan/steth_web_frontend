import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const YouMayAlsoLike = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await fetch('https://steth-backend.onrender.com/api/products/cob')
        const data = await response.json()
        if (data.success) {
          // Get cart items from localStorage
          const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
          
          // Filter out products that are already in cart
          const filteredProducts = data.data.filter(product => 
            !cartItems.some(item => item.id === product._id)
          )
          
          setRecommendedProducts(filteredProducts)
        }
      } catch (error) {
        console.error("Error fetching recommended products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedProducts()
  }, [])

  const handleViewProduct = (product) => {
    const defaultColor = product.colors[0]
    navigate(`/product/${product._id}?color=${defaultColor.name}`)
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="font-caslon text-xl mb-6 text-navy">You May Also Like</h3>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border border-hairline p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 bg-paper"></div>
                <div className="flex-1">
                  <div className="h-4 bg-paper w-3/4 mb-2"></div>
                  <div className="h-3 bg-paper w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't show the section if there are no recommended products
  if (recommendedProducts.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h3 className="font-caslon text-xl mb-6 text-navy">You May Also Like</h3>
      <div className="grid grid-cols-1 gap-4">
        {recommendedProducts.map((product) => (
          <div key={product._id} className="border border-hairline p-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-24 bg-paper overflow-hidden">
                <img
                  src={product.defaultImages[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-caslon text-base text-navy">{product.name}</h4>
                <p className="font-archivo text-[11px] uppercase tracking-wide text-flannel/70">Category: {product.category}</p>
                <p className="font-archivo text-sm mt-1 text-ink">Rs. {product.price.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={() => handleViewProduct(product)}
              className="w-full border border-navy bg-navy text-paper hover:bg-ink transition-colors py-2.5 mt-4 font-archivo font-semibold uppercase tracking-[0.16em] text-xs"
            >
              See Product
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default YouMayAlsoLike 