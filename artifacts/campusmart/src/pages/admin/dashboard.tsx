import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { Users, ShoppingBag, Building2, UtensilsCrossed, ShoppingCart, TrendingUp, Clock, CheckCircle, XCircle, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/lib/utils";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, color, sub, href }: any) {
  const card = (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function ActivityItem({ item }: { item: any }) {
  const isProduct = item.type === "product";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isProduct ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
        {isProduct ? "P" : "U"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
        <p className="text-xs text-gray-400">{isProduct ? `Product · ${item.status}` : `User · ${item.status}`}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">
        {new Date(item.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: adminApi.stats, refetchInterval: 30000 });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );

  const t = data?.totals || {};
  const w = data?.weekly || {};
  const products = data?.products || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500">Real-time platform stats</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={t.users ?? 0} icon={Users} color="bg-purple-500" sub={`+${w.newUsers ?? 0} this week`} href="/admin/users" />
        <StatCard label="Products" value={t.products ?? 0} icon={ShoppingBag} color="bg-blue-500" sub={`+${w.newProducts ?? 0} this week`} href="/admin/products" />
        <StatCard label="Rooms" value={t.rooms ?? 0} icon={Building2} color="bg-green-500" href="/admin/rooms" />
        <StatCard label="Food Vendors" value={t.foodVendors ?? 0} icon={UtensilsCrossed} color="bg-orange-500" href="/admin/food" />
        <StatCard label="Orders" value={t.orders ?? 0} icon={ShoppingCart} color="bg-pink-500" href="/admin/orders" />
        <StatCard label="Revenue" value={formatKES(t.revenue ?? 0)} icon={TrendingUp} color="bg-[#0A2342]" sub={`${formatKES(data?.monthly?.revenue ?? 0)} this month`} />
      </div>

      {/* Pending products alert */}
      {products.pending > 0 && (
        <Link href="/admin/products?status=pending">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">{products.pending} product{products.pending > 1 ? "s" : ""} awaiting approval</p>
              <p className="text-xs text-amber-600">Click to review and approve or reject</p>
            </div>
            <span className="ml-auto px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Review →</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Products by Category</h3>
          <div className="space-y-2.5">
            {(data?.categoryBreakdown || []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No products yet</p>
            )}
            {(data?.categoryBreakdown || []).map((c: any) => {
              const max = Math.max(...(data?.categoryBreakdown || []).map((x: any) => x.count), 1);
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 capitalize">{c.name}</span>
                    <span className="text-gray-400">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(c.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {(data?.orderStatus || []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
            )}
            {(data?.orderStatus || []).map((o: any) => {
              const colors: Record<string, string> = {
                pending: "bg-amber-100 text-amber-700",
                processing: "bg-blue-100 text-blue-700",
                delivered: "bg-green-100 text-green-700",
                cancelled: "bg-red-100 text-red-700",
              };
              return (
                <div key={o.status} className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors[o.status] || "bg-gray-100 text-gray-700"}`}>
                    {o.status}
                  </span>
                  <span className="font-bold text-gray-800">{o.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
          {(data?.recentActivity || []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
          ) : (
            <div>
              {(data?.recentActivity || []).map((item: any) => (
                <ActivityItem key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
