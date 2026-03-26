import React from "react";
import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, UtensilsCrossed, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/food", label: "Food", icon: UtensilsCrossed },
  { href: "/nrooms", label: "Nrooms", icon: Building2 },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-[58px] flex flex-col max-w-7xl mx-auto">
      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch justify-around h-[58px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 gap-[3px] py-2"
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-colors",
                    isActive ? "text-[#0A2342]" : "text-[#9AA5B8]"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-colors",
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
