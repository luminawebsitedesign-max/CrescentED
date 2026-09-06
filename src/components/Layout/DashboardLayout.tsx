import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getSession } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';
import { useStore } from '@/store/useStore';
import ModulesSidebar from '@/components/Sidebar/ModulesSidebar';
import DemoBanner from '@/components/DemoBanner';
import CrescentLogo from '@/components/ui/crescent-logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

const DashboardLayout = ({ children, loading = false }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user as never);
    };

    checkAuth();

    if (DEMO_MODE) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/auth');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setUser]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);


  if (!user || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background noise-texture overflow-hidden">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />

      <ModulesSidebar />

      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-background/70 backdrop-blur-sm"
        />
      )}

      <main
        className={cn(
          'relative z-10 transition-all duration-300 h-screen flex flex-col',
          'ml-0',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-[260px]'
        )}
      >
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border glass-cosmic flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileSidebarOpen(true)}
            className="h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <CrescentLogo size="sm" />
            <span className="font-sora text-sm font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          <div className="w-9" />
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-cosmic p-4 lg:p-6">
          <DemoBanner />
          {children}
        </div>

      </main>
    </div>
  );
};

export default DashboardLayout;
