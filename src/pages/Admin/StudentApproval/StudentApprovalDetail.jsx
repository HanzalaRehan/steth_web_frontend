import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

// The proof-document image comes from our own auth-gated proxy route, so a
// plain <img src> won't work (it can't carry the Authorization header) -
// fetch it as a blob instead and point <img> at an object URL.
const ProofDocument = ({ proofDocumentUrl }) => {
  const [blobUrl, setBlobUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let objectUrl
    let cancelled = false

    const load = async () => {
      try {
        const proxyUrl = `${API_BASE_URL}/api/image-proxy?url=${encodeURIComponent(proofDocumentUrl)}`
        const response = await fetch(proxyUrl, { headers: authHeader() })
        if (!response.ok) throw new Error("Failed to load image")
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setBlobUrl(objectUrl)
      } catch (err) {
        console.error("Error loading proof document:", err)
        if (!cancelled) setFailed(true)
      }
    }

    if (proofDocumentUrl) load()

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [proofDocumentUrl])

  if (!proofDocumentUrl) {
    return <div className="p-4 text-center text-muted-foreground">No ID card uploaded</div>
  }

  if (failed) {
    return (
      <div className="p-4 text-center">
        <p className="mb-2">Image could not be loaded directly.</p>
        <a
          href={proofDocumentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md inline-block"
        >
          View Document in New Tab
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {blobUrl ? (
          <img src={blobUrl} alt="Student ID Card" className="w-full object-contain max-h-[500px]" />
        ) : (
          <div className="p-4 text-center text-muted-foreground">Loading document...</div>
        )}
        <div className="absolute top-2 right-2">
          <a
            href={proofDocumentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-black/50 text-white rounded-md text-sm hover:bg-black/70"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  )
}

const StudentApprovalDetail = () => {
  const { studentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [studentData] = useState(location.state?.verification || null)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    // Normal navigation always arrives with the row's data already in
    // location.state (see StudentApprovalList) - there's no single-
    // verification-by-id backend route to fall back on for a direct
    // link/refresh, same limitation the original admin panel had.
    if (!studentData && studentId) {
      setFetchError("Verification data not available - please go back to the list and select the student again.")
    }
  }, [studentData, studentId])

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/student-verification/${studentData?._id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
      })

      if (!response.ok) {
        throw new Error("Failed to approve student")
      }

      navigate("/admin/student-approval")
    } catch (err) {
      console.error("Error approving student:", err)
      alert("Failed to approve student. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeny = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/student-verification/${studentData?._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
      })

      if (!response.ok) {
        throw new Error("Failed to reject student")
      }

      navigate("/admin/student-approval")
    } catch (err) {
      console.error("Error rejecting student:", err)
      alert("Failed to reject student. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => navigate("/admin/student-approval")

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <Card className="p-6">
          <p className="text-red-500 text-center">Error: {fetchError}</p>
        </Card>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <Card className="p-6">
          <p className="text-center">Loading student information...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <h1 className="text-2xl font-bold">Student Approval Details</h1>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Student Information</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">{studentData.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="col-span-2 font-medium">{studentData.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="col-span-2 font-medium">{studentData.studentId}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Institution:</span>
                  <span className="col-span-2 font-medium">{studentData.institutionName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="col-span-2 font-medium">{formatDate(studentData.verificationDate)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="col-span-2 font-medium">{studentData.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex gap-4">
                <Button onClick={handleApprove} disabled={isLoading} className="flex-1">
                  Approve
                </Button>
                <Button variant="outline" onClick={handleDeny} disabled={isLoading} className="flex-1">
                  Deny
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Student ID Card</h3>
            <div className="border rounded-md overflow-hidden">
              <ProofDocument proofDocumentUrl={studentData.proofDocument} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default StudentApprovalDetail
