import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api";
import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function fetchAdminSettings() {
  const token = localStorage.getItem("campusmart_token");
  const res = await fetch(`${BASE}/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function saveAdminSettings(data: any) {
  const token = localStorage.getItem("campusmart_token");
  const res = await fetch(`${BASE}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", secret }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={secret && !show ? "password" : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0A2342] bg-white pr-10"
      />
      {secret && (
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-[#1A7A4A]" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: fetchAdminSettings });

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);

  const saveMut = useMutation({
    mutationFn: saveAdminSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["public-settings"] });
      toast({ title: "Settings saved" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const set = (key: string) => (val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500">Configure API keys, features and platform behaviour</p>
        </div>
        <button
          onClick={() => saveMut.mutate(form)}
          disabled={saveMut.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2342] text-white font-semibold rounded-xl text-sm hover:bg-[#0A2342]/90 disabled:opacity-50 transition-colors"
        >
          {saveMut.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* General */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">General</h3>
        <Field label="Site Name">
          <TextInput value={form.siteName || ""} onChange={set("siteName")} placeholder="CampusMart" />
        </Field>
        <Field label="Support Email">
          <TextInput value={form.supportEmail || ""} onChange={set("supportEmail")} placeholder="support@campusmart.ac.ke" type="email" />
        </Field>
        <Field label="WhatsApp Support Number" hint="Shown to users for support queries">
          <TextInput value={form.whatsappSupport || ""} onChange={set("whatsappSupport")} placeholder="+254 7XX XXX XXX" />
        </Field>
      </section>

      {/* API Keys */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">API Keys</h3>
        <Field label="Google Client ID" hint="For Google Sign-In. Get from console.cloud.google.com → OAuth 2.0 Client IDs">
          <TextInput value={form.googleClientId || ""} onChange={set("googleClientId")} placeholder="123456789-abc.apps.googleusercontent.com" secret />
        </Field>
        <Field label="Google Maps API Key" hint="For delivery map & location. Enable Maps JavaScript API + Places API + Geocoding API">
          <TextInput value={form.googleMapsApiKey || ""} onChange={set("googleMapsApiKey")} placeholder="AIzaSy..." secret />
        </Field>
      </section>

      {/* Commerce */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Commerce</h3>
        <Field label="Delivery Fee (KES)" hint="Set to 0 for free delivery">
          <TextInput value={form.deliveryFee ?? 0} onChange={(v: string) => set("deliveryFee")(Number(v))} placeholder="0" type="number" />
        </Field>
        <Field label="Max Cart Items">
          <TextInput value={form.maxCartItems ?? 20} onChange={(v: string) => set("maxCartItems")(Number(v))} placeholder="20" type="number" />
        </Field>
        <Field label="Featured Products Limit">
          <TextInput value={form.featuredProductsLimit ?? 8} onChange={(v: string) => set("featuredProductsLimit")(Number(v))} placeholder="8" type="number" />
        </Field>
        <div className="pt-2">
          <Toggle value={!!form.payOnDelivery} onChange={set("payOnDelivery")} label="Enable Pay on Delivery" />
        </div>
      </section>

      {/* Platform */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3">Platform</h3>
        <Toggle value={!!form.allowRegistrations} onChange={set("allowRegistrations")} label="Allow New Registrations" />
        <Toggle value={!!form.maintenanceMode} onChange={set("maintenanceMode")} label="Maintenance Mode" />
      </section>
    </div>
  );
}
