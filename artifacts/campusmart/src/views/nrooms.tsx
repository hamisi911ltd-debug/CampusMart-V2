import { useState } from "react";
import { RoomCard } from "@/components/shared";
import { useListRooms } from "@workspace/api-client-react";

const FILTERS = ["All", "Bedsitter", "Single Room", "1 Bedroom", "2 Bedroom", "Hostel"];

export default function Nrooms() {
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Transform UI filter to API enum string
  const getFilterType = () => {
    if (activeFilter === "All") return undefined;
    return activeFilter.toLowerCase().replace(' ', '_');
  };

  const { data: rooms, isLoading } = useListRooms({ type: getFilterType() });

  return (
    <div className="px-4 md:px-8 max-w-4xl mx-auto py-6 md:py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-lg">Nrooms</span>
          Housing
        </h1>
        <p className="text-muted-foreground">Find the perfect place to stay near campus.</p>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter 
                ? "bg-secondary text-white shadow-md shadow-secondary/20" 
                : "bg-white border border-border/80 text-muted-foreground hover:border-secondary/50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl h-48 md:h-64 w-full" />
          ))}
        </div>
      ) : rooms?.length ? (
        <div className="space-y-6">
          {rooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border/60">
          <div className="text-6xl mb-4">🏚️</div>
          <h3 className="text-xl font-bold mb-2">No rooms found</h3>
          <p className="text-muted-foreground">We couldn't find any rooms matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
