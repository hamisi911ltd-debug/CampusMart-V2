import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatKES } from "@/lib/utils";

const STATUSES = ["", "pending", "processing", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () => adminApi.orders({ ...(status ? { status } : {}), page: String(page), limit: "20" }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.setOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast({ title: "Order updated" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          {STATUSES.map(s => <option key={s} value={s}>{s || "All Status"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Orders <span className="text-gray-400 font-normal text-sm">({data?.total ?? 0})</span></h3>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.orders || []).length === 0 && <p className="text-center text-gray-400 py-12 text-sm">No orders found</p>}
            {(data?.orders || []).map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{o.orderId || o.id}</p>
                  <p className="text-xs text-gray-400">by {o.buyerUsername} · {new Date(o.createdAt).toLocaleDateString()}</p>
                  {o.whatsappNumber && (
                    <a
                      href={`https://wa.me/${o.whatsappNumber.replace(/\D/g, "").replace(/^0/, "254")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-green-700 font-semibold mt-0.5 hover:underline"
                    >
                      📱 {o.whatsappNumber}
                    </a>
                  )}
                </div>
                <span className="font-semibold text-gray-800 text-sm">{formatKES(o.totalAmount || 0)}</span>
                {o.paymentMethod === "pay_on_delivery" && (
                  <span className="hidden sm:inline-flex px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">POD</span>
                )}
                <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>
                  {o.status}
                </span>
                <select
                  value={o.status}
                  onChange={e => statusMut.mutate({ id: o.id, status: e.target.value })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none bg-white"
                >
                  {["pending", "processing", "delivered", "cancelled"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
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
