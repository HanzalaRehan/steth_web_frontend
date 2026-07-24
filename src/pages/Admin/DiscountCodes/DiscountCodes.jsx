import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

const emptyForm = { code: "", name: "", description: "", percentage: "", expiryDate: "" }

const DiscountCodes = () => {
  const [codes, setCodes] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [justCreatedCode, setJustCreatedCode] = useState(null)

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/discount-codes`, { headers: authHeader() })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch discount codes")
      setCodes(data.discountCodes || [])
    } catch (error) {
      toast.error(error.message || "Failed to fetch discount codes")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim() || !form.percentage || !form.expiryDate) {
      toast.error("Code, name, percentage, and expiry date are required")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/discount-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to create discount code")

      toast.success("Discount code created")
      setJustCreatedCode(data.code)
      setForm(emptyForm)
      fetchCodes()
    } catch (error) {
      toast.error(error.message || "Failed to create discount code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/discount-codes/${code._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ isActive: !code.isActive }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to update discount code")
      toast.success(code.isActive ? "Discount code deactivated" : "Discount code activated")
      fetchCodes()
    } catch (error) {
      toast.error(error.message || "Failed to update discount code")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/discount-codes/${deleteTarget._id}`, {
        method: "DELETE",
        headers: authHeader(),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete discount code")
      toast.success("Discount code deleted")
      fetchCodes()
    } catch (error) {
      toast.error(error.message || "Failed to delete discount code")
    } finally {
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discount Codes</h1>
      <p className="text-sm text-muted-foreground">
        Runs alongside the automatic first-order/student discount. If both apply to a cart,
        whichever one is larger is used - they don't stack.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Create Discount Code</CardTitle>
        </CardHeader>
        <CardContent>
          {justCreatedCode && (
            <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
              Code created: <span className="font-mono font-bold">{justCreatedCode}</span> - shown once, it
              cannot be recovered later (only its hash is stored).
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Summer Sale"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional internal note"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage Off</Label>
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 20"
                value={form.percentage}
                onChange={(e) => setForm((f) => ({ ...f, percentage: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Discount Code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Discount Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {codes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code._id}>
                    <TableCell className="font-medium">
                      {code.name}
                      {code.description && (
                        <p className="text-xs text-muted-foreground">{code.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{code.percentage}%</TableCell>
                    <TableCell>{new Date(code.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          code.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {code.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(code)}>
                        {code.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteTarget(code)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No discount codes yet.</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the discount code "{deleteTarget?.name}".
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

export default DiscountCodes
