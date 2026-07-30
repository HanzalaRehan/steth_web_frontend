import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../config/api"

const StudentApprovalList = () => {
  const navigate = useNavigate()
  const [verifications, setVerifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVerifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student-verification/pending`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch verification data")
        }

        const data = await response.json()

        if (data.success) {
          setVerifications(data.verifications)
        } else {
          throw new Error("API returned unsuccessful response")
        }
      } catch (err) {
        setError(err.message)
        console.error("Error fetching verifications:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVerifications()
  }, [])

  const handleRowClick = (verification) => {
    navigate(`/admin/student-approval/${verification._id}`, { state: { verification } })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Student Approval Requests</h2>
      <p className="mb-4">Review and approve student registration requests. Click on a row to view details.</p>

      {isLoading && <p className="text-center py-4">Loading verification requests...</p>}

      {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}

      {!isLoading && !error && (
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Registration Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {verifications.length > 0 ? (
                verifications.map((verification) => (
                  <tr
                    key={verification._id}
                    className="border-t hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(verification)}
                  >
                    <td className="p-3">{verification.name}</td>
                    <td className="p-3">{verification.email}</td>
                    <td className="p-3">{formatDate(verification.verificationDate)}</td>
                    <td className="p-3">{verification.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center">No pending verification requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default StudentApprovalList
