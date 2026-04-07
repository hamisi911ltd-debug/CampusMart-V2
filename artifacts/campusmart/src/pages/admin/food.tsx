import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState } from "react";
import { Search, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function FoodPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-food", search, page],
    queryFn: () => adminApi.foodVendors({ search, page: String(page), limit: "20" }),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => adminApi.toggleVendor(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-food"] }); toast({ title: "Vendor updated" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteVendor(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-food"] }); toast({ title: "Vendor deleted" }); },
  });

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search vendors..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2342]" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Food Vendors <span className="text-gray-400 font-normal text-sm">({data?.total ?? 0})</span></h3>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.vendors || []).length === 0 && <p className="text-center text-gray-400 py-12 text-sm">No vendors found</p>}
            {(data?.vendors || []).map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {v.bannerImage ? <img src={v.bannerImage} alt={v.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{v.name}</p>
                  <p className="text-xs text-gray-400">{v.campus} · ⭐ {v.rating ?? "N/A"} · {v.deliveryTime}</p>
                </div>
                <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${v.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {v.isOpen ? "Open" : "Closed"}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleMut.mutate(v.id)} title="Toggle open/closed" className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    {v.isOpen ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${v.name}"?`)) deleteMut.mutate(v.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {page} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200">Prev</button>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
