import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import CrescentLogo from '@/components/ui/crescent-logo';
import {
  LayoutDashboard,
  BookOpen,
  Wrench,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'My Course', path: '/modules' },
  { icon: Wrench, label: 'Tools', path: '/tools' },
  { icon: FileText, label: 'My PDFs', path: '/pdfs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const AppSidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, setTutorOpen } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 glass-cosmic border-r border-border transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <CrescentLogo size={sidebarCollapsed ? 'sm' : 'md'} />
          {!sidebarCollapsed && (
            <span className="font-sora text-lg font-bold text-gradient-cosmic">
              CrescentEd
            </span>
          )}
        </Link>
        {!sidebarCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(false)}
          className="mx-auto mt-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/modules' && location.pathname.startsWith('/module/'));
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 transition-all',
                  isActive && 'bg-primary/10 text-primary border border-primary/20',
                  sidebarCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}

        {/* AI Tutor Button */}
        <Button
          variant="ghost"
          onClick={() => setTutorOpen(true)}
          className={cn(
            'w-full justify-start gap-3 text-cosmic-sapphire hover:text-cosmic-sapphire hover:bg-cosmic-sapphire/10',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>AI Tutor</span>}
        </Button>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-destructive',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
