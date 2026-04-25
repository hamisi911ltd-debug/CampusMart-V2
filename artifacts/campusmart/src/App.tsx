import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout";
import { AuthModal } from "@/components/auth-modal";
import { useSplash } from "@/hooks/use-splash";

// Pages
import Home from "@/pages/home";
import Market from "@/pages/market";
import Food from "@/pages/food";
import Houses from "@/pages/houses";
import Profile from "@/pages/profile";
import Cart from "@/pages/cart";
import ProductDetail from "@/pages/product-detail";
import NotFound from "@/pages/not-found";
import AdminPortal from "@/pages/admin";
import AdminBootstrap from "@/pages/admin/bootstrap";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

/** Guard: only renders children if user is admin, otherwise shows access denied */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2342]">
      <div className="text-white text-center">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-white/60">Checking access...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2342]">
      <div className="text-center text-white p-8">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-white/60 text-sm mb-6">You need to be signed in to access the admin panel.</p>
        <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-white text-[#0A2342] font-bold rounded-xl text-sm">Go to Site</button>
      </div>
    </div>
  );

  if (user?.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2342]">
      <div className="text-center text-white p-8 max-w-sm">
        <p className="text-4xl mb-4">🚫</p>
        <h2 className="text-xl font-bold mb-2">Admin access only</h2>
        <p className="text-white/60 text-sm mb-6">Your account doesn't have admin privileges.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl text-sm hover:bg-white/20">← Back to Site</button>
          <button onClick={() => navigate("/admin/bootstrap")} className="px-5 py-2.5 bg-white text-[#0A2342] font-bold rounded-xl text-sm">Become Admin</button>
        </div>
      </div>
    </div>
  );

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Admin routes — outside AppLayout */}
      <Route path="/admin/bootstrap" component={AdminBootstrap} />
      <Route path="/admin/:rest*">
        {() => <AdminGuard><AdminPortal /></AdminGuard>}
      </Route>
      <Route path="/admin">
        {() => <AdminGuard><AdminPortal /></AdminGuard>}
      </Route>

      {/* Main app routes */}
      <Route path="/" component={Home} />
      <Route path="/market" component={Market} />
      <Route path="/food" component={Food} />
      <Route path="/houses" component={Houses} />
      <Route path="/profile" component={Profile} />

      <Route path="/cart" component={Cart} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  useSplash(1800);
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) return <Router />;

  return (
    <>
      <AppLayout>
        <Router />
      </AppLayout>
      <AuthModal />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
            <AppShell />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
