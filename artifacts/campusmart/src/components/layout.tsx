import React from "react";
import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, UtensilsCrossed, Building2, User, Bell, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useGetCart } from "@workspace/api-client-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import NotificationModal from "./notification-modal";

import campusmartLogo from "/images/Gemini_Generated_Image_t3l1e2t3l1e2t3l1 (3).png";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/houses", label: "Houses", icon: Building2 },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { data: cart } = useGetCart({ query: { queryKey: ["cart", isAuthenticated], enabled: isAuthenticated, retry: false } });
  const [showNotifications, setShowNotifications] = useState(false);

  const cartCount = cart?.itemCount || 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0">
            <div className="h-8 sm:h-10 md:h-12 overflow-hidden flex items-center">
              <img 
                src={campusmartLogo} 
                alt="CampusMart" 
                className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </Link>

          {/* Right icons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {!isAuthenticated && (
              <button
                onClick={openAuthModal}
                className="hidden xs:block mr-1 sm:mr-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-[#0A2342] text-white text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg hover:bg-[#0A2342]/90 transition-colors"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
            {!isAuthenticated && (
              <button
                onClick={openAuthModal}
                className="xs:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 text-[#0A2342]" strokeWidth={1.8} />
              </button>
            )}
            <Link href="/cart" className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#0A2342]" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center px-0.5 sm:px-1 bg-[#D0282E] text-white text-[9px] sm:text-[10px] font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#0A2342]" strokeWidth={1.8} />
              <span className="absolute top-1.5 sm:top-2 right-2 sm:right-2.5 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#D0282E] rounded-full border border-white sm:border-2 animate-pulse" />
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

      {/* Main Content — padded for header + bottom nav */}
      <main className="flex-1 w-full pt-14 pb-[56px] sm:pb-[58px] max-w-7xl mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-50 safe-area-pb"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-stretch justify-around h-[56px] sm:h-[58px] max-w-7xl mx-auto px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 gap-[2px] sm:gap-[3px] py-1.5 sm:py-2 min-w-0"
              >
                <Icon
                  className={cn(
                    "w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] transition-colors shrink-0",
                    isActive ? "text-[#0A2342]" : "text-[#9AA5B8]"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] font-medium leading-none transition-colors truncate",
                    isActive ? "text-[#0A2342] font-semibold" : "text-[#9AA5B8]"
                  )}
                >
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
