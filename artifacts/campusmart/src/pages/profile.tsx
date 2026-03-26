import { useAuth } from "@/lib/auth-context";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Settings, Package, Heart, LogOut, ChevronRight, MapPin, Star, User } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { isAuthenticated, openAuthModal, logout } = useAuth();
  const { data: user, isLoading } = useGetCurrentUser({ query: { enabled: isAuthenticated } });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-24 h-24 bg-muted rounded-full mb-6 flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You are not signed in</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Sign in to view your profile, manage your orders, and post items for sale on CampusMart.
        </p>
        <button 
          onClick={openAuthModal}
          className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12 px-4 md:px-0">
      {/* Profile Header */}
      <div className="bg-primary rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white p-1 shrink-0">
            <img 
              src={user?.avatarUrl || `${import.meta.env.BASE_URL}images/avatar-placeholder.png`} 
              alt={user?.username}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">@{user?.username}</h1>
            <div className="flex items-center gap-4 text-primary-foreground/80 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {user?.campus || "No campus set"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
          <div className="text-2xl font-bold text-foreground mb-1">12</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Orders</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
          <div className="text-2xl font-bold text-foreground mb-1">4</div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Listings</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-border shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-foreground mb-1">
            4.8 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rating</div>
        </div>
      </div>

      {/* Menu Links */}
      <div className="mt-8 space-y-2">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-4 mb-4">Account</h3>
        
        <Link href="/orders" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-semibold text-foreground">My Orders</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link href="/wishlist" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="font-semibold text-foreground">Saved Items</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link href="/settings" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-semibold text-foreground">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <button 
        onClick={logout}
        className="w-full mt-8 flex items-center justify-center gap-2 p-4 text-accent font-bold bg-accent/5 rounded-2xl hover:bg-accent/10 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
}
