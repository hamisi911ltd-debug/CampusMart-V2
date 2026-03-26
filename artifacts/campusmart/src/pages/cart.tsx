import { useAuth } from "@/lib/auth-context";
import { useGetCart, useRemoveCartItem, useUpdateCartItem } from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { data: cart, isLoading } = useGetCart({ query: { enabled: isAuthenticated } });
  
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <img src={`${import.meta.env.BASE_URL}images/empty-cart.png`} alt="Empty Cart" className="w-48 h-48 mb-6 object-contain" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your cart</h2>
        <p className="text-muted-foreground mb-8">Access your saved items and checkout across devices.</p>
        <button 
          onClick={openAuthModal}
          className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <img src={`${import.meta.env.BASE_URL}images/empty-cart.png`} alt="Empty Cart" className="w-48 h-48 mb-6 object-contain" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <Link 
          href="/market"
          className="px-8 py-3.5 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 min-h-screen pb-40">
      <h1 className="text-3xl font-display font-bold mb-8">My Cart ({cart.itemCount})</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-border shadow-sm">
              <div className="w-24 h-24 bg-muted rounded-xl shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Seller: @{item.sellerUsername}</p>
                  </div>
                  <button 
                    onClick={() => removeMutation.mutate({ itemId: item.id })}
                    className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="font-display font-bold text-secondary text-lg">{formatKES(item.price)}</div>
                  <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-1">
                    <button 
                      onClick={() => updateMutation.mutate({ itemId: item.id, data: { quantity: Math.max(1, item.quantity - 1) } })}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-foreground hover:bg-muted"
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateMutation.mutate({ itemId: item.id, data: { quantity: item.quantity + 1 } })}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-foreground hover:bg-muted"
                      disabled={updateMutation.isPending}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sticky Bottom on mobile, Side on desktop */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 bg-white p-6 rounded-3xl border border-border shadow-lg shadow-black/5">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">{formatKES(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-foreground font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold text-foreground text-base">Total</span>
                <span className="font-display font-bold text-2xl text-secondary">{formatKES(cart.total)}</span>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-4 bg-secondary text-white font-bold rounded-xl shadow-lg shadow-secondary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
