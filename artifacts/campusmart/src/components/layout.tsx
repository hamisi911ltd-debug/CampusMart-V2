import React from "react";
import { Link, useLocation } from "wouter";
import { Home, UtensilsCrossed, ShoppingBag, Building2, User, Bell, ShoppingCart, MapPin, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useGetCart } from "@workspace/api-client-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationModal from "./notification-modal";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useUserLocation } from "@/hooks/use-location";

import campusmartLogo from "/images/Gemini_Generated_Image_t3l1e2t3l1e2t3l1 (3).png";

// Food is 2nd as requested
const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/houses", label: "Houses", icon: Building2 },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { data: cart } = useGetCart({ query: { queryKey: ["cart", isAuthenticated], enabled: isAuthenticated, retry: false } });
  const [showNotifications, setShowNotifications] = useState(false);
  const { showBanner, install, dismiss } = usePwaInstall();
  const { city, loading: locLoading } = useUserLocation();

  const cartCount = cart?.itemCount || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* PWA Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[200] bg-[#0A2342] text-white px-4 py-3 flex items-center gap-3 shadow-xl"
          >
            <img src={campusmartLogo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">Install CampusMart</p>
              <p className="text-xs text-white/70">Get the full app experience — fast & offline</p>
            </div>
            <button
              onClick={install}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#1A7A4A] text-white text-xs font-bold rounded-lg hover:bg-[#1A7A4A]/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Install
            </button>
            <button onClick={dismiss} className="p-1 rounded-full hover:bg-white/10 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
        "fixed left-0 right-0 z-50 bg-white border-b border-[#E2E8F0] h-14 transition-all",
        showBanner ? "top-[52px]" : "top-0"
      )}>
        <div className="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
          {/* Logo + Location */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center group">
              <div className="h-12 overflow-hidden flex items-center">
                <img
                  src={campusmartLogo}
                  alt="CampusMart"
                  className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
            </Link>
            {/* Location pill */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full">
              <MapPin className="w-3 h-3 text-[#D0282E] shrink-0" />
              <span className="text-xs font-medium text-gray-600 max-w-[120px] truncate">
                {locLoading ? "Locating..." : city || "Set location"}
              </span>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Mobile location */}
            <div className="flex sm:hidden items-center gap-1 px-2 py-1 bg-gray-50 rounded-full mr-1">
              <MapPin className="w-3 h-3 text-[#D0282E]" />
              <span className="text-[10px] font-medium text-gray-600 max-w-[70px] truncate">
                {locLoading ? "..." : city || "Location"}
              </span>
            </div>

            {!isAuthenticated && (
              <button
                onClick={openAuthModal}
                className="mr-1 px-3 py-1.5 bg-[#0A2342] text-white text-xs font-semibold rounded-lg hover:bg-[#0A2342]/90 transition-colors"
              >
                Sign In
              </button>
            )}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-6 h-6 text-[#0A2342]" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#D0282E] text-white text-[10px] font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-6 h-6 text-[#0A2342]" strokeWidth={1.8} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D0282E] rounded-full border-2 border-white animate-pulse" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <NotificationModal onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "flex-1 w-full pb-[58px] max-w-7xl mx-auto w-full transition-all",
        showBanner ? "pt-[calc(3.5rem+52px)]" : "pt-14"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-around h-[58px] max-w-7xl mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            const isFood = item.href === "/food";
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 gap-[3px] py-2 relative"
              >
                {isFood && isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
                )}
                <div className={cn(
                  "flex items-center justify-center transition-all",
                  isFood && isActive ? "w-9 h-9 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/30 -mt-3" : ""
                )}>
                  <Icon
                    className={cn(
                      "w-[22px] h-[22px] transition-colors",
                      isFood && isActive ? "text-white" :
                      isActive ? "text-[#0A2342]" : "text-[#9AA5B8]"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
                  isFood && isActive ? "text-orange-500 font-bold" :
                  isActive ? "text-[#0A2342] font-semibold" : "text-[#9AA5B8]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
