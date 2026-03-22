import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardView } from "@/components/DashboardView";
import { MobileView } from "@/components/MobileView";
import { useIsMobile } from "@/hooks/use-mobile";

function App() {
  const isMobile = useIsMobile();
  const [forceView, setForceView] = useState<"mobile" | "dashboard" | null>(null);

  const view = forceView ?? (isMobile ? "mobile" : "dashboard");

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {view === "mobile" ? (
        <MobileView onSwitchView={() => setForceView("dashboard")} />
      ) : (
        <DashboardView onSwitchView={() => setForceView("mobile")} />
      )}
    </TooltipProvider>
  );
}

export default App;
