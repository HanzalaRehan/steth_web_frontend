import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const emptyLineItem = { product: "", color: "", size: "", pieces: "" }

const InventoryPage = () => {
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [stockEdits, setStockEdits] = useState({})
  const [savingKey, setSavingKey] = useState(null)

  const [selectedVendor, setSelectedVendor] = useState("")
  const [lineItems, setLineItems] = useState([{ ...emptyLineItem }])
  const [isSubmittingShipment, setIsSubmittingShipment] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchVendors()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?limit=1000`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to fetch products")
      setProducts([])
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors`, { headers: authHeader() })
      if (!response.ok) throw new Error("Failed to fetch vendors")
      const data = await response.json()
      setVendors(data.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to fetch vendors")
      setVendors([])
    }
  }

  const stockKey = (productId, color, size) => `${productId}__${color}__${size}`

  const handleStockEdit = (productId, color, size, value) => {
    setStockEdits((prev) => ({ ...prev, [stockKey(productId, color, size)]: value }))
  }

  const handleStockSave = async (productId, color, size) => {
    const key = stockKey(productId, color, size)
    const value = stockEdits[key]
    if (value === undefined || value === "") return

    setSavingKey(key)
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ color, size, stock: Number(value) }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update stock")
      }

      toast.success("Stock updated")
      setStockEdits((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      fetchProducts()
    } catch (error) {
      toast.error(error.message || "Failed to update stock")
    } finally {
      setSavingKey(null)
    }
  }

  const updateLineItem = (index, field, value) => {
    setLineItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const addLineItem = () => setLineItems((prev) => [...prev, { ...emptyLineItem }])

  const removeLineItem = (index) => {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const resetShipmentForm = () => {
    setSelectedVendor("")
    setLineItems([{ ...emptyLineItem }])
  }

  const isShipmentValid =
    selectedVendor &&
    lineItems.length > 0 &&
    lineItems.every((row) => row.product && row.color.trim() && row.size.trim() && Number(row.pieces) > 0)

  const handleReceiveShipment = async (e) => {
    e.preventDefault()
    if (!isShipmentValid) {
      toast.error("Select a vendor and complete every line item")
      return
    }

    setIsSubmittingShipment(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          vendor: selectedVendor,
          lineItems: lineItems.map((row) => ({
            product: row.product,
            color: row.color.trim(),
            size: row.size.trim(),
            pieces: Number(row.pieces),
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to receive shipment")
      }

      toast.success(`Shipment ${data.data?.shipmentId || ""} received — inventory updated`)
      resetShipmentForm()
      fetchProducts()
    } catch (error) {
      toast.error(error.message || "Failed to receive shipment")
    } finally {
      setIsSubmittingShipment(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="receive">Receive Shipment</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <Card key={product._id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{product.name}</span>
                    <span className="text-sm font-normal text-gray-500">Total stock: {product.totalStock ?? 0}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.inventory && product.inventory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Color</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.inventory.map((row, idx) => {
                          const key = stockKey(product._id, row.color, row.size)
                          const editValue = stockEdits[key]
                          return (
                            <TableRow key={idx}>
                              <TableCell>{row.color}</TableCell>
                              <TableCell>{row.size}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  className="w-24"
                                  value={editValue !== undefined ? editValue : row.stock}
                                  onChange={(e) => handleStockEdit(product._id, row.color, row.size, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  disabled={editValue === undefined || savingKey === key}
                                  onClick={() => handleStockSave(product._id, row.color, row.size)}
                                >
                                  {savingKey === key ? "Saving..." : "Save"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">No inventory rows yet for this product.</div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No products available.</div>
          )}
        </TabsContent>

        <TabsContent value="receive">
          <Card>
            <CardHeader>
              <CardTitle>Receive Shipment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceiveShipment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor._id} value={vendor._id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Line Items</Label>
                  {lineItems.map((row, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Product</Label>
                        <Select value={row.product} onValueChange={(value) => updateLineItem(index, "product", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Color</Label>
                        <Input
                          placeholder="e.g. Navy"
                          value={row.color}
                          onChange={(e) => updateLineItem(index, "color", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Size</Label>
                        <Input
                          placeholder="e.g. M"
                          value={row.size}
                          onChange={(e) => updateLineItem(index, "size", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Pieces</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.pieces}
                          onChange={(e) => updateLineItem(index, "pieces", e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                <Button type="submit" disabled={isSubmittingShipment || !isShipmentValid}>
                  {isSubmittingShipment ? "Receiving..." : "Receive Shipment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default InventoryPage
