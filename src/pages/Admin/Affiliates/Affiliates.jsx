import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const statusBadge = (status) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-200 text-gray-600",
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${styles[status] || ""}`}>
      {status}
    </span>
  )
}

const Affiliates = () => {
  const [requests, setRequests] = useState([])
  const [partners, setPartners] = useState([])
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchRequests()
    fetchPartners()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/requests`, { headers: authHeader() })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      setRequests(data.requests || [])
    } catch (error) {
      toast.error("Failed to fetch affiliate requests")
    }
  }

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/partners`, { headers: authHeader() })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      setPartners(data.partners || [])
    } catch (error) {
      toast.error("Failed to fetch affiliate partners")
    }
  }

  const handleLogRequest = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      toast.success("Affiliate request logged")
      setForm({ name: "", email: "", message: "" })
      fetchRequests()
    } catch (error) {
      toast.error(error.message || "Failed to log request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/requests/${id}/approve`, {
        method: "POST",
        headers: authHeader(),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      toast.success(`Approved - referral code: ${data.partner.referralCode}`)
      fetchRequests()
      fetchPartners()
    } catch (error) {
      toast.error(error.message || "Failed to approve request")
    }
  }

  const handleReject = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/requests/${id}/reject`, {
        method: "POST",
        headers: authHeader(),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      toast.success("Request rejected")
      fetchRequests()
    } catch (error) {
      toast.error(error.message || "Failed to reject request")
    }
  }

  const handleTogglePartnerStatus = async (partner) => {
    const nextStatus = partner.status === "active" ? "inactive" : "active"
    try {
      const response = await fetch(`${API_BASE_URL}/api/affiliates/partners/${partner._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message)
      toast.success(`Partner marked ${nextStatus}`)
      fetchPartners()
    } catch (error) {
      toast.error(error.message || "Failed to update partner")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Affiliate Marketing</h1>
      <p className="text-sm text-muted-foreground">
        Backend-only for now - there's no storefront request form yet, so requests are logged here
        manually (e.g. from an email inquiry) and reviewed below.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Log Affiliate Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogRequest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="affName">Name</Label>
              <Input
                id="affName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affEmail">Email</Label>
              <Input
                id="affEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affMessage">Message</Label>
              <Input
                id="affMessage"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging..." : "Log Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell>{req.email}</TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {req.status === "pending" ? (
                        <>
                          <Button size="sm" onClick={() => handleApprove(req._id)}>
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReject(req._id)}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Reviewed {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : ""}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No affiliate requests yet.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner._id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell className="font-mono">{partner.referralCode}</TableCell>
                    <TableCell>{statusBadge(partner.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleTogglePartnerStatus(partner)}>
                        {partner.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No affiliate partners yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Affiliates
