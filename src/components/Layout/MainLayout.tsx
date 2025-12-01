import { useState } from 'react';
import { ListTodo, Target, TrendingUp, Settings, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: 'tasks' | 'habits' | 'goals' | 'ai' | 'settings';
  onViewChange: (view: 'tasks' | 'habits' | 'goals' | 'ai' | 'settings') => void;
}

export const MainLayout = ({ children, currentView, onViewChange }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'tasks' as const, icon: ListTodo, label: 'Tasks' },
    { id: 'habits' as const, icon: TrendingUp, label: 'Habits' },
    { id: 'goals' as const, icon: Target, label: 'Goals' },
    { id: 'ai' as const, icon: Sparkles, label: 'AI Assistant' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "transition-all duration-300 border-r border-border bg-card",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        {sidebarOpen && (
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="mb-8 ">
              <h1 className="text-3xl font-orbitron holographic-text tracking-wider">
                NEXUS
              </h1>
              <p className="text-xs text-muted-foreground mt-1">AI-Powered Productivity</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    currentView === item.id && "glow-cyan"
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Sacred Geometry Pattern */}
            <div className="mt-auto pt-4 opacity-30">
              <svg viewBox="0 0 100 100" className="w-full h-20">
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="0.5" />
                <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" />
              </svg>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:glow-cyan"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">System Active</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
