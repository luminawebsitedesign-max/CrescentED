import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import ModulesSidebar from '@/components/Sidebar/ModulesSidebar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

const DashboardLayout = ({ children, loading = false }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, setUser, sidebarCollapsed } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    };

    checkAuth();

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
    <div className="min-h-screen bg-background noise-texture">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      <ModulesSidebar />
      
      <main
        className={cn(
          'relative z-10 transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-72'
        )}
      >
        <div className="p-6 lg:p-8 h-screen overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
