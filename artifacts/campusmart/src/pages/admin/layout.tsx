import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ShoppingBag, Building2, UtensilsCrossed, ShoppingCart, LogOut, Menu, X, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import campusmartLogo from "/images/Gemini_Generated_Image_t3l1e2t3l1e2t3l1 (3).png";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/rooms", label: "Rooms", icon: Building2 },
  { href: "/admin/food", label: "Food Vendors", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      "flex flex-col bg-[#0A2342] text-white h-full",
      mobile ? "w-72" : "w-64 hidden lg:flex"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <img src={campusmartLogo} alt="CampusMart" className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1" />
        <div>
          <p className="font-bold text-sm leading-tight">CampusMart</p>
          <p className="text-[10px] text-white/50 uppercase tracking-widest">Admin Portal</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase">
            {user?.username?.[0] || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username || "Admin"}</p>
            <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
            ← Site
          </Link>
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-800">
              {NAV.find(n => n.href === location)?.label || "Admin"}
            </h1>
          </div>
          <span className="px-2.5 py-1 bg-[#0A2342]/10 text-[#0A2342] text-xs font-bold rounded-full">
            ADMIN
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
