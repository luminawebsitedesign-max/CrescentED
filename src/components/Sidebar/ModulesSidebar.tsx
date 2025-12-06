import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CrescentLogo from '@/components/ui/crescent-logo';
import {
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Wrench,
  FileText,
  User,
  BookOpen,
  CheckCircle,
  Circle,
  StickyNote,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DOMAIN_LABELS, DOMAIN_ICONS, type Module, type ModuleProgress } from '@/types/crescented';

const ModulesSidebar = () => {
  const location = useLocation();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    modules, 
    currentModuleId,
    setCurrentModuleId,
    intake 
  } = useStore();
  const [userDataOpen, setUserDataOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const calculateModuleProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const isModuleActive = (moduleId: string) => {
    return currentModuleId === moduleId || location.pathname === `/module/${moduleId}`;
  };

  const isModuleComplete = (module: Module) => calculateModuleProgress(module) === 100;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 glass-cosmic border-r border-border transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header - Logo & Settings */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <CrescentLogo size={sidebarCollapsed ? 'sm' : 'md'} />
          {!sidebarCollapsed && (
            <span className="font-sora text-lg font-bold text-gradient-cosmic">
              CrescentEd
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          {!sidebarCollapsed && (
            <Link to="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {sidebarCollapsed ? (
        /* Collapsed View */
        <div className="flex-1 flex flex-col items-center py-4 gap-2">
          <Link to="/dashboard">
            <Button
              variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                location.pathname === '/dashboard' && 'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/tools">
            <Button
              variant={location.pathname === '/tools' ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                location.pathname === '/tools' && 'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              <Wrench className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/pdfs">
            <Button
              variant={location.pathname === '/pdfs' ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                location.pathname === '/pdfs' && 'bg-primary/10 text-primary border border-primary/20'
              )}
            >
              <FileText className="w-5 h-5" />
            </Button>
          </Link>
          <div className="my-2 w-8 h-px bg-border" />
          {modules.slice(0, 5).map((module) => (
            <Button
              key={module.id}
              variant={isModuleActive(module.id) ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setCurrentModuleId(module.id)}
              className={cn(
                'relative',
                isModuleActive(module.id) && 'bg-primary/10 text-primary border border-primary/20'
              )}
              title={module.title}
            >
              {isModuleComplete(module) ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
            </Button>
          ))}
          {modules.length > 5 && (
            <span className="text-xs text-muted-foreground">+{modules.length - 5}</span>
          )}
        </div>
      ) : (
        /* Expanded View */
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {/* Dashboard / AI Tutor */}
            <Link to="/dashboard">
              <Button
                variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  location.pathname === '/dashboard' && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <span>AI Tutor</span>
              </Button>
            </Link>

            {/* Tools */}
            <Link to="/tools">
              <Button
                variant={location.pathname === '/tools' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  location.pathname === '/tools' && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <Wrench className="w-5 h-5 flex-shrink-0" />
                <span>Tools</span>
              </Button>
            </Link>

            {/* My PDFs */}
            <Link to="/pdfs">
              <Button
                variant={location.pathname === '/pdfs' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  location.pathname === '/pdfs' && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span>My PDFs</span>
              </Button>
            </Link>

            {/* Divider */}
            <div className="my-4 h-px bg-border" />

            {/* Modules Section Header */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Your Modules
              </span>
              <span className="text-xs text-muted-foreground">
                {modules.filter(m => isModuleComplete(m)).length}/{modules.length}
              </span>
            </div>

            {/* Module List */}
            {modules.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No modules yet</p>
                <p className="text-xs text-muted-foreground mt-1">Complete onboarding to generate your course</p>
              </div>
            ) : (
              <div className="space-y-1">
                {modules.map((module, index) => {
                  const isActive = isModuleActive(module.id);
                  const isComplete = isModuleComplete(module);
                  const progress = calculateModuleProgress(module);
                  const domainKey = module.domain as keyof typeof DOMAIN_ICONS;

                  return (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleId(module.id)}
                      className={cn(
                        'w-full text-left px-3 py-3 rounded-lg transition-all group',
                        isActive 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-secondary/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium',
                          isComplete ? 'bg-green-500/20 text-green-500' : 
                          isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        )}>
                          {isComplete ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isActive && 'text-primary'
                          )}>
                            {module.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs">
                              {DOMAIN_ICONS[domainKey] || '📚'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {DOMAIN_LABELS[domainKey] || module.domain}
                            </span>
                          </div>
                          {!isComplete && progress > 0 && (
                            <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full progress-cosmic rounded-full"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Divider */}
            <div className="my-4 h-px bg-border" />

            {/* User Data Section */}
            <Collapsible open={userDataOpen} onOpenChange={setUserDataOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span>My Profile & Notes</span>
                  </div>
                  {userDataOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 space-y-2">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/intake?edit=true">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    Edit Onboarding
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sm">
                    <StickyNote className="w-4 h-4" />
                    Master Notes
                  </Button>
                </Link>
                {intake && (
                  <div className="mt-2 p-3 rounded-lg bg-secondary/50 text-xs">
                    <p className="font-medium mb-1">Your Idea:</p>
                    <p className="text-muted-foreground line-clamp-2">{intake.idea}</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      )}

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

export default ModulesSidebar;
