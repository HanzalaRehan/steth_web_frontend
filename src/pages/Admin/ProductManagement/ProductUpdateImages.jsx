import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Loader2, X } from "lucide-react"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const ProductUpdateImages = () => {
  const { id: productId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [newColors] = useState(location.state?.newColors || [])
  const [colorImages, setColorImages] = useState(() => {
    const initial = {}
    ;(location.state?.newColors || []).forEach((color) => {
      initial[color.name] = []
    })
    return initial
  })
  const [responseMessage, setResponseMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      Object.values(colorImages).forEach((images) => {
        images.forEach((image) => URL.revokeObjectURL(image.preview))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleColorImageChange = (color, files) => {
    if (files) {
      const fileArray = Array.from(files)

      if (fileArray.length + (colorImages[color]?.length || 0) > 10) {
        setResponseMessage({ text: "Maximum 10 images allowed per color", type: "error" })
        return
      }

      const oversizedFiles = fileArray.filter((file) => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setResponseMessage({ text: "Some images exceed the 10MB size limit. Please select smaller images.", type: "error" })
        return
      }

      const newImages = fileArray.map((file) => ({ file, preview: URL.createObjectURL(file) }))

      setColorImages((prev) => ({ ...prev, [color]: [...(prev[color] || []), ...newImages] }))
    }
  }

  const removeImage = (color, index) => {
    setColorImages((prev) => {
      const newImages = [...prev[color]]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return { ...prev, [color]: newImages }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResponseMessage(null)

    try {
      for (const color of newColors) {
        if (colorImages[color.name] && colorImages[color.name].length > 0) {
          const formData = new FormData()
          colorImages[color.name].forEach((image) => {
            formData.append("images", image.file)
          })

          const response = await fetch(`${API_BASE_URL}/api/products/${productId}/images/color/${color.name}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload images for ${color.name}`)
          }
        }
      }

      setResponseMessage({ text: "Images uploaded successfully! Redirecting to product list...", type: "success" })

      setTimeout(() => {
        navigate("/admin/product-management/list")
      }, 1500)
    } catch (error) {
      setResponseMessage({ text: "Error uploading images. Please try again.", type: "error" })
      console.error("Error uploading images:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6 min-w-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-xl font-semibold mb-2 text-black">Uploading Images</p>
            <p className="text-gray-500">Please wait while we process your images...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to={`/admin/product-management/update/${productId}`}>
            <Button variant="ghost" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add Images for New Colors</h1>
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

      <Card className="p-6">
        <div className="space-y-6">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Note: Each image should not exceed 10MB in size. Maximum 10 images allowed per color.
            </p>
          </div>

          {newColors.map((color) => (
            <div key={color.name} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color.code }} />
                <h3 className="text-lg font-medium">{color.name}</h3>
              </div>

              <div className="space-y-2">
                <Label>Upload Images (Max 10)</Label>
                <div className="relative">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleColorImageChange(color.name, e.target.files)}
                    disabled={colorImages[color.name]?.length >= 10}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="px-4 py-2">
                    <span className="bg-gray-100 text-black px-3 py-1 rounded">Choose files</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{(colorImages[color.name]?.length || 0)}/10 images selected</p>
                {colorImages[color.name]?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {colorImages[color.name].map((image, index) => (
                      <div key={index} className="relative group">
                        <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(color.name, index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || Object.values(colorImages).every((images) => images.length === 0)}
          className="flex items-center"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Images
        </Button>
      </div>
    </div>
  )
}

export default ProductUpdateImages
