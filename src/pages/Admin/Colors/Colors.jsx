import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const ColorsPage = () => {
  const [name, setName] = useState("")
  const [hexCode, setHexCode] = useState("#000000")
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [colors, setColors] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [colorToDelete, setColorToDelete] = useState(null)

  useEffect(() => {
    fetchColors()
  }, [])

  const fetchColors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/colors`)
      if (!response.ok) throw new Error("Failed to fetch colors")
      const data = await response.json()
      setColors(data.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to fetch colors")
      setColors([])
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setSelectedImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !hexCode) {
      toast.error("Please enter a name and hex code")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("hexCode", hexCode)
      if (selectedImage) formData.append("image", selectedImage)

      const response = await fetch(`${API_BASE_URL}/api/colors`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add color")
      }

      toast.success("Color added successfully")
      setName("")
      setHexCode("#000000")
      setSelectedImage(null)
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""

      fetchColors()
    } catch (error) {
      toast.error(error.message || "Failed to add color")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (color) => {
    setColorToDelete(color)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/colors/${colorToDelete._id}`, {
        method: "DELETE",
        headers: authHeader(),
      })

      if (!response.ok) throw new Error("Failed to delete color")

      toast.success("Color deleted successfully")
      fetchColors()
    } catch {
      toast.error("Failed to delete color")
    } finally {
      setDeleteDialogOpen(false)
      setColorToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Colors</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Color</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input
                  id="colorName"
                  placeholder="e.g. Navy Blue"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hexCode">Hex Code</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="hexCodePicker"
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(hexCode) ? hexCode : "#000000"}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="h-10 w-10 rounded border cursor-pointer"
                  />
                  <Input
                    id="hexCode"
                    placeholder="#000000"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorImage">Swatch Image (optional)</Label>
              <Input
                id="colorImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer file:cursor-pointer file:bg-white file:border-0 file:text-sm file:font-medium file:text-black hover:file:bg-gray-50"
              />
            </div>

            <Button type="submit" disabled={isLoading || !name.trim() || !hexCode}>
              {isLoading ? "Adding..." : "Add Color"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Colors</CardTitle>
        </CardHeader>
        <CardContent>
          {colors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div key={color._id} className="p-4 border rounded-lg flex flex-col items-center gap-2 group relative">
                  <div className="w-full aspect-square rounded-md overflow-hidden relative" style={{ backgroundColor: color.hexCode }}>
                    {color.titleImageUrl && (
                      <img src={color.titleImageUrl} alt={color.name} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleDeleteClick(color)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <span className="font-medium">{color.name}</span>
                  <span className="text-xs text-gray-500">{color.hexCode}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No colors available. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the color "{colorToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ColorsPage
