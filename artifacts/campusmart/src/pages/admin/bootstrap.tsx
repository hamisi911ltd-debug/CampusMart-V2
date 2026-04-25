import { useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import campusmartLogo from "/images/Gemini_Generated_Image_t3l1e2t3l1e2t3l1 (3).png";

export default function AdminBootstrap() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleBootstrap = async () => {
    setLoading(true);
    setError("");
    try {
      await adminApi.bootstrap();
      setDone(true);
      // Reload to refresh user role from server
      setTimeout(() => window.location.href = "/admin", 1500);
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2342] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <img src={campusmartLogo} alt="CampusMart" className="w-16 h-16 rounded-2xl mx-auto mb-5 object-contain" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Setup</h1>

        {done ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-green-700">You're now admin!</p>
            <p className="text-sm text-gray-500 mt-1">Redirecting to admin panel...</p>
          </div>
        ) : !isAuthenticated ? (
          <div>
            <p className="text-gray-500 text-sm mb-5">You need to be signed in first.</p>
            <button onClick={() => navigate("/")} className="w-full py-3 bg-[#0A2342] text-white font-bold rounded-xl">Go Sign In</button>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-2">
              Signed in as <span className="font-semibold text-gray-800">{user?.username}</span>
            </p>
            <p className="text-gray-400 text-xs mb-6">
              This will promote your account to admin. Only works if no admin exists yet.
            </p>
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-xl p-3">{error}</p>}
            <button
              onClick={handleBootstrap}
              disabled={loading}
              className="w-full py-3 bg-[#0A2342] text-white font-bold rounded-xl hover:bg-[#0A2342]/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting up..." : "Make Me Admin"}
            </button>
            <button onClick={() => navigate("/")} className="w-full mt-3 py-2.5 text-gray-500 text-sm hover:text-gray-700">
              ← Back to site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
