import { useRoute } from "wouter";
import { useGetProduct, useAddToCart } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { formatKES, cn } from "@/lib/utils";
import { MapPin, Heart, ShoppingCart, ArrowLeft, ShieldCheck, Share2, User } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id || "";
  
  const { data: product, isLoading, isError } = useGetProduct(id);
  const { isAuthenticated, openAuthModal } = useAuth();
  const addToCartMutation = useAddToCart();
  
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-semibold animate-pulse">Loading item...</div>;
  if (isError || !product) return <div className="p-8 text-center text-accent font-bold">Failed to load product.</div>;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    addToCartMutation.mutate({ data: { productId: product.id, quantity: 1 } });
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link href="/market" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Link>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors">
            <Heart className={cn("w-5 h-5", product.isWishlisted ? "fill-accent text-accent" : "text-foreground")} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto md:px-8 md:py-8 md:mt-0 mt-14 flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Images */}
        <div className="w-full md:w-1/2 lg:w-[55%]">
          <div className="aspect-square md:rounded-3xl bg-white md:border border-border overflow-hidden relative">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-muted/30">📦</div>
            )}
            {product.badge && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg tracking-wider">
                {product.badge}
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 px-4 md:px-0 mt-4 overflow-x-auto hide-scrollbar">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 lg:w-[45%] px-4 md:px-0 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-md">
              {product.category}
            </span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              {product.condition?.replace('_', ' ')}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground leading-tight mb-4">
            {product.title}
          </h1>

          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-display font-bold text-secondary">
              {formatKES(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through mb-1">
                {formatKES(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-8 bg-muted/30 p-3 rounded-xl">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">Located at <strong className="text-foreground">{product.campus}</strong></span>
          </div>

          <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
            <h3 className="text-lg font-bold text-foreground mb-2">Description</h3>
            <p className="whitespace-pre-line leading-relaxed">{product.description || "No description provided."}</p>
          </div>

          {/* Seller Info */}
          <div className="mt-auto border border-border rounded-2xl p-4 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {product.sellerAvatar ? (
                  <img src={product.sellerAvatar} alt="Seller" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Sold by</p>
                <p className="font-bold text-foreground">@{product.sellerUsername}</p>
              </div>
            </div>
            <button className="px-4 py-2 border-2 border-primary/20 text-primary font-semibold rounded-xl hover:bg-primary/5 transition-colors">
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-border z-50 md:hidden flex gap-3">
        <button className="w-14 h-14 shrink-0 flex items-center justify-center bg-muted rounded-2xl text-foreground">
          <Heart className="w-6 h-6" />
        </button>
        <button 
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || product.status !== 'active'}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
        >
          <ShoppingCart className="w-5 h-5" />
          {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
        </button>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex max-w-6xl mx-auto px-8 mt-8 justify-end gap-4">
        <button 
          onClick={handleAddToCart}
          disabled={addToCartMutation.isPending || product.status !== 'active'}
          className="w-72 flex items-center justify-center gap-2 bg-primary text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          <ShoppingCart className="w-6 h-6" />
          {addToCartMutation.isPending ? "Adding to cart..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
