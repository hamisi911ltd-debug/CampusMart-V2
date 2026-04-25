import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState, useEffect } from "react";
import { Search, Trash2, CheckCircle, XCircle, Star, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatKES } from "@/lib/utils";
import { useSearch } from "wouter";

const STATUSES = ["", "active", "pending", "rejected", "sold"];
const CATEGORIES = ["", "books", "electronics", "fashion", "stationery", "services", "furniture"];

export default function ProductsPage() {
  const qs = useSearch();
  const params = new URLSearchParams(qs);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(params.get("status") || "");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => { setStatus(params.get("status") || ""); }, [qs]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search, status, category, page],
    queryFn: () => adminApi.products({ search, status, category, page: String(page), limit: "20" }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.setProductStatus(id, status),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast({ title: `Product ${v.status}` }); },
  });

  const featuredMut = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => adminApi.setProductFeatured(id, featured),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast({ title: "Featured updated" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast({ title: "Product deleted" }); },
  });

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    sold: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2342]"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          {STATUSES.map(s => <option key={s} value={s}>{s || "All Status"}</option>)}
        </select>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          {CATEGORIES.map(c => <option key={c} value={c}>{c || "All Categories"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Products <span className="text-gray-400 font-normal text-sm">({data?.total ?? 0})</span></h3>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.products || []).length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No products found</p>
            )}
            {(data?.products || []).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">by {p.sellerUsername} · {p.category} · {formatKES(p.price)}</p>
                </div>

                <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[p.status] || "bg-gray-100 text-gray-600"}`}>
                  {p.status}
                </span>

                <div className="flex items-center gap-1">
                  {/* Approve */}
                  {p.status !== "active" && (
                    <button
                      onClick={() => statusMut.mutate({ id: p.id, status: "active" })}
                      title="Approve"
                      className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {/* Reject */}
                  {p.status !== "rejected" && (
                    <button
                      onClick={() => statusMut.mutate({ id: p.id, status: "rejected" })}
                      title="Reject"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  {/* Feature toggle */}
                  <button
                    onClick={() => featuredMut.mutate({ id: p.id, featured: !p.featured })}
                    title={p.featured ? "Unfeature" : "Feature"}
                    className={`p-1.5 rounded-lg transition-colors ${p.featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-300 hover:bg-gray-50"}`}
                  >
                    <Star className="w-4 h-4" fill={p.featured ? "currentColor" : "none"} />
                  </button>
                  {/* View */}
                  <a href={`/product/${p.id}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </a>
                  {/* Delete */}
                  <button
                    onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMut.mutate(p.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
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
