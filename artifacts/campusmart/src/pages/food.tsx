import { useState } from "react";
import { VendorCard } from "@/components/shared";
import { useListFoodVendors } from "@workspace/api-client-react";

const CATEGORIES = ["All", "Meals", "Snacks", "Drinks", "Combos", "Healthy"];

export default function Food() {
  const [activeFilter, setActiveFilter] = useState("All");
  const { data: vendors, isLoading } = useListFoodVendors();

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto py-6 md:py-8 min-h-screen">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Campus Food</h1>
        <p className="text-muted-foreground max-w-lg">Craving something? Order food from the best vendors around campus, delivered fast.</p>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {CATEGORIES.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter 
                ? "bg-accent text-white shadow-md shadow-accent/20" 
                : "bg-white border border-border/80 text-muted-foreground hover:border-accent/50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl h-64 w-full" />
          ))}
        </div>
      ) : vendors?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border/60">
          <p className="text-muted-foreground text-lg">No vendors open right now. Check back later!</p>
        </div>
      )}
    </div>
  );
}
