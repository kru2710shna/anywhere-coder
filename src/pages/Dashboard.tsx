import { useState, useEffect } from 'react';
import { MobileView } from '@/components/MobileView';
import { DashboardView } from '@/components/DashboardView';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [forceView, setForceView] = useState<'mobile' | 'dashboard' | null>(null);
  const { isSignedIn, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) navigate('/auth');
  }, [isSignedIn, navigate]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (!isSignedIn) return null;

  const showMobile = forceView === 'mobile' || (forceView === null && isMobile);

  return (
    <div className="relative">
      <button
        onClick={handleSignOut}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>

      {showMobile ? (
        <MobileView onSwitchView={() => setForceView('dashboard')} />
      ) : (
        <DashboardView onSwitchView={() => setForceView('mobile')} />
      )}
    </div>
  );
};

export default Dashboard;
