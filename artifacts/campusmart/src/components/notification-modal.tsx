import { useState } from "react";
import { Bell, X, Check, ShoppingBag, Info, AlertCircle, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useListOrders } from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";

interface NotificationModalProps {
  onClose: () => void;
}

export default function NotificationModal({ onClose }: NotificationModalProps) {
  const { isAuthenticated, token } = useAuth();
  const { data: orders } = useListOrders({
    query: { queryKey: ["orders"], enabled: !!token, staleTime: 60000 }
  });

  // Build notifications from real orders + static welcome
  const notifications = [
    {
      id: "welcome",
      title: "Welcome to CampusMart!",
      message: "Start exploring items from students in your campus.",
      type: "info" as const,
      time: "now",
      read: true,
    },
    ...((orders as any[]) || []).slice(0, 5).map((order: any) => ({
      id: order.id,
      title: `Order ${order.orderId}`,
      message: `Status: ${order.status} · ${formatKES(order.totalAmount)} · ${order.paymentMethod === "pay_on_delivery" ? "Pay on Delivery" : "Paid"}`,
      type: "order" as const,
      time: new Date(order.createdAt).toLocaleDateString(),
      read: order.status === "delivered" || order.status === "cancelled",
    })),
  ];

  const [readIds, setReadIds] = useState<Set<string>>(new Set(notifications.filter(n => n.read).map(n => n.id)));
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)));
  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  const iconMap = {
    success: <Check className="w-4 h-4 text-emerald-500" />,
    order: <Package className="w-4 h-4 text-blue-500" />,
    alert: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-[#0A2342]" />,
  };

  const bgMap = {
    success: "bg-emerald-50",
    order: "bg-blue-50",
    alert: "bg-red-50",
    info: "bg-[#0A2342]/5",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center sm:items-center sm:pt-0 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-border"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-[#0A2342]">Notifications</h2>
            {unread > 0 && <span className="px-2 py-0.5 bg-[#D0282E] text-white text-[10px] font-bold rounded-full">{unread} NEW</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-[11px] font-bold text-[#1A7A4A] hover:bg-[#1A7A4A]/5 px-2 py-1 rounded-lg transition-colors">
              Mark all read
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground">No notifications yet.</p>
            </div>
          ) : notifications.map((n) => {
            const isRead = readIds.has(n.id);
            return (
              <div
                key={n.id}
                onClick={() => setReadIds(s => new Set([...s, n.id]))}
                className={`p-4 flex gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${isRead ? "bg-white" : "bg-[#0A2342]/[0.02]"}`}
              >
                <div className={`mt-0.5 w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${bgMap[n.type]}`}>
                  {iconMap[n.type]}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-bold leading-none ${isRead ? "text-foreground" : "text-[#0A2342]"}`}>{n.title}</p>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                </div>
                {!isRead && <div className="mt-1.5 w-2 h-2 rounded-full bg-[#D0282E] shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t bg-gray-50/50">
          <button onClick={onClose} className="w-full py-2.5 text-xs font-bold text-[#0A2342] bg-white border border-border rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
