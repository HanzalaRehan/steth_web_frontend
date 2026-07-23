import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, X, Plus, Save, Loader2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const AVAILABLE_SIZES = [
  { id: 1, name: "XS", value: "xs" },
  { id: 2, name: "S", value: "s" },
  { id: 3, name: "M", value: "m" },
  { id: 4, name: "L", value: "l" },
  { id: 5, name: "XL", value: "xl" },
  { id: 6, name: "XXL", value: "xxl" },
]

const MATERIALS = [
  { id: 1, name: "Cotton", value: "cotton" },
  { id: 2, name: "Polyester", value: "polyester" },
  { id: 3, name: "Cotton Blend", value: "cotton-blend" },
  { id: 4, name: "Spandex", value: "spandex" },
]

// Values are capitalized to match Product.gender's schema enum
// (['Men','Women','Unisex']) - the previous lowercase values here were a
// pre-existing bug that would fail server-side validation whenever a gender
// was actually picked from this dropdown (only the "custom" fallback path
// happened to work, since it stores exactly what the admin types).
const GENDERS = [
  { id: 1, name: "Men", value: "Men" },
  { id: 2, name: "Women", value: "Women" },
  { id: 3, name: "Unisex", value: "Unisex" },
]

const ProductUpdate = () => {
  const { id: productId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    customCategory: "",
    fabric: "",
    gender: "",
    customGender: "",
    material: "",
    customMaterial: "",
    price: "",
    colors: [],
    selectedSizes: [],
    colorSizeInventory: [],
    attributes: [],
  })

  const [availableColors, setAvailableColors] = useState([])
  const [categories, setCategories] = useState([])
  const [fabrics, setFabrics] = useState([])

  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [sizeQuantity, setSizeQuantity] = useState("")
  const [customColor, setCustomColor] = useState("")
  const [colorCode, setColorCode] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedInventoryColor, setSelectedInventoryColor] = useState("")
  const [responseMessage, setResponseMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newlyAddedColors, setNewlyAddedColors] = useState([])

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [categoriesRes, fabricsRes, colorsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch(`${API_BASE_URL}/api/fabrics`),
          fetch(`${API_BASE_URL}/api/colors`),
        ])
        const [categoriesData, fabricsData, colorsData] = await Promise.all([
          categoriesRes.json(),
          fabricsRes.json(),
          colorsRes.json(),
        ])

        setCategories(categoriesData.data || [])
        setFabrics(fabricsData.data || [])
        setAvailableColors(
          (colorsData.data || []).map((color) => ({
            id: color._id,
            name: color.name,
            value: color.name,
            code: color.hexCode,
          }))
        )
      } catch (error) {
        console.error("Failed to load categories/fabrics/colors:", error)
      }
    }

    fetchLookups()
  }, [])

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }
        const data = await response.json()

        if (!data.success) {
          throw new Error("Failed to fetch product data")
        }

        const productData = data.data

        setFormData({
          title: productData.name,
          description: productData.description || "",
          category: productData.category || "",
          customCategory: productData.category || "",
          fabric: productData.fabric?._id || productData.fabric || "",
          gender: productData.gender || "",
          customGender: productData.gender || "",
          material: productData.material || "",
          customMaterial: productData.material || "",
          price: productData.price.toString(),
          colors: productData.colors?.map((color) => color.name) || [],
          selectedSizes: productData.sizes?.map((size) => size.name) || [],
          colorSizeInventory: productData.inventory?.map((item) => ({
            color: item.color,
            size: item.size,
            stock: item.stock,
          })) || [],
          attributes: productData.attributes || [],
        })
      } catch (error) {
        setResponseMessage({ text: "Error loading product data", type: "error" })
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductData()
    }
  }, [productId])

  useEffect(() => {
    const hasValidDetails =
      formData.title &&
      formData.description &&
      formData.price &&
      (formData.category || formData.customCategory) &&
      (formData.gender || formData.customGender) &&
      (formData.material || formData.customMaterial)

    const hasValidVariants =
      formData.colors.length > 0 &&
      formData.selectedSizes.length > 0 &&
      formData.colorSizeInventory.length > 0

    setIsFormValid(hasValidDetails && hasValidVariants)
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    if (name === "gender" || name === "fabric") {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        [`custom${name.charAt(0).toUpperCase() + name.slice(1)}`]: "",
      }))
    }
  }

  const addAttribute = () => {
    setFormData((prev) => ({ ...prev, attributes: [...prev.attributes, { name: "", iconUrl: "" }] }))
  }

  const updateAttribute = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)),
    }))
  }

  const removeAttribute = (index) => {
    setFormData((prev) => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== index) }))
  }

  const formatDataForApi = () => {
    const uniqueColors = formData.colors.map((color) => {
      const colorObj = availableColors.find((c) => c.name === color)
      return { name: color, code: colorObj ? colorObj.code : "#000000", isAvailable: true }
    })

    const uniqueSizes = formData.selectedSizes.map((size) => ({ name: size, isAvailable: true }))

    const uniqueInventory = formData.colorSizeInventory.map((item) => ({
      color: item.color,
      size: item.size,
      stock: item.stock,
    }))

    const categoryName = formData.category === "custom" ? formData.customCategory : formData.category
    const categoryObj = categories.find((c) => c.name === categoryName)

    const colorRefs = formData.colors
      .map((color) => availableColors.find((c) => c.name === color))
      .filter((c) => c && c.id)
      .map((c) => c.id)

    return {
      name: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: categoryName,
      categoryRef: categoryObj?._id,
      fabric: formData.fabric || undefined,
      gender: formData.gender === "custom" ? formData.customGender : formData.gender,
      material: formData.material === "custom" ? formData.customMaterial : formData.material,
      attributes: formData.attributes.filter((a) => a.name.trim()),
      colors: uniqueColors,
      colorRefs,
      sizes: uniqueSizes,
      inventory: uniqueInventory,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid) {
      setResponseMessage({ text: "Please fill in all required fields", type: "error" })
      return
    }

    const dataForApi = formatDataForApi()

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(dataForApi),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (newlyAddedColors.length > 0) {
          const formattedNewColors = newlyAddedColors.map((color) => {
            const colorObj = availableColors.find((c) => c.name === color)
            return { name: color, code: colorObj ? colorObj.code : "#000000" }
          })

          setResponseMessage({ text: "Product updated successfully! Redirecting to add images for new colors...", type: "success" })

          setTimeout(() => {
            navigate(`/admin/product-management/${productId}/update-images`, { state: { newColors: formattedNewColors } })
          }, 1500)
        } else {
          setResponseMessage({ text: "Product updated successfully! Redirecting to product list...", type: "success" })
          setTimeout(() => {
            navigate("/admin/product-management/list")
          }, 1500)
        }
      } else {
        setResponseMessage({ text: `Error: ${data.message || "Failed to update product"}`, type: "error" })
      }
    } catch (error) {
      setResponseMessage({ text: "Failed to connect to the server. Please try again.", type: "error" })
      console.error("Error updating product:", error)
    } finally {
      setLoading(false)
    }
  }

  const addColor = () => {
    if (selectedColor && !formData.colors.includes(selectedColor)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, selectedColor] }))
      setNewlyAddedColors((prev) => [...prev, selectedColor])
      setSelectedColor("")
    }
  }

  const addCustomColor = (colorName) => {
    if (colorName && !formData.colors.includes(colorName)) {
      setFormData((prev) => ({ ...prev, colors: [...prev.colors, colorName] }))
      setNewlyAddedColors((prev) => [...prev, colorName])
      setSelectedColor("")
      setCustomColor("")
      setColorCode("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin/product-management/list">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Update Product</h1>
        </div>
      </div>

      {responseMessage && (
        <div className={`p-4 rounded-md ${
          responseMessage.type === "success"
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {responseMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="variants">Colors & Sizes</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title*</Label>
                    <Input id="title" name="title" placeholder="Enter product title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (PKR)*</Label>
                    <Input id="price" name="price" type="number" placeholder="0.00" value={formData.price} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Product Description*</Label>
                  <Textarea id="description" name="description" placeholder="Enter product description" rows={5} value={formData.description} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          handleSelectChange("category", value)
                          if (value !== "custom") {
                            setFormData((prev) => ({ ...prev, customCategory: value }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>{formData.category}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom category</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.category === "custom" && (
                        <Input placeholder="Enter category" value={formData.customCategory} name="customCategory" onChange={handleChange} required />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender*</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue>{formData.gender}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((gender) => (
                          <SelectItem key={gender.id} value={gender.value}>
                            {gender.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fabric">Fabric</Label>
                    <Select value={formData.fabric} onValueChange={(value) => handleSelectChange("fabric", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fabric (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {fabrics.map((fabric) => (
                          <SelectItem key={fabric._id} value={fabric._id}>
                            {fabric.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material*</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.material}
                        onValueChange={(value) => {
                          handleSelectChange("material", value)
                          if (value !== "custom") {
                            setFormData((prev) => ({ ...prev, customMaterial: value }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>{formData.material}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIALS.map((material) => (
                            <SelectItem key={material.id} value={material.value}>
                              {material.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom material</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.material === "custom" && (
                        <Input placeholder="Enter material" value={formData.customMaterial} name="customMaterial" onChange={handleChange} required />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Attributes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                  {formData.attributes.map((attribute, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Attribute name (e.g. Breathable)"
                        value={attribute.name}
                        onChange={(e) => updateAttribute(index, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Icon URL (optional)"
                        value={attribute.iconUrl}
                        onChange={(e) => updateAttribute(index, "iconUrl", e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAttribute(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Available Colors</h3>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="color">Add Color*</Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedColor}
                        onValueChange={(value) => {
                          setSelectedColor(value)
                          if (value !== "custom") {
                            setCustomColor("")
                            setColorCode("")
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableColors.map((color) => (
                            <SelectItem key={color.id} value={color.value}>
                              {color.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom color</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedColor === "custom" && (
                        <>
                          <Input placeholder="Enter color name" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                          <Input placeholder="Enter color code (hex)" value={colorCode} onChange={(e) => setColorCode(e.target.value)} />
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedColor === "custom" && customColor.trim()) {
                        addCustomColor(customColor.trim())
                      } else if (selectedColor && selectedColor !== "custom") {
                        addColor()
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {formData.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.colors.map((color) => (
                      <div key={color} className="flex items-center rounded-full px-3 py-1 bg-gray-800">
                        <span className="mr-2">{color}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 rounded-full"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }))
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-800 my-6"></div>

              <h3 className="text-lg font-medium mb-4">Size & Inventory</h3>
              <p className="text-sm text-yellow-600 mb-4">
                Note: Updating the quantity for a specific color and size combination will replace the existing quantity.
                For example, if Black (XL) has 10 pieces and you update it to 15, the new quantity will be 15, not 25.
              </p>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label htmlFor="color-select">Color*</Label>
                    <Select value={selectedInventoryColor} onValueChange={(value) => setSelectedInventoryColor(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.colors.map((color) => {
                          const colorObj = availableColors.find((c) => c.name === color)
                          return (
                            <SelectItem key={color} value={color}>
                              {colorObj?.name || color}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="size">Size*</Label>
                    <Select value={selectedSize} onValueChange={(value) => setSelectedSize(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SIZES.map((size) => (
                          <SelectItem key={size.id} value={size.value}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="quantity">Quantity*</Label>
                    <Input id="quantity" type="number" placeholder="0" value={sizeQuantity} onChange={(e) => setSizeQuantity(e.target.value)} min="1" />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (selectedInventoryColor && selectedSize && sizeQuantity) {
                        const quantityNum = parseInt(sizeQuantity)
                        if (isNaN(quantityNum) || quantityNum < 1) {
                          alert("Please enter a valid quantity")
                          return
                        }

                        setFormData((prev) => ({
                          ...prev,
                          selectedSizes: [...new Set([...prev.selectedSizes, selectedSize])],
                          colorSizeInventory: [
                            ...prev.colorSizeInventory,
                            { color: selectedInventoryColor, size: selectedSize, stock: quantityNum },
                          ],
                        }))

                        setSelectedSize("")
                        setSizeQuantity("")
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {formData.colorSizeInventory.length > 0 && (
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Color</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.colorSizeInventory.map((item, index) => {
                        const colorObj = availableColors.find((c) => c.name === item.color)
                        const sizeObj = AVAILABLE_SIZES.find((s) => s.value === item.size)
                        return (
                          <TableRow key={index}>
                            <TableCell>{colorObj?.name || item.color}</TableCell>
                            <TableCell>{sizeObj?.name || item.size}</TableCell>
                            <TableCell>{item.stock}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    colorSizeInventory: prev.colorSizeInventory.filter((_, i) => i !== index),
                                  }))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/product-management/list")}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Update Product
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductUpdate
