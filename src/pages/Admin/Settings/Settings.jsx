import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const Settings = () => {
  const [userData, setUserData] = useState(null)
  const [username, setUsername] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [status, setStatus] = useState({ type: "idle", operation: "none", message: "" })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setStatus({ type: "loading", operation: "profile", message: "Fetching profile data..." })

      const response = await fetch(`${API_BASE_URL}/api/users/profile-admin`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...authHeader() },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      const user = data.user || data
      if (user && user.email) {
        setUserData(user)
        setUsername(user.username || "")
        setStatus({ type: "success", operation: "profile", message: "Profile loaded successfully" })
      } else {
        throw new Error("No user data received from API")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile data"
      setStatus({ type: "error", operation: "profile", message: errorMessage })
      toast.error(errorMessage)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    setStatus({ type: "loading", operation: "image", message: "Uploading profile picture..." })
    const formData = new FormData()
    formData.append("profilePicture", file)

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/upload-pic`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      })
      const data = await response.json()

      if (data.url) {
        setUserData((prev) => (prev ? { ...prev, profilePicUrl: data.url } : null))
        setStatus({ type: "success", operation: "image", message: "Profile picture updated successfully" })
        toast.success("Profile picture updated successfully")
      } else {
        console.error("Upload failed:", data)
        setStatus({ type: "error", operation: "image", message: data.message || "Failed to upload profile picture" })
        toast.error(data.message || "Failed to upload profile picture")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      setStatus({ type: "error", operation: "image", message: "Failed to upload profile picture" })
      toast.error(error instanceof Error ? error.message : "Failed to upload profile picture")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value)
    if (confirmPassword && e.target.value !== confirmPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
    if (newPassword && e.target.value !== newPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }

  const handleUpdateAccount = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setStatus({ type: "loading", operation: "profile", message: "Updating profile..." })

    try {
      const updateData = {
        username,
        currentPassword,
        newPassword: newPassword || undefined,
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update-account`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: "success", operation: "profile", message: "Profile updated successfully" })
        toast.success("Account updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordError("")
      } else {
        console.error("Update failed:", data)
        setStatus({ type: "error", operation: "profile", message: data.message || "Failed to update profile" })
        toast.error(data.message || "Failed to update account")
      }
    } catch (error) {
      console.error("Error updating account:", error)
      setStatus({ type: "error", operation: "profile", message: "Failed to update profile" })
      toast.error(error instanceof Error ? error.message : "Failed to update account")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (status.type) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status.type) {
      case "loading":
        return "bg-blue-50 text-blue-700"
      case "success":
        return "bg-green-50 text-green-700"
      case "error":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  if (status.type === "loading" && status.operation === "profile" && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (status.type === "error" && status.operation === "profile" && !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-4">{status.message}</p>
          <Button onClick={fetchUserProfile}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p className="mb-4">Manage your account settings.</p>

      {status.type !== "idle" && (
        <div className={`mb-4 p-3 rounded-md flex items-center space-x-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Account Settings</h3>
          <div className="space-y-6">
            {userData && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={userData.profilePicUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <div className="flex items-center space-x-2">
                    <input id="profile-pic" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-pic")?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? "Uploading..." : "Upload New Picture"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {userData && (
              <div>
                <Label>Email</Label>
                <div className="mt-1 p-2 bg-muted rounded-md">
                  <p className="text-sm">{userData.email}</p>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1" />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 pr-10"
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className="mt-1 pr-10"
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="mt-1 pr-10"
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              </div>
            </div>

            <Button onClick={handleUpdateAccount} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Account"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Settings
