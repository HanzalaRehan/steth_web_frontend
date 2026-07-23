import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Trash2, Plus } from "lucide-react"
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

const emptyComposition = { material: "", percentage: "" }

const FabricPage = () => {
  const [name, setName] = useState("")
  const [composition, setComposition] = useState([{ ...emptyComposition }])
  const [isLoading, setIsLoading] = useState(false)
  const [fabrics, setFabrics] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fabricToDelete, setFabricToDelete] = useState(null)

  useEffect(() => {
    fetchFabrics()
  }, [])

  const fetchFabrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fabrics`)
      if (!response.ok) throw new Error("Failed to fetch fabrics")
      const data = await response.json()
      setFabrics(data.data || [])
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Failed to fetch fabrics")
      setFabrics([])
    }
  }

  const runningTotal = composition.reduce((sum, row) => sum + (Number(row.percentage) || 0), 0)
  const isCompositionValid = composition.length > 0 &&
    composition.every((row) => row.material.trim() && Number(row.percentage) > 0) &&
    Math.abs(runningTotal - 100) < 0.01

  const updateRow = (index, field, value) => {
    setComposition((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const addRow = () => setComposition((prev) => [...prev, { ...emptyComposition }])

  const removeRow = (index) => {
    setComposition((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const resetForm = () => {
    setName("")
    setComposition([{ ...emptyComposition }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a fabric name")
      return
    }
    if (!isCompositionValid) {
      toast.error(`Composition must sum to 100% (currently ${runningTotal}%)`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/fabrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          name: name.trim(),
          composition: composition.map((row) => ({
            material: row.material.trim(),
            percentage: Number(row.percentage),
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add fabric")
      }

      toast.success("Fabric added successfully")
      resetForm()
      fetchFabrics()
    } catch (error) {
      toast.error(error.message || "Failed to add fabric")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (fabric) => {
    setFabricToDelete(fabric)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!fabricToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/fabrics/${fabricToDelete._id}`, {
        method: "DELETE",
        headers: authHeader(),
      })

      if (!response.ok) throw new Error("Failed to delete fabric")

      toast.success("Fabric deleted successfully")
      fetchFabrics()
    } catch {
      toast.error("Failed to delete fabric")
    } finally {
      setDeleteDialogOpen(false)
      setFabricToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fabrics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Fabric</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fabricName">Fabric Name</Label>
              <Input
                id="fabricName"
                placeholder="e.g. Cotton Blend Scrub Fabric"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Composition</Label>
                <span className={`text-sm font-medium ${Math.abs(runningTotal - 100) < 0.01 ? "text-green-600" : "text-amber-600"}`}>
                  Running total: {runningTotal}%
                </span>
              </div>

              {composition.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Material (e.g. Cotton)"
                    value={row.material}
                    onChange={(e) => updateRow(index, "material", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="%"
                    value={row.percentage}
                    onChange={(e) => updateRow(index, "percentage", e.target.value)}
                    min="0"
                    max="100"
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={composition.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </div>

            <Button type="submit" disabled={isLoading || !isCompositionValid || !name.trim()}>
              {isLoading ? "Adding..." : "Add Fabric"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Fabrics</CardTitle>
        </CardHeader>
        <CardContent>
          {fabrics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Composition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fabrics.map((fabric) => (
                  <TableRow key={fabric._id}>
                    <TableCell className="font-medium">{fabric.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {fabric.composition?.map((c) => `${c.material} ${c.percentage}%`).join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(fabric)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fabrics available. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fabric "{fabricToDelete?.name}".
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

export default FabricPage
