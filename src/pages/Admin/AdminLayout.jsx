import { useState, useEffect, useContext, Suspense } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Image as ImageIcon,
  Palette,
  Mail,
  Menu,
  X,
  User,
  Layers,
  Tags,
  Droplet,
  Truck,
  Warehouse,
  LineChart,
  Ticket,
  Handshake,
} from "lucide-react"
import { API_BASE_URL } from "../../config/api"
import { AuthContext } from "../Login&Signup/AuthContext"
import logo from "../../assets/logo.png"

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/product-management", label: "Product Management", icon: BarChart3 },
  { to: "/admin/student-approval", label: "Student Approval", icon: Globe },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/hero-images", label: "Hero Images", icon: ImageIcon },
  { to: "/admin/color-tiles", label: "Color Tiles", icon: Palette },
  { to: "/admin/fabrics", label: "Fabric", icon: Layers },
  { to: "/admin/categories", label: "Category", icon: Tags },
  { to: "/admin/colors", label: "Colors", icon: Droplet },
  { to: "/admin/vendors", label: "Vendor", icon: Truck },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/discount-codes", label: "Discount Codes", icon: Ticket },
  { to: "/admin/affiliates", label: "Affiliates", icon: Handshake },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  // Admin + Marketer (B.3) - the only item visible to a Marketer, whose
  // role isn't allowed into any of the admin-only items above.
  { to: "/admin/marketing", label: "Marketing", icon: LineChart, roles: ["admin", "marketer"] },
]

const PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/product-management": "Product Management",
  "/admin/student-approval": "Student Approval",
  "/admin/orders": "Orders",
  "/admin/hero-images": "Hero Image Management",
  "/admin/color-tiles": "Color Tiles",
  "/admin/fabrics": "Fabric Management",
  "/admin/categories": "Category Management",
  "/admin/colors": "Colors Management",
  "/admin/vendors": "Vendor Management",
  "/admin/inventory": "Inventory Management",
  "/admin/newsletter": "Newsletter Management",
  "/admin/settings": "Settings",
  "/admin/discount-codes": "Discount Codes",
  "/admin/affiliates": "Affiliate Marketing",
  "/admin/marketing": "Marketing Dashboard",
}

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const response = await fetch(`${API_BASE_URL}/api/users/profile-admin`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch profile`)
        }

        const data = await response.json()
        const user = data.user || data
        if (user && user.email) {
          setUserData(user)
        } else {
          console.error("No user data received from API")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Close sidebar when resizing up to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1023) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isActivePath = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  // Items default to admin-only unless they declare roles explicitly (B.3 -
  // the Marketing item allows marketer too). Shows everything while
  // userData is still loading rather than flashing an empty sidebar.
  const visibleNavItems = isLoading
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => (item.roles || ["admin"]).includes(userData?.role))

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleSidebar = () => setIsSidebarOpen((open) => !open)
  const closeSidebar = () => setIsSidebarOpen(false)

  const pageTitle = PAGE_TITLES[location.pathname] || ""

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <img src={logo} alt="STETH" className="h-6 w-6" />
            <span className="font-bold">STETH</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-2">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            fixed lg:static
            top-0 left-0
            w-[280px] lg:w-auto
            h-full lg:h-screen
            border-r bg-background/50 backdrop-blur
            flex flex-col
            z-50 lg:z-auto
            transition-transform duration-300 ease-in-out
          `}
        >
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img src={logo} alt="STETH" className="h-6 w-6" />
              <span className="font-bold">STETH</span>
            </div>
            <Button variant="ghost" size="sm" onClick={closeSidebar} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="hidden lg:flex h-16 mb-4 items-center gap-2 border-b px-6">
            <img src={logo} alt="STETH" className="h-6 w-6" />
            <span className="font-bold">STETH</span>
          </div>

          <nav className="space-y-2 px-2 flex-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const ItemIcon = item.icon
              return (
                <Link key={item.to} to={item.to} onClick={closeSidebar}>
                  <Button
                    variant={isActivePath(item) ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <ItemIcon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="px-2 pb-4 mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        <main className="p-4 lg:p-6">
          <div className="mb-6 flex items-center justify-between relative">
            <div className="space-y-1">
              <h1 className="text-xl lg:text-2xl font-bold">{pageTitle}</h1>
            </div>
            <div className="relative">
              {isLoading ? (
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-700 animate-pulse" />
              ) : userData?.profilePicUrl ? (
                <img
                  src={userData.profilePicUrl}
                  alt="profile"
                  className="h-8 w-8 lg:h-10 lg:w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 text-gray-300" />
                </div>
              )}
            </div>
          </div>
          {/* Part B.5 - each admin page below is React.lazy() (see
              Router.jsx); this inner Suspense keeps the sidebar/header
              stable and only shows a loading state in the content area
              while navigating between admin pages, rather than the outer
              Suspense (which only needs to catch AdminLayout's own load)
              blanking the whole shell on every page change. */}
          <Suspense fallback={<div className="animate-pulse text-gray-500">Loading...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
