"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  MapPin, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  BookOpen,
  Image,
  Building2,
  Megaphone,
  Ticket,
  Award,
  BarChart3,
  Gift,
  Star,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  Search,
  TrendingUp,
  Package,
  Palette,
} from "lucide-react";

// Grouped sidebar links for admin
const adminMenuGroups = [
  {
    id: "main",
    label: "Main",
    icon: LayoutDashboard,
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    id: "orders",
    label: "Orders & Sales",
    icon: ShoppingBag,
    links: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: TrendingUp,
    links: [
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
      { href: "/admin/loyalty", label: "Loyalty Program", icon: Award },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: Palette,
    links: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
      { href: "/admin/branches", label: "Branches", icon: MapPin },
      { href: "/admin/about", label: "About / Stories", icon: BookOpen },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/gallery", label: "Gallery", icon: Image },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    links: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const branchManagerGroups = [
  {
    id: "main",
    label: "Main",
    icon: LayoutDashboard,
    links: [
      { href: "/admin/branch-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/branch-orders", label: "Branch Orders", icon: ShoppingBag },
      { href: "/admin/branch-messages", label: "Messages", icon: MessageSquare },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["main", "orders"]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    if (showProfileMenu || showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileMenu, showNotifications]);

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  // Check if any link in a group is active
  const isGroupActive = (links: { href: string }[]) => {
    return links.some(link => isActiveLink(link.href));
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isBranchManager = userRole === "BRANCH_MANAGER";
  const isStaff = userRole === "STAFF";
  const hasAccess = isAdmin || isBranchManager || isStaff;

  // Get appropriate sidebar groups based on role
  const menuGroups = isAdmin ? adminMenuGroups : branchManagerGroups;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/admin");
    } else if (status === "authenticated" && !hasAccess) {
      router.push("/");
    } else if (status === "authenticated" && (isBranchManager || isStaff)) {
      // Redirect branch managers to their dashboard if they try to access admin-only pages
      const adminOnlyPaths = ["/admin/homepage", "/admin/menu", "/admin/branches", "/admin/about", "/admin/team", "/admin/gallery", "/admin/users", "/admin/settings"];
      if (pathname === "/admin" || adminOnlyPaths.some(p => pathname?.startsWith(p))) {
        router.push("/admin/branch-dashboard");
      }
    }
  }, [status, session, router, pathname, hasAccess, isBranchManager, isStaff]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  // Mock notifications - in production, fetch from API
  const notifications = [
    { id: 1, title: "New Order", message: "Order #PAP-12345 received", time: "2 min ago", unread: true },
    { id: 2, title: "Low Stock Alert", message: "Jollof Rice running low", time: "1 hour ago", unread: true },
    { id: 3, title: "New Review", message: "5-star review from John", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b z-30 flex items-center justify-between px-4 lg:px-6">
        {/* Left side - Mobile menu & Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>
        </div>

        {/* Right side - Notifications & Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border overflow-hidden"
                >
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.unread ? "bg-blue-50/50" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-sm text-gray-500">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t bg-gray-50">
                    <button className="text-sm text-primary hover:underline w-full text-center">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border overflow-hidden"
                >
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {session?.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{session?.user?.name}</p>
                        <p className="text-sm text-gray-500">{session?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark text-white transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <span className="font-heading font-bold text-xl">Papaye</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);
            const hasActiveLink = isGroupActive(group.links);

            return (
              <div key={group.id} className="mb-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    hasActiveLink && !isExpanded
                      ? "bg-primary/20 text-primary"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{group.label}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                {/* Group Links */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                        {group.links.map((link) => {
                          const isActive = isActiveLink(link.href);
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? "bg-primary text-white"
                                  : "text-gray-300 hover:bg-white/10 hover:text-white"
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <link.icon className="w-4 h-4" />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
}
