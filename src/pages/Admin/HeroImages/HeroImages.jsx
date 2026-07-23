import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const HeroImages = () => {
  const [activeTab, setActiveTab] = useState("home")
  const [images, setImages] = useState({})
  const [webImage, setWebImage] = useState(null)
  const [mobileImage, setMobileImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewWeb, setPreviewWeb] = useState(null)
  const [previewMobile, setPreviewMobile] = useState(null)
  const [isTabLoading, setIsTabLoading] = useState(false)

  const fetchImages = async (pageType) => {
    try {
      setIsTabLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/hero-images/${pageType}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setImages(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch images")
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Failed to fetch images")
    } finally {
      setIsTabLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(activeTab)
  }, [activeTab])

  const handleImageChange = (e, type) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      if (type === "web") {
        setWebImage(file)
        setPreviewWeb(previewUrl)
      } else {
        setMobileImage(file)
        setPreviewMobile(previewUrl)
      }
    }
  }

  const handleUpload = async () => {
    if (!webImage && !mobileImage) {
      toast.error("Please select at least one image to upload")
      return
    }

    setLoading(true)
    try {
      if (webImage && mobileImage) {
        const formData = new FormData()
        formData.append("webImage", webImage)
        formData.append("mobileImage", mobileImage)
        formData.append("pageType", activeTab)

        const response = await fetch(`${API_BASE_URL}/api/hero-images/${activeTab}`, {
          method: "POST",
          headers: authHeader(),
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.message)
        }
      } else {
        if (webImage) {
          const webFormData = new FormData()
          webFormData.append("image", webImage)
          webFormData.append("pageType", activeTab)
          webFormData.append("viewType", "web")

          const webResponse = await fetch(`${API_BASE_URL}/api/hero-images/${activeTab}/web`, {
            method: "POST",
            headers: authHeader(),
            body: webFormData,
          })

          if (!webResponse.ok) {
            const errorData = await webResponse.json()
            throw new Error(errorData.message || `HTTP error! status: ${webResponse.status}`)
          }

          const webData = await webResponse.json()
          if (!webData.success) {
            throw new Error(webData.message)
          }
        }

        if (mobileImage) {
          const mobileFormData = new FormData()
          mobileFormData.append("image", mobileImage)
          mobileFormData.append("pageType", activeTab)
          mobileFormData.append("viewType", "mobile")

          const mobileResponse = await fetch(`${API_BASE_URL}/api/hero-images/${activeTab}/mobile`, {
            method: "POST",
            headers: authHeader(),
            body: mobileFormData,
          })

          if (!mobileResponse.ok) {
            const errorData = await mobileResponse.json()
            throw new Error(errorData.message || `HTTP error! status: ${mobileResponse.status}`)
          }

          const mobileData = await mobileResponse.json()
          if (!mobileData.success) {
            throw new Error(mobileData.message)
          }
        }
      }

      toast.success("Images uploaded successfully")
      await fetchImages(activeTab)
      setWebImage(null)
      setMobileImage(null)
      setPreviewWeb(null)
      setPreviewMobile(null)
      const webInput = document.querySelector('input[type="file"][data-type="web"]')
      const mobileInput = document.querySelector('input[type="file"][data-type="mobile"]')
      if (webInput) webInput.value = ""
      if (mobileInput) mobileInput.value = ""
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload images")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (viewType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hero-images/${activeTab}/${viewType}`, {
        method: "DELETE",
        headers: authHeader(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message)
      }

      toast.success("Image deleted successfully")
      await fetchImages(activeTab)
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Hero Image Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="mens">Men's Page</TabsTrigger>
          <TabsTrigger value="womens">Women's Page</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Upload Images for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Page</CardTitle>
            </CardHeader>
            <CardContent>
              {isTabLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading images...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Web Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "web")}
                      data-type="web"
                      className="cursor-pointer file:cursor-pointer file:bg-white file:border-0 file:text-sm file:font-medium file:text-black hover:file:bg-gray-50"
                    />
                    <div className="space-y-4">
                      <h3 className="font-medium">Current Web Image:</h3>
                      {images.web ? (
                        <div className="relative aspect-video">
                          <img src={images.web.imageUrl} alt="Web Hero" className="w-full h-full object-cover rounded-lg" />
                          <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => handleDelete("web")}>
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">No web image uploaded</p>
                      )}
                    </div>
                    {previewWeb && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Preview:</h3>
                        <div className="relative aspect-video">
                          <img src={previewWeb} alt="Web Preview" className="w-full h-full object-cover rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Mobile Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "mobile")}
                      data-type="mobile"
                      className="cursor-pointer file:cursor-pointer file:bg-white file:border-0 file:text-sm file:font-medium file:text-black hover:file:bg-gray-50"
                    />
                    <div className="space-y-4">
                      <h3 className="font-medium">Current Mobile Image:</h3>
                      {images.mobile ? (
                        <div className="relative aspect-[9/16]">
                          <img src={images.mobile.imageUrl} alt="Mobile Hero" className="w-full h-full object-cover rounded-lg" />
                          <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => handleDelete("mobile")}>
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">No mobile image uploaded</p>
                      )}
                    </div>
                    {previewMobile && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Preview:</h3>
                        <div className="relative aspect-[9/16]">
                          <img src={previewMobile} alt="Mobile Preview" className="w-full h-full object-cover rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button className="mt-6" onClick={handleUpload} disabled={loading || (!webImage && !mobileImage) || isTabLoading}>
                {loading ? "Uploading..." : "Upload Images"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HeroImages
