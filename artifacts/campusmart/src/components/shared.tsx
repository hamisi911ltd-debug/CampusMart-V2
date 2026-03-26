import { Link } from "wouter";
import { Heart, MapPin, Star, Clock, Wifi, Shield, Droplets, Sofa, ShoppingBag } from "lucide-react";
import { cn, formatKES } from "@/lib/utils";
import type { Product, Room, FoodVendor } from "@workspace/api-client-react";
import { useToggleWishlist } from "@workspace/api-client-react";

export function ProductCard({ product }: { product: Product }) {
  const toggleWishlist = useToggleWishlist();

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist.mutate({ data: { productId: product.id } });
  };

  return (
    <Link 
      href={`/product/${product.id}`}
      className="group block bg-card rounded-2xl p-3 shadow-sm shadow-black/5 border border-border/60 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 active:scale-[0.98] relative"
    >
      <div className="relative aspect-square rounded-xl bg-muted overflow-hidden mb-3">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-4xl">
            📦
          </div>
        )}
        
        {product.badge && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-[10px] font-bold rounded-md tracking-wider">
            {product.badge}
          </div>
        )}

        <button 
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-accent hover:bg-white shadow-sm transition-all"
        >
          <Heart className={cn("w-4 h-4", product.isWishlisted && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="space-y-1.5">
        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="font-display font-bold text-secondary text-lg">
            {formatKES(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              {formatKES(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{product.campus}</span>
        </div>
      </div>
    </Link>
  );
}

export function RoomCard({ room }: { room: Room }) {
  const getAmenityIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'water': return <Droplets className="w-3 h-3" />;
      case 'security': return <Shield className="w-3 h-3" />;
      case 'furnished': return <Sofa className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-card rounded-2xl p-4 shadow-sm shadow-black/5 border border-border/60 hover:shadow-md transition-all">
      <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square shrink-0 rounded-xl bg-muted overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10 text-4xl">
            🏠
          </div>
        )}
        <div className={cn(
          "absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider",
          room.available ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
        )}>
          {room.available ? "AVAILABLE" : "OCCUPIED"}
        </div>
      </div>

      <div className="flex flex-col flex-1 py-1">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{room.type.replace('_', ' ')}</div>
            <h3 className="text-lg font-bold text-foreground leading-tight mb-2">{room.title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{room.campus}</span>
              {room.distanceToCampus && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-1"></span>
                  <span>{room.distanceToCampus}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-secondary text-xl">{formatKES(room.monthlyRent)}</div>
            <div className="text-xs text-muted-foreground">per month</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {room.amenities?.map((amenity, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full text-xs font-medium text-foreground">
              {getAmenityIcon(amenity)}
              {amenity}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-sm hover:bg-primary/90 transition-all active:scale-95">
            Contact Landlord
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
          <img src={vendor.bannerImage} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/80 to-secondary/80" />
        )}
        <div className={cn(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md",
          vendor.isOpen ? "bg-white/90 text-secondary" : "bg-black/60 text-white"
        )}>
          {vendor.isOpen ? "OPEN" : "CLOSED"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-foreground truncate pr-4">{vendor.name}</h3>
          <div className="flex items-center gap-1 bg-yellow-100/50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {vendor.rating?.toFixed(1) || "New"}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {vendor.deliveryTime || "20-30 min"}
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            Min: {formatKES(vendor.minOrder)}
          </div>
        </div>
      </div>
    </div>
  );
}
