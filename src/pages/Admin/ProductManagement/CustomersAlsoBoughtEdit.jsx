import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Check, X } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "../../../config/api"

const CustomersAlsoBoughtEdit = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(`${API_BASE_URL}/api/products/${id}`)
        const productData = await productResponse.json()
        if (productData.success) {
          setProduct({ ...productData.data, relatedProducts: productData.data.relatedProducts || [] })
        }

        const productsResponse = await fetch(`${API_BASE_URL}/api/products`)
        const productsData = await productsResponse.json()
        if (productsData.success) {
          setAllProducts(productsData.data.filter((p) => p._id !== id))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch product data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const toggleRelatedProduct = (productId) => {
    if (!product) return

    // relatedProducts may hold either populated objects or bare ids
    // depending on the route that last touched them - normalize to ids.
    const relatedIds = product.relatedProducts.map((p) => (typeof p === "string" ? p : p._id))
    const isRelated = relatedIds.includes(productId)
    const newRelatedProducts = isRelated
      ? relatedIds.filter((relId) => relId !== productId)
      : [...relatedIds, productId]

    setProduct({ ...product, relatedProducts: newRelatedProducts })
  }

  const isRelated = (productId) => {
    if (!product) return false
    return product.relatedProducts.some((p) => (typeof p === "string" ? p : p._id) === productId)
  }

  const handleSave = async () => {
    if (!product) return

    setSaving(true)
    try {
      // relatedProducts is a plain field on Product, updated through the
      // same generic PUT /:id every other product edit uses - there's no
      // dedicated /:id/related endpoint (see Steth_web_backend PROGRESS.md).
      const relatedIds = product.relatedProducts.map((p) => (typeof p === "string" ? p : p._id))
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ relatedProducts: relatedIds }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        toast.success("Related products updated successfully")
      } else {
        throw new Error(data.message || "Failed to update related products")
      }
    } catch (error) {
      console.error("Error saving related products:", error)
      toast.error("Failed to update related products")
    } finally {
      setSaving(false)
    }
  }

  const BackButton = () => (
    <Link to="/admin/product-management/customers-also-bought">
      <Button variant="ghost" className="mr-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </Link>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold">Product not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold">Edit Related Products</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Current Product</h2>
          <p className="text-gray-500">{product.name}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Related</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allProducts.map((relatedProduct) => (
              <TableRow key={relatedProduct._id}>
                <TableCell className="font-medium">{relatedProduct.name}</TableCell>
                <TableCell>{relatedProduct.category}</TableCell>
                <TableCell>PKR {relatedProduct.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => toggleRelatedProduct(relatedProduct._id)}
                  >
                    {isRelated(relatedProduct._id) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default CustomersAlsoBoughtEdit
