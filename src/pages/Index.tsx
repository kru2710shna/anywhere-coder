import { useState, useEffect } from 'react';
import { MobileView } from '@/components/MobileView';
import { DashboardView } from '@/components/DashboardView';

const Index = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [forceView, setForceView] = useState<'mobile' | 'dashboard' | null>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const showMobile = forceView === 'mobile' || (forceView === null && isMobile);

  return showMobile ? (
    <MobileView onSwitchView={() => setForceView('dashboard')} />
  ) : (
    <DashboardView onSwitchView={() => setForceView('mobile')} />
  );
};

export default Index;
