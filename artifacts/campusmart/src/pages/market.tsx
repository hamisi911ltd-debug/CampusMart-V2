import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/shared";
import { useListProducts } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";

const FILTERS = ["All", "Books", "Electronics", "Fashion", "Stationery", "Services"];

export default function Market() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { openAuthModal, isAuthenticated } = useAuth();
  
  const { data, isLoading } = useListProducts({ 
    category: activeFilter === "All" ? undefined : activeFilter.toLowerCase() 
  });

  const handlePostListing = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    // Handle post listing (modal or redirect)
    alert("Post listing flow to be implemented");
  };

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto py-6 md:py-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Marketplace</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border shadow-sm rounded-xl font-medium hover:bg-muted/50 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Sort & Filter
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "bg-white border border-border/80 text-muted-foreground hover:border-primary/50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl aspect-[3/4]" />
          ))}
        </div>
      ) : data?.products?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {data.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 mb-4 text-6xl flex items-center justify-center bg-white rounded-3xl shadow-sm border border-border/50">
            📭
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground mb-6">Try selecting a different category or search term.</p>
          <button 
            onClick={() => setActiveFilter("All")}
            className="px-6 py-2 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary/20 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* FAB for Mobile/Desktop */}
      <button 
        onClick={handlePostListing}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 w-14 h-14 bg-gradient-to-r from-secondary to-[#14603A] text-white rounded-full flex items-center justify-center shadow-xl shadow-secondary/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
