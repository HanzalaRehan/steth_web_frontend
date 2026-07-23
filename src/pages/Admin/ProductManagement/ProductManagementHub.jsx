import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { PlusCircle, Trash2, RefreshCw, ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const ProductManagementHub = () => {
  const [productStats, setProductStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    totalUnitCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/product-stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch product stats")
        }

        const data = await response.json()

        if (data.success) {
          setProductStats({
            total: data.stats.total,
            active: data.stats.active,
            outOfStock: data.stats.outOfStock,
            totalUnitCount: data.stats.inventory.totalUnitCount,
          })
        } else {
          console.error("Failed to load product stats")
        }
      } catch (err) {
        console.error("Error fetching product stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductStats()
  }, [])

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Product Management</h2>
        <p className="mb-4">Manage your products and inventory here.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-medium">Total Products</h3>
              <p className="text-2xl font-bold">{isLoading ? "Loading..." : productStats.total}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium">Active Products</h3>
              <p className="text-2xl font-bold">{isLoading ? "Loading..." : productStats.active}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium">Out of Stock</h3>
              <p className="text-2xl font-bold">{isLoading ? "Loading..." : productStats.outOfStock}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium">Total Unit Count</h3>
              <p className="text-2xl font-bold">{isLoading ? "Loading..." : productStats.totalUnitCount}</p>
            </Card>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-2 mt-8">
        <Link
          to="/admin/product-management/add"
          className="flex items-center justify-center h-12 px-6 text-lg rounded-md bg-white text-black shadow-sm transition-colors hover:bg-gray-100 hover:text-black"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Product
        </Link>

        <Link
          to="/admin/product-management/delete"
          className="flex items-center justify-center h-12 px-6 text-lg rounded-md bg-destructive text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
        >
          <Trash2 className="h-5 w-5 mr-2" />
          Delete Product
        </Link>

        <Link
          to="/admin/product-management/list"
          className="flex items-center justify-center h-12 px-6 text-lg rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Update Product
        </Link>

        <Link
          to="/admin/product-management/customers-also-bought"
          className="flex items-center justify-center h-12 px-6 text-lg rounded-md bg-green-600 text-white shadow-sm transition-colors hover:bg-green-700"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Customers Also Bought
        </Link>
      </div>
    </>
  )
}

export default ProductManagementHub
