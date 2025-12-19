"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/homepage", label: "Homepage", icon: Home },
  { href: "/admin/menu", label: "Menu Items", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/branches", label: "Branches", icon: MapPin },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/about", label: "About / Stories", icon: BookOpen },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const branchManagerLinks = [
  { href: "/admin/branch-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/branch-orders", label: "Branch Orders", icon: ShoppingBag },
  { href: "/admin/branch-messages", label: "Messages", icon: MessageSquare },
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

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const isBranchManager = userRole === "BRANCH_MANAGER";
  const isStaff = userRole === "STAFF";
  const hasAccess = isAdmin || isBranchManager || isStaff;

  // Get appropriate sidebar links based on role
  const sidebarLinks = isAdmin ? adminLinks : branchManagerLinks;

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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

        <nav className="px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-2 w-full text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
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
