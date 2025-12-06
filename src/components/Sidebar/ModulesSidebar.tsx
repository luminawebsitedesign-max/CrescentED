import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  CheckCircle,
  StickyNote,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type Module, type ModuleProgress } from '@/types/crescented';

// Moon phase icons for module progression
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

// Short creative display names for modules
const getShortName = (title: string, index: number): string => {
  const shortNames: Record<string, string> = {
    'budgeting': 'Budget Basics',
    'pricing': 'Price It Right',
    'invoicing': 'Invoice Flow',
    'social media': 'Social Setup',
    'branding': 'Brand DNA',
    'website': 'Web Launch',
    'accounting': 'Money Moves',
    'customer': 'Customer Love',
    'automation': 'Auto-Magic',
    'contracts': 'Legal Shield',
    'marketing': 'Market Attack',
    'product': 'Product Craft',
    'launch': 'Launch Day',
    'scaling': 'Scale Up',
    'business foundations': 'Foundations',
    'running a business': 'Operations',
    'customer success': 'Client Wins',
    'personal development': 'Growth Mode',
    'philosophy': 'Big Picture',
  };
  
  const lowerTitle = title.toLowerCase();
  for (const [key, shortName] of Object.entries(shortNames)) {
    if (lowerTitle.includes(key)) return shortName;
  }
  
  // Fallback: use first 2-3 words
  const words = title.split(' ').slice(0, 3);
  return words.join(' ').substring(0, 20) + (title.length > 20 ? '…' : '');
};

const getMoonPhase = (index: number, total: number, isComplete: boolean): string => {
  if (isComplete) return '🌕';
  const phase = Math.floor((index / Math.max(total - 1, 1)) * 4);
  return MOON_PHASES[Math.min(phase, 4)];
};

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
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      )}
    >
        {/* Header - Logo & Settings */}
        <div className="p-3 border-b border-border flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <CrescentLogo size={sidebarCollapsed ? 'sm' : 'sm'} />
            {!sidebarCollapsed && (
              <span className="font-sora text-base font-bold text-gradient-cosmic">
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
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-foreground h-8 w-8"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {sidebarCollapsed ? (
          /* Collapsed View */
          <div className="flex-1 flex flex-col items-center py-3 gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard">
                  <Button
                    variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9',
                      location.pathname === '/dashboard' && 'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/tools">
                  <Button
                    variant={location.pathname === '/tools' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9',
                      location.pathname === '/tools' && 'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    <Wrench className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Tools</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/pdfs">
                  <Button
                    variant={location.pathname === '/pdfs' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9',
                      location.pathname === '/pdfs' && 'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">My PDFs</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/profile">
                  <Button
                    variant={location.pathname === '/profile' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9',
                      location.pathname === '/profile' && 'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Profile & Notes</TooltipContent>
            </Tooltip>
            
            <div className="my-2 w-8 h-px bg-border" />
            
            {/* Collapsed module list */}
            <ScrollArea className="flex-1 w-full">
              <div className="flex flex-col items-center gap-1 px-2">
                {modules.map((module, index) => (
                  <Tooltip key={module.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isModuleActive(module.id) ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setCurrentModuleId(module.id)}
                        className={cn(
                          'h-9 w-9 relative',
                          isModuleActive(module.id) && 'bg-primary/10 text-primary border border-primary/20'
                        )}
                      >
                        <span className="text-sm">
                          {getMoonPhase(index, modules.length, isModuleComplete(module))}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{module.title}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Expanded View */
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {/* Dashboard */}
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 text-sm',
                    location.pathname === '/dashboard' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              {/* Tools */}
              <Link to="/tools">
                <Button
                  variant={location.pathname === '/tools' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 text-sm',
                    location.pathname === '/tools' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <Wrench className="w-4 h-4 flex-shrink-0" />
                  <span>Tools</span>
                </Button>
              </Link>

              {/* My PDFs */}
              <Link to="/pdfs">
                <Button
                  variant={location.pathname === '/pdfs' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 text-sm',
                    location.pathname === '/pdfs' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>My PDFs</span>
                </Button>
              </Link>

              {/* Profile & Notes */}
              <Link to="/profile">
                <Button
                  variant={location.pathname === '/profile' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 text-sm',
                    location.pathname === '/profile' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Profile & Notes</span>
                </Button>
              </Link>

              {/* Divider */}
              <div className="my-3 h-px bg-border" />

              {/* Modules Section Header */}
              <div className="px-2 py-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Modules
                </span>
                <span className="text-xs text-muted-foreground">
                  {modules.filter(m => isModuleComplete(m)).length}/{modules.length}
                </span>
              </div>

              {/* Module List */}
              {modules.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground">No modules yet</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {modules.map((module, index) => {
                    const isActive = isModuleActive(module.id);
                    const isComplete = isModuleComplete(module);
                    const shortName = getShortName(module.title, index);

                    return (
                      <Tooltip key={module.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setCurrentModuleId(module.id)}
                            className={cn(
                              'w-full text-left px-2 py-2 rounded-lg transition-all group flex items-center gap-2',
                              isActive 
                                ? 'bg-primary/10 border border-primary/30' 
                                : 'hover:bg-secondary/50'
                            )}
                          >
                            <span className="text-base flex-shrink-0">
                              {getMoonPhase(index, modules.length, isComplete)}
                            </span>
                            <span className={cn(
                              'text-sm font-medium truncate flex-1',
                              isActive && 'text-primary',
                              isComplete && 'text-green-500'
                            )}>
                              {shortName}
                            </span>
                            {isComplete && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="font-medium">{module.title}</p>
                          {module.description && (
                            <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              )}

              {/* Divider */}
              <div className="my-3 h-px bg-border" />

              {/* User Data Collapsible */}
              <Collapsible open={userDataOpen} onOpenChange={setUserDataOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between gap-2 h-9 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 flex-shrink-0" />
                      <span>My Data</span>
                    </div>
                    {userDataOpen ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 py-1 space-y-1">
                  <Link to="/intake?edit=true">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs h-8">
                      <FileText className="w-3 h-3" />
                      Edit Onboarding
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs h-8">
                      <StickyNote className="w-3 h-3" />
                      Master Notes
                    </Button>
                  </Link>
                  {intake && (
                    <div className="mt-1 p-2 rounded-lg bg-secondary/50 text-xs">
                      <p className="font-medium mb-0.5">Your Idea:</p>
                      <p className="text-muted-foreground line-clamp-2">{intake.idea}</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        )}

        {/* Logout */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full justify-start gap-2 text-muted-foreground hover:text-destructive h-9 text-sm',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </Button>
        </div>
      </aside>
  );
};

export default ModulesSidebar;
