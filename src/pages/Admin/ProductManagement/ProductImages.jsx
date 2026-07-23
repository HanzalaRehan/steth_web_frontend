import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import { Link, useParams, useLocation } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const ProductImages = () => {
  const { id: productId } = useParams()
  const location = useLocation()
  const [productData] = useState(location.state?.productData || null)
  const [defaultImages, setDefaultImages] = useState([])
  const [colorImages, setColorImages] = useState({})
  const [responseMessage, setResponseMessage] = useState(null)
  const [uploadingColor, setUploadingColor] = useState(null)
  const [uploadingDefault, setUploadingDefault] = useState(false)

  useEffect(() => {
    if (productData) {
      const initialColorImages = {}
      productData.colors.forEach((color) => {
        initialColorImages[color._id] = []
      })
      setColorImages(initialColorImages)
    } else {
      setResponseMessage({ text: "Product data not found", type: "error" })
    }
  }, [productData])

  const handleDefaultImagesChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (files.length + defaultImages.length > 10) {
        setResponseMessage({ text: "Maximum 10 images allowed for default images", type: "error" })
        return
      }

      const newImages = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }))

      setDefaultImages((prev) => [...prev, ...newImages])
    }
  }

  const handleColorImagesChange = (colorId, e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const currentImages = colorImages[colorId] || []

      if (files.length + currentImages.length > 10) {
        setResponseMessage({ text: "Maximum 10 images allowed per color", type: "error" })
        return
      }

      const newImages = files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
      }))

      setColorImages((prev) => ({ ...prev, [colorId]: [...currentImages, ...newImages] }))
    }
  }

  const removeDefaultImage = (id) => {
    setDefaultImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const removeColorImage = (colorId, imageId) => {
    setColorImages((prev) => {
      const currentImages = prev[colorId] || []
      const imageToRemove = currentImages.find((img) => img.id === imageId)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return { ...prev, [colorId]: currentImages.filter((img) => img.id !== imageId) }
    })
  }

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

  const handleDefaultImagesUpload = async () => {
    if (defaultImages.length === 0) {
      setResponseMessage({ text: "Please select images to upload", type: "error" })
      return
    }

    setUploadingDefault(true)
    const formData = new FormData()
    defaultImages.forEach((image) => {
      formData.append("images", image.file)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images/default`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      })

      if (response.ok) {
        setResponseMessage({ text: "Default images uploaded successfully", type: "success" })
        setDefaultImages([])
        const fileInput = document.getElementById("default-images")
        if (fileInput) fileInput.value = ""
      } else {
        const error = await response.json()
        setResponseMessage({ text: error.message || "Failed to upload default images", type: "error" })
      }
    } catch {
      setResponseMessage({ text: "Error connecting to server", type: "error" })
    } finally {
      setUploadingDefault(false)
    }
  }

  const handleColorImagesUpload = async (colorId) => {
    const images = colorImages[colorId] || []
    if (images.length === 0) {
      setResponseMessage({ text: "Please select images to upload", type: "error" })
      return
    }

    setUploadingColor(colorId)
    const formData = new FormData()
    images.forEach((image) => {
      formData.append("images", image.file)
    })

    try {
      const color = productData?.colors.find((c) => c._id === colorId)
      if (!color) {
        setResponseMessage({ text: "Color not found", type: "error" })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images/color/${color.name}`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      })

      if (response.ok) {
        setResponseMessage({ text: `${color.name} images uploaded successfully`, type: "success" })
        setColorImages((prev) => ({ ...prev, [colorId]: [] }))
        const fileInput = document.getElementById(`color-${colorId}`)
        if (fileInput) fileInput.value = ""
      } else {
        const error = await response.json()
        setResponseMessage({ text: error.message || "Failed to upload color images", type: "error" })
      }
    } catch {
      setResponseMessage({ text: "Error connecting to server", type: "error" })
    } finally {
      setUploadingColor(null)
    }
  }

  useEffect(() => {
    return () => {
      defaultImages.forEach((image) => URL.revokeObjectURL(image.preview))
      Object.values(colorImages).forEach((images) => {
        images.forEach((image) => URL.revokeObjectURL(image.preview))
      })
    }
  }, [defaultImages, colorImages])

  const BackButton = () => (
    <Link to="/admin/product-management">
      <Button variant="ghost" className="mr-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </Link>
  )

  if (!productId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BackButton />
            <h1 className="text-2xl font-bold">Upload Product Images</h1>
          </div>
        </div>
        <div className="p-4 rounded-md bg-red-100 text-red-800">
          Invalid product ID. Please try creating the product again.
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BackButton />
            <h1 className="text-2xl font-bold">Upload Product Images</h1>
          </div>
        </div>
        <div className="p-4 rounded-md bg-red-100 text-red-800">
          Product data not found. Please go back and try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-2xl font-bold">Upload Product Images</h1>
        </div>
      </div>

      {responseMessage && (
        <div className={`p-4 rounded-md ${responseMessage.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {responseMessage.text}
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Default Images</h2>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Note: Each image should not exceed 10MB in size. Maximum 10 images allowed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-images">Upload default product images (max 10)</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    id="default-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDefaultImagesChange}
                    disabled={uploadingDefault || defaultImages.length >= 10}
                    className="hidden"
                  />
                  <label
                    htmlFor="default-images"
                    className={`flex items-center px-4 py-2 rounded-md border border-input cursor-pointer transition-colors ${
                      (uploadingDefault || defaultImages.length >= 10) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="bg-gray-100 px-2 py-1 rounded text-black">Choose Files</span>
                  </label>
                </div>
                <Button onClick={handleDefaultImagesUpload} disabled={defaultImages.length === 0 || uploadingDefault}>
                  {uploadingDefault ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload
                </Button>
              </div>
              <p className="text-sm text-gray-500">{defaultImages.length}/10 images selected</p>
            </div>

            {defaultImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {defaultImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeDefaultImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Color-Specific Images</h2>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Note: Each image should not exceed 10MB in size. Maximum 10 images allowed per color.
              </p>
            </div>
            {productData.colors.map((color) => (
              <div key={color._id} className="space-y-2">
                <Label htmlFor={`color-${color._id}`}>{color.name} Images (max 10)</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      id={`color-${color._id}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleColorImagesChange(color._id, e)}
                      disabled={uploadingColor === color._id || (colorImages[color._id]?.length || 0) >= 10}
                      className="hidden"
                    />
                    <label
                      htmlFor={`color-${color._id}`}
                      className={`flex items-center px-4 py-2 rounded-md border border-input cursor-pointer transition-colors ${
                        (uploadingColor === color._id || (colorImages[color._id]?.length || 0) >= 10) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="bg-gray-100 px-2 py-1 rounded text-black">Choose Files</span>
                    </label>
                  </div>
                  <Button
                    onClick={() => handleColorImagesUpload(color._id)}
                    disabled={!colorImages[color._id]?.length || uploadingColor === color._id}
                  >
                    {uploadingColor === color._id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-gray-500">{(colorImages[color._id]?.length || 0)}/10 images selected</p>

                {colorImages[color._id]?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {colorImages[color._id].map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeColorImage(color._id, image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {(uploadingDefault || uploadingColor) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6 min-w-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-xl font-semibold mb-2">
                {uploadingDefault ? "Uploading Default Images" : `Uploading ${productData?.colors.find((c) => c._id === uploadingColor)?.name} Images`}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Please wait while we process your images...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductImages
