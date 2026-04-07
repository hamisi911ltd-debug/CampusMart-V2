import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState } from "react";
import { Search, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatKES } from "@/lib/utils";

export default function RoomsPage() {
  const [search, setSearch] = useState("");
  const [available, setAvailable] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rooms", search, available, page],
    queryFn: () => adminApi.rooms({ search, ...(available !== "" ? { available } : {}), page: String(page), limit: "20" }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) => adminApi.setRoomAvailable(id, available),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rooms"] }); toast({ title: "Room updated" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteRoom(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-rooms"] }); toast({ title: "Room deleted" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search rooms..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2342]" />
        </div>
        <select value={available} onChange={e => { setAvailable(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Rooms <span className="text-gray-400 font-normal text-sm">({data?.total ?? 0})</span></h3>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.rooms || []).length === 0 && <p className="text-center text-gray-400 py-12 text-sm">No rooms found</p>}
            {(data?.rooms || []).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {r.images?.[0] ? <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.type} · {formatKES(r.monthlyRent)}/mo · {r.campus}</p>
                </div>
                <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${r.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {r.available ? "Available" : "Taken"}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleMut.mutate({ id: r.id, available: !r.available })} title="Toggle availability" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors">
                    {r.available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${r.title}"?`)) deleteMut.mutate(r.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
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
