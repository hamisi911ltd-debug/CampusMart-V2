import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Phone, User as UserIcon, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLoginUser, useRegisterUser } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { usePublicSettings } from "@/lib/settings";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

declare global {
  interface Window {
    google?: any;
    handleGoogleCredential?: (response: any) => void;
  }
}

function GoogleButton({ onSuccess }: { onSuccess: (token: string) => void }) {
  const { data: settings } = usePublicSettings();
  const clientId = settings?.googleClientId;

  useEffect(() => {
    if (!clientId) return;
    window.handleGoogleCredential = async (response: any) => {
      try {
        const res = await fetch(`${BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (data.token) onSuccess(data.token);
      } catch (e) { console.error(e); }
    };

    // Load Google script if not already loaded
    if (!document.getElementById("google-gsi")) {
      const script = document.createElement("script");
      script.id = "google-gsi";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Init after script loads
    const init = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: window.handleGoogleCredential,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      }
    };

    const existing = document.getElementById("google-gsi");
    if (existing && window.google?.accounts?.id) {
      init();
    } else {
      existing?.addEventListener("load", init);
    }
    return () => { delete window.handleGoogleCredential; };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="w-full">
      <div id="google-signin-btn" className="w-full flex justify-center" />
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setToken } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [, setLocation] = useLocation();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCampus, setRegCampus] = useState("University of Nairobi");

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();

  const handleGoogleSuccess = (token: string) => {
    setToken(token);
    closeAuthModal();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ data: { emailOrPhone: loginEmail, password: loginPassword } });
      setToken(res.token);
      closeAuthModal();
    } catch (error) { console.error(error); }
  };

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
      const e = error as Record<string, unknown>;
      if (e.data && typeof e.data === "object") {
        const d = e.data as Record<string, unknown>;
        if (typeof d.message === "string") return d.message;
        if (typeof d.error === "string") return d.error;
      }
      if (typeof e.message === "string") return e.message;
    }
    return fallback;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await registerMutation.mutateAsync({
        data: { email: regEmail, phone: regPhone, username: regUsername, password: regPassword, campus: regCampus },
      });
      setToken(res.token);
      closeAuthModal();
      setTimeout(() => setLocation("/profile"), 300);
    } catch (error) { console.error(error); }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAuthModal} className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] w-full sm:w-[440px] h-full sm:h-auto bg-card sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-2xl font-display font-bold text-primary">
                {mode === "login" ? "Welcome back" : "Join CampusMart"}
              </h2>
              <button onClick={closeAuthModal} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex p-1 bg-muted/50 mx-6 mt-6 rounded-xl">
              {(["login", "register"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={cn("flex-1 py-2 rounded-lg text-sm font-semibold transition-all", mode === m ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-primary")}>
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 hide-scrollbar">
              <GoogleButton onSuccess={handleGoogleSuccess} />

              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleLogin} className="flex flex-col gap-4">
                    {[
                      { label: "Email or Phone", icon: Mail, value: loginEmail, set: setLoginEmail, type: "text", placeholder: "student@campus.ac.ke" },
                      { label: "Password", icon: Lock, value: loginPassword, set: setLoginPassword, type: "password", placeholder: "••••••••" },
                    ].map(({ label, icon: Icon, value, set, type, placeholder }) => (
                      <div key={label} className="space-y-1">
                        <label className="text-sm font-medium text-foreground ml-1">{label}</label>
                        <div className="relative">
                          <Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type={type} value={value} onChange={e => set(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all" placeholder={placeholder} required />
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={loginMutation.isPending} className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-secondary to-[#14603A] text-white font-bold text-lg shadow-lg shadow-secondary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </button>
                    {loginMutation.isError && <p className="text-accent text-sm text-center">{getErrorMessage(loginMutation.error, "Invalid credentials.")}</p>}
                  </motion.form>
                ) : (
                  <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} className="flex flex-col gap-4">
                    {[
                      { label: "Username", icon: UserIcon, value: regUsername, set: setRegUsername, type: "text", placeholder: "johndoe", required: true },
                      { label: "Email", icon: Mail, value: regEmail, set: setRegEmail, type: "email", placeholder: "student@campus.ac.ke", required: true },
                      { label: "Phone (Optional)", icon: Phone, value: regPhone, set: setRegPhone, type: "tel", placeholder: "07XX XXX XXX", required: false },
                    ].map(({ label, icon: Icon, value, set, type, placeholder, required }) => (
                      <div key={label} className="space-y-1">
                        <label className="text-sm font-medium text-foreground ml-1">{label}</label>
                        <div className="relative">
                          <Icon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type={type} value={value} onChange={e => set(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all" placeholder={placeholder} required={required} />
                        </div>
                      </div>
                    ))}
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Campus</label>
                      <div className="relative">
                        <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select value={regCampus} onChange={e => setRegCampus(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all appearance-none">
                          {["University of Nairobi", "Kenyatta University", "JKUAT", "Strathmore University", "Moi University"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-foreground ml-1">Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all" placeholder="••••••••" required />
                      </div>
                    </div>
                    <button type="submit" disabled={registerMutation.isPending} className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-secondary to-[#14603A] text-white font-bold text-lg shadow-lg shadow-secondary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50">
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </button>
                    {registerMutation.isError && <p className="text-accent text-sm text-center">{getErrorMessage(registerMutation.error, "Registration failed.")}</p>}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
