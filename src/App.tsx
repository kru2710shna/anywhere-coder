import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardView } from "@/components/DashboardView";
import { MobileView } from "@/components/MobileView";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppStore } from "@/lib/store";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";

type Screen = "home" | "onboarding" | "app" | "settings";

function App() {
  const isMobile = useIsMobile();
  const { checkRelayHealth, checkGithubConnection, settings } = useAppStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [forceView, setForceView] = useState<"mobile" | "dashboard" | null>(null);

  const view = forceView ?? (isMobile ? "mobile" : "dashboard");

  useEffect(() => {
    checkRelayHealth();
    checkGithubConnection();
    const t = setInterval(() => {
      checkRelayHealth();
      checkGithubConnection();
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const handleEnter = () => {
    if (!settings.onboardingComplete) {
      setScreen("onboarding");
    } else {
      setScreen("app");
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {screen === "home" && <Home onEnter={handleEnter} />}
      {screen === "onboarding" && (
        <Onboarding onComplete={() => setScreen("app")} />
      )}
      {screen === "settings" && (
        <Settings onBack={() => setScreen("app")} />
      )}
      {screen === "app" && view === "mobile" && (
        <MobileView onSwitchView={() => setForceView("dashboard")} />
      )}
      {screen === "app" && view === "dashboard" && (
        <DashboardView
          onSwitchView={() => setForceView("mobile")}
          onOpenSettings={() => setScreen("settings")}
        />
      )}
    </TooltipProvider>
  );
}

export default App;
