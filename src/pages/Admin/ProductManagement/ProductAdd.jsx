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
import { Link, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const AVAILABLE_SIZES = [
  { id: 1, name: "XS", value: "XS" },
  { id: 2, name: "S", value: "S" },
  { id: 3, name: "M", value: "M" },
  { id: 4, name: "L", value: "L" },
  { id: 5, name: "XL", value: "XL" },
  { id: 6, name: "XXL", value: "XXL" },
]

const MATERIALS = [
  { id: 1, name: "Cotton", value: "Cotton" },
  { id: 2, name: "Polyester", value: "Polyester" },
  { id: 3, name: "Cotton Blend", value: "Cotton Blend" },
  { id: 4, name: "Spandex", value: "Spandex" },
]

const GENDERS = [
  { id: 1, name: "Men", value: "Men" },
  { id: 2, name: "Women", value: "Women" },
  { id: 3, name: "Unisex", value: "Unisex" },
]

const ProductAdd = () => {
  // availableColors is mutable (custom colors get pushed onto it on top of
  // whatever comes back from GET /api/colors), so it lives in state rather
  // than as a module constant like AVAILABLE_SIZES/MATERIALS.
  const [availableColors, setAvailableColors] = useState([])
  const [categories, setCategories] = useState([])
  const [fabrics, setFabrics] = useState([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    customCategory: "",
    fabric: "",
    gender: "",
    material: "",
    customMaterial: "",
    price: "",
    colors: [],
    selectedSizes: [],
    colorSizeInventory: [],
    attributes: [],
    isBestSeller: false,
  })

  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [sizeQuantity, setSizeQuantity] = useState("")
  const [customColor, setCustomColor] = useState("")
  const [colorCode, setColorCode] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [selectedInventoryColor, setSelectedInventoryColor] = useState("")
  const [responseMessage, setResponseMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

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
    const isValidDetails = Boolean(
      formData.title &&
      formData.description &&
      formData.price &&
      (formData.category && formData.category !== "custom" || (formData.category === "custom" && formData.customCategory)) &&
      (formData.material && formData.material !== "custom" || (formData.material === "custom" && formData.customMaterial))
    )

    const isValidVariants = Boolean(
      formData.colors.length > 0 &&
      formData.selectedSizes.length > 0 &&
      formData.colorSizeInventory.length > 0
    )

    setIsFormValid(isValidDetails && isValidVariants)
  }, [formData])

  const addColor = () => {
    if (selectedColor && !formData.colors.includes(selectedColor)) {
      const colorObj = availableColors.find((c) => c.value === selectedColor)
      if (colorObj) {
        setFormData({ ...formData, colors: [...formData.colors, selectedColor] })
      }
      setSelectedColor("")
    }
  }

  const addCustomColor = (color) => {
    if (color && !formData.colors.includes(color) && colorCode) {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      if (!hexRegex.test(colorCode)) {
        setResponseMessage({ text: "Please enter a valid hex color code (e.g., #000000)", type: "error" })
        return
      }

      const customColorValue = color.toLowerCase().replace(/\s+/g, "-")
      const newColor = { id: Date.now(), name: color, value: customColorValue, code: colorCode }

      setAvailableColors((prev) => [...prev, newColor])
      setFormData({ ...formData, colors: [...formData.colors, customColorValue] })

      setCustomColor("")
      setColorCode("")
      setSelectedColor("")
    }
  }

  const removeColor = (color) => {
    const newColors = formData.colors.filter((c) => c !== color)
    const newInventory = formData.colorSizeInventory.filter((item) => item.color !== color)
    setFormData({ ...formData, colors: newColors, colorSizeInventory: newInventory })
  }

  const addSizeInventory = () => {
    if (selectedInventoryColor && selectedSize && sizeQuantity) {
      const quantityNum = parseInt(sizeQuantity)
      if (isNaN(quantityNum) || quantityNum < 1) {
        alert("Please enter a valid quantity")
        return
      }

      const existingEntry = formData.colorSizeInventory.find(
        (item) => item.color === selectedInventoryColor && item.size === selectedSize
      )

      if (existingEntry) {
        alert("This color and size combination already exists")
        return
      }

      setFormData({
        ...formData,
        selectedSizes: [...new Set([...formData.selectedSizes, selectedSize])],
        colorSizeInventory: [
          ...formData.colorSizeInventory,
          { color: selectedInventoryColor, size: selectedSize, stock: quantityNum },
        ],
      })

      setSelectedSize("")
      setSizeQuantity("")
    } else {
      alert("Please select color, size, and quantity")
    }
  }

  const removeInventoryItem = (colorVal, sizeVal) => {
    const newInventory = formData.colorSizeInventory.filter(
      (item) => !(item.color === colorVal && item.size === sizeVal)
    )
    const sizesStillInUse = new Set(newInventory.map((item) => item.size))
    const newSizes = formData.selectedSizes.filter((size) => sizesStillInUse.has(size))

    setFormData({ ...formData, colorSizeInventory: newInventory, selectedSizes: newSizes })
  }

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
    const cleanPrice = parseFloat(formData.price)

    const colorMapping = {}
    formData.colors.forEach((colorValue) => {
      const colorObj = availableColors.find((c) => c.value === colorValue)
      colorMapping[colorValue] = colorObj
        ? { name: colorObj.name, code: colorObj.code }
        : { name: colorValue, code: colorValue }
    })

    const categoryName = formData.category === "custom" ? formData.customCategory.trim() : formData.category
    const categoryObj = categories.find((c) => c.name === categoryName)

    // colorRefs only includes colors that exist in the managed Color list -
    // one-off custom colors added inline stay in `colors` only, same as before.
    const colorRefs = formData.colors
      .map((colorValue) => availableColors.find((c) => c.value === colorValue))
      .filter((c) => c && c.id)
      .map((c) => c.id)

    return {
      name: formData.title.trim(),
      description: formData.description.trim(),
      price: cleanPrice,
      category: categoryName,
      categoryRef: categoryObj?._id,
      fabric: formData.fabric || undefined,
      gender: formData.gender,
      isBestSeller: formData.isBestSeller,
      material: formData.material === "custom" ? formData.customMaterial.trim() : formData.material,
      attributes: formData.attributes.filter((a) => a.name.trim()),
      colors: formData.colors.map((colorValue) => ({
        name: colorMapping[colorValue].name,
        value: colorValue,
        code: colorMapping[colorValue].code,
        available: true,
      })),
      colorRefs,
      sizes: formData.selectedSizes.map((size) => {
        const sizeObj = AVAILABLE_SIZES.find((s) => s.value === size)
        return { name: sizeObj ? sizeObj.name : size.toUpperCase(), value: size.toUpperCase(), available: true }
      }),
      inventory: formData.colorSizeInventory.map((item) => ({
        color: item.color,
        size: item.size.toUpperCase(),
        stock: Number(item.stock),
      })),
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid) {
      setResponseMessage({ text: "Please fill in all required fields", type: "error" })
      return
    }

    const colorsWithoutInventory = formData.colors.filter((color) => {
      return !formData.colorSizeInventory.some((item) => item.color === color)
    })

    if (colorsWithoutInventory.length > 0) {
      const colorNames = colorsWithoutInventory.map((color) => {
        const colorObj = availableColors.find((c) => c.value === color)
        return colorObj ? colorObj.name : color
      })

      setResponseMessage({
        text: `No size and quantity added for the following colors: ${colorNames.join(", ")}`,
        type: "error",
      })
      return
    }

    const dataForApi = formatDataForApi()

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(dataForApi),
      })

      if (response.ok) {
        const data = await response.json()
        if (!data.data._id) {
          setResponseMessage({ text: "Error: Product ID not received from server", type: "error" })
          return
        }
        setResponseMessage({ text: "Product added successfully! Redirecting to image upload...", type: "success" })
        navigate(`/admin/product-management/${data.data._id}/images`, { state: { productData: data.data } })
      } else {
        const errorText = await response.text()
        let errorMessage = "Failed to add product"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        setResponseMessage({ text: `Error: ${errorMessage}`, type: "error" })
      }
    } catch (error) {
      console.error("Error submitting product:", error)
      setResponseMessage({ text: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6 min-w-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-xl font-semibold mb-2 text-black">Creating Product</p>
              <p className="text-gray-500">Please wait while we process your request...</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin/product-management">
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>
      </div>

      {responseMessage && (
        <div className={`p-4 rounded-md ${responseMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
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
                            setFormData((prev) => ({ ...prev, customCategory: "" }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
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
                        <SelectValue placeholder="Select gender" />
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
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isBestSeller}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
                      />
                      Best Seller (shown in the Men's/Women's best-sellers section, max 3 per gender)
                    </label>
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
                            setFormData((prev) => ({ ...prev, customMaterial: "" }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
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
                          <Input
                            placeholder="Enter hex code (e.g., #000000)"
                            value={colorCode}
                            onChange={(e) => setColorCode(e.target.value)}
                            pattern="^#[0-9A-Fa-f]{6}$"
                            title="Please enter a valid hex color code (e.g., #000000)"
                          />
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
                    {formData.colors.map((color) => {
                      const colorObj = availableColors.find((c) => c.value === color) || { name: color, value: color, id: 0, code: "" }
                      return (
                        <div key={color} className="flex items-center rounded-full px-3 py-1 bg-gray-100">
                          <span className="mr-2">{colorObj.name}</span>
                          <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0 rounded-full" onClick={() => removeColor(color)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              <h3 className="text-lg font-medium mb-4">Size & Inventory</h3>
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
                          const colorObj = availableColors.find((c) => c.value === color) || { name: color, value: color, id: 0, code: "" }
                          return (
                            <SelectItem key={color} value={color}>
                              {colorObj.name}
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
                  <Button type="button" onClick={addSizeInventory}>
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
                        const colorObj = availableColors.find((c) => c.value === item.color) || { name: item.color, value: item.color, id: 0, code: "" }
                        const sizeObj = AVAILABLE_SIZES.find((s) => s.value === item.size) || { name: item.size, value: item.size, id: 0 }
                        return (
                          <TableRow key={index}>
                            <TableCell>{colorObj.name}</TableCell>
                            <TableCell>{sizeObj.name}</TableCell>
                            <TableCell>{item.stock}</TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeInventoryItem(item.color, item.size)}>
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
          <Button type="button" variant="outline" disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={!isFormValid || isLoading} className="flex items-center">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Product
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProductAdd
