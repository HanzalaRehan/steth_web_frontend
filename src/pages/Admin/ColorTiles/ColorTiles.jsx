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

const ColorTiles = () => {
  const [colorName, setColorName] = useState("")
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [colorTiles, setColorTiles] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [colorToDelete, setColorToDelete] = useState(null)

  useEffect(() => {
    fetchColorTiles()
  }, [])

  const fetchColorTiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/color-tiles`)
      if (!response.ok) throw new Error("Failed to fetch color tiles")
      const responseData = await response.json()
      setColorTiles(responseData.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to fetch color tiles")
      setColorTiles([])
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!colorName || !selectedImage) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("colorName", colorName)
      formData.append("image", selectedImage)

      const response = await fetch(`${API_BASE_URL}/api/color-tiles`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload color tile")

      toast.success("Color tile added successfully")
      setColorName("")
      setSelectedImage(null)
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""

      fetchColorTiles()
    } catch {
      toast.error("Failed to add color tile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (colorName) => {
    setColorToDelete(colorName)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!colorToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/color-tiles/${colorToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })

      if (!response.ok) throw new Error("Failed to delete color tile")

      toast.success("Color tile deleted successfully")
      fetchColorTiles()
    } catch {
      toast.error("Failed to delete color tile")
    } finally {
      setDeleteDialogOpen(false)
      setColorToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Color Tiles Management</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Color Tile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colorName">Color Name</Label>
                <Input id="colorName" placeholder="Enter color name" value={colorName} onChange={(e) => setColorName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorImage">Color Image</Label>
                <Input
                  id="colorImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer file:cursor-pointer file:bg-white file:border-0 file:text-sm file:font-medium file:text-black hover:file:bg-gray-50"
                />
              </div>

              <Button type="submit" disabled={isLoading || !colorName || !selectedImage} className="w-full">
                {isLoading ? "Adding..." : "Add Color Tile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Color Tiles</CardTitle>
          </CardHeader>
          <CardContent>
            {colorTiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {colorTiles.map((color) => (
                  <div key={color._id} className="p-4 border rounded-lg flex flex-col items-center gap-2 group relative">
                    <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                      <img src={color.imageUrl} alt={color.colorName} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteClick(color.colorName)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="h-6 w-6 text-white" />
                      </button>
                    </div>
                    <span className="font-medium">{color.colorName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No color tiles available. Add one to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the color tile.
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

export default ColorTiles
