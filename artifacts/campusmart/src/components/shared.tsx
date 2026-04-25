import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Clock, Wifi, Shield, Droplets, Sofa, ShoppingBag } from "lucide-react";
import { cn, formatKES } from "@/lib/utils";
import type { Product, Room, FoodVendor } from "@workspace/api-client-react";
import { useToggleWishlist, getListProductsQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

export function ProductCard({ product }: { product: Product }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const queryClient = useQueryClient();
  const toggleWishlist = useToggleWishlist();

  const [, navigate] = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { openAuthModal(); return; }
    try {
      await toggleWishlist.mutateAsync({ data: { productId: product.id } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(product.id) });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      navigate(`/product/${product.id}`);
    }, 2000);
  };

  return (
    <>
    <a
      href={`/product/${product.id}`}
      onClick={handleCardClick}
      className="group block bg-card rounded-2xl overflow-hidden shadow-sm shadow-black/5 border border-border/60 hover:shadow-xl hover:shadow-[#0A2342]/5 hover:border-[#0A2342]/20 transition-all duration-300 active:scale-[0.98] relative"
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-4xl">
          </div>
        )}

        {product.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#D0282E] text-white text-[10px] font-bold rounded-md tracking-wider">
            {product.badge}
          </div>
        )}

        <button
          onClick={handleWishlist}
          disabled={toggleWishlist.isPending}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/85 backdrop-blur-sm shadow-sm transition-all hover:scale-110 active:scale-95"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              product.isWishlisted ? "fill-[#D0282E] text-[#D0282E]" : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1">
        <h3 className="font-semibold text-foreground line-clamp-2 text-xs sm:text-sm leading-tight group-hover:text-[#0A2342] transition-colors">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-[#1A7A4A] text-base sm:text-lg">
            {formatKES(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatKES(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{product.campus}</span>
        </div>
      </div>
    </a>
    
    {isAnimating && (
      <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
        {[...Array(15)].map((_, i) => {
          const size = Math.random() * 20 + 10;
          return (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${0.5 + Math.random()}s`,
                animationDelay: `${Math.random() * 0.3}s`,
              }}
            >
              <Star 
                className="fill-yellow-400 text-yellow-400" 
                style={{ width: size, height: size }} 
              />
            </div>
          );
        })}
      </div>
    )}
    </>
  );
}

export function RoomCard({ room }: { room: Room }) {
  const getAmenityIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "wifi": return <Wifi className="w-3 h-3" />;
      case "water": return <Droplets className="w-3 h-3" />;
      case "security": return <Shield className="w-3 h-3" />;
      case "furnished": return <Sofa className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-card rounded-2xl p-4 shadow-sm shadow-black/5 border border-border/60 hover:shadow-md transition-all">
      <div className="relative w-full md:w-56 aspect-[4/3] md:aspect-square shrink-0 rounded-xl bg-muted overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-4xl"></div>
        )}
        <div className={cn(
          "absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider",
          room.available ? "bg-[#1A7A4A] text-white" : "bg-muted text-muted-foreground"
        )}>
          {room.available ? "AVAILABLE" : "OCCUPIED"}
        </div>
      </div>

      <div className="flex flex-col flex-1 py-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <div className="text-xs font-bold text-[#0A2342] mb-1 uppercase tracking-wider">
              {room.type.replace("_", " ")}
            </div>
            <h3 className="text-lg font-bold text-foreground leading-tight">{room.title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{room.campus}</span>
              {room.distanceToCampus && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5" />
                  <span>{room.distanceToCampus}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display font-bold text-[#1A7A4A] text-xl">{formatKES(room.monthlyRent)}</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {room.amenities?.map((amenity, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full text-xs font-medium text-foreground">
              {getAmenityIcon(amenity)}
              {amenity}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 flex gap-3">
          <button 
            disabled={true}
            className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground font-semibold text-sm cursor-not-allowed"
          >
            {room.available ? "Viewing Only" : "Occupied"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VendorCard({ vendor }: { vendor: FoodVendor }) {
  return (
    <div className="group block bg-card rounded-2xl overflow-hidden shadow-sm shadow-black/5 border border-border/60 hover:shadow-xl transition-all active:scale-[0.98]">
      <div className="relative h-32 bg-muted overflow-hidden">
        {vendor.bannerImage ? (
          <img
            src={vendor.bannerImage}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A2342]/80 to-[#1A7A4A]/80" />
        )}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
          vendor.isOpen ? "bg-white/90 text-[#1A7A4A]" : "bg-black/60 text-white"
        )}>
          {vendor.isOpen ? "OPEN" : "CLOSED"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-base text-foreground truncate pr-4">{vendor.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-100/60 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            {vendor.rating?.toFixed(1) || "New"}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {vendor.deliveryTime || "20-30 min"}
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Min: {formatKES(vendor.minOrder)}
          </div>
        </div>
        <button
          className="mt-3 w-full py-2 rounded-xl text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed"
          disabled={true}
        >
          {vendor.isOpen ? "Menu Only" : "Currently Closed"}
        </button>
      </div>
    </div>
  );
}
