import { useState, useEffect, useRef, useCallback } from "react";
import { ProductCard } from "@/components/shared";
import { useListProducts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Plus } from "lucide-react";
import SellModal from "@/components/sell-modal";
import type { Product } from "@workspace/api-client-react";

const LIMIT = 10;

export default function Houses() {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showSellModal, setShowSellModal] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { openAuthModal, isAuthenticated } = useAuth();

  const { data, isFetching, isLoading } = useListProducts({
    category: "houses",
    page,
    limit: LIMIT,
  });

  // Accumulate products page by page
  useEffect(() => {
    if (!data?.products) return;
    if (page === 1) {
      setAllProducts(data.products);
    } else {
      setAllProducts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newOnes = data.products.filter((p: Product) => !ids.has(p.id));
        return [...prev, ...newOnes];
      });
    }
  }, [data?.products, page]);

  // Infinite scroll
  const hasMore = page < (data?.totalPages ?? 1);
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handlePostListing = () => {
    if (!isAuthenticated) { openAuthModal(); return; }
    setShowSellModal(true);
  };

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto py-4 md:py-6 h-[calc(100vh-114px)] flex flex-col overflow-hidden">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="bg-[#1A7A4A]/10 text-[#1A7A4A] px-3 py-1 rounded-xl text-lg">Houses</span>
          Accommodation
        </h1>
        <p className="text-muted-foreground">Find the perfect place to stay near campus.</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-6 rounded-2xl">
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : allProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {isFetching && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mt-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-10 mt-2" />
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border/60">
            <h3 className="text-xl font-bold mb-2">No accommodation found</h3>
            <p className="text-muted-foreground">We couldn't find any rooms or houses listed.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handlePostListing}
        className="fixed bottom-20 right-5 w-14 h-14 bg-[#1A7A4A] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#1A7A4A]/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {showSellModal && <SellModal onClose={() => setShowSellModal(false)} />}
    </div>
  );
}
