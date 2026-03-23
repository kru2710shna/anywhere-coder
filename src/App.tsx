import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardView } from "@/components/DashboardView";
import { MobileView } from "@/components/MobileView";
import { useIsMobile } from "@/hooks/use-mobile";
import Home from "@/pages/Home";

type Screen = "home" | "app";

function App() {
  const isMobile = useIsMobile();
  const { checkRelayHealth } = useAppStore();
  useEffect(() => { checkRelayHealth(); const t = setInterval(checkRelayHealth, 5000); return () => clearInterval(t); }, []);
  const [screen, setScreen] = useState<Screen>("home");
  const [forceView, setForceView] = useState<"mobile" | "dashboard" | null>(null);

  const view = forceView ?? (isMobile ? "mobile" : "dashboard");

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {screen === "home" ? (
        <Home onEnter={() => setScreen("app")} />
      ) : view === "mobile" ? (
        <MobileView onSwitchView={() => setForceView("dashboard")} />
      ) : (
        <DashboardView onSwitchView={() => setForceView("mobile")} />
      )}
    </TooltipProvider>
  );
}

export default App;
