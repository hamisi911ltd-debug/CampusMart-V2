import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState } from "react";
import { Search, Trash2, Shield, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, role, page],
    queryFn: () => adminApi.users({ search, role, page: String(page), limit: "20" }),
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.setUserRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Role updated" }); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "User deleted" }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2342]"
          />
        </div>
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Users <span className="text-gray-400 font-normal text-sm">({data?.total ?? 0})</span></h3>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.users || []).length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No users found</p>
            )}
            {(data?.users || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#0A2342]/10 flex items-center justify-center text-sm font-bold text-[#0A2342] uppercase shrink-0">
                  {u.username?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{u.username}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="hidden sm:block text-xs text-gray-400">{u.campus || "—"}</div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-[#0A2342] text-white" : "bg-gray-100 text-gray-600"}`}>
                  {u.role}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => roleMut.mutate({ id: u.id, role: u.role === "admin" ? "student" : "admin" })}
                    title={u.role === "admin" ? "Demote to student" : "Promote to admin"}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                  >
                    {u.role === "admin" ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete ${u.username}?`)) deleteMut.mutate(u.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {page} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors">Prev</button>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
