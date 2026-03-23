import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CrescentLogo from '@/components/ui/crescent-logo';
import {
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  FileText,
  User,
  CheckCircle,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type Module, type ModuleProgress } from '@/types/crescented';

// Moon phase icons for module progression
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

// Short creative display names for modules
const getShortName = (title: string): string => {
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
  
  // Fallback: use first 2-3 words max 18 chars
  const words = title.split(' ').slice(0, 3);
  const shortened = words.join(' ');
  return shortened.length > 18 ? shortened.substring(0, 18) + '…' : shortened;
};

const getMoonPhase = (index: number, total: number, isComplete: boolean): string => {
  if (isComplete) return '🌕';
  const phase = Math.floor((index / Math.max(total - 1, 1)) * 4);
  return MOON_PHASES[Math.min(phase, 4)];
};

const ModulesSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    modules, 
    currentModuleId,
    setCurrentModuleId,
    intake 
  } = useStore();
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const calculateModuleProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  // Only show modules as active when on dashboard or module pages
  const isOnModulePage = location.pathname === '/dashboard' || location.pathname.startsWith('/module/');
  const isModuleActive = (moduleId: string) => {
    if (!isOnModulePage) return false;
    return currentModuleId === moduleId || location.pathname === `/module/${moduleId}`;
  };

  const isModuleComplete = (module: Module) => calculateModuleProgress(module) === 100;

  const handleModuleClick = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    navigate('/dashboard');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 glass-cosmic border-r border-border transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Header - Logo & Settings */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2">
          <CrescentLogo size="sm" />
          {!sidebarCollapsed && (
            <span className="font-sora text-base font-bold text-gradient-cosmic">
              CrescentEd
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {sidebarCollapsed ? (
        /* Collapsed View */
        <div className="flex-1 flex flex-col items-center py-3 gap-1 overflow-hidden">
          <Tooltip delayDuration={0}>
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
          
          <Tooltip delayDuration={0}>
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
          
          <Tooltip delayDuration={0}>
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
          
          <Tooltip delayDuration={0}>
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
            <TooltipContent side="right">Profile</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link to="/settings">
                <Button
                  variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn(
                    'h-9 w-9',
                    location.pathname === '/settings' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          
          <div className="my-2 w-8 h-px bg-border" />
          
          {/* Collapsed module list */}
          <ScrollArea className="flex-1 w-full">
            <div className="flex flex-col items-center gap-1 px-2">
              {modules.map((module, index) => (
                <Tooltip key={module.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isModuleActive(module.id) ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => handleModuleClick(module.id)}
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
                  <TooltipContent side="right" className="max-w-[200px]">{module.title}</TooltipContent>
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

            {/* Profile */}
            <Link to="/profile">
              <Button
                variant={location.pathname === '/profile' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 h-9 text-sm',
                  location.pathname === '/profile' && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span>Profile</span>
              </Button>
            </Link>

            {/* Settings */}
            <Link to="/settings">
              <Button
                variant={location.pathname === '/settings' ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2 h-9 text-sm',
                  location.pathname === '/settings' && 'bg-primary/10 text-primary border border-primary/20'
                )}
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Settings</span>
              </Button>
            </Link>

            {/* Divider */}
            <div className="my-3 h-px bg-border" />

            {/* Edit Onboarding link */}
            <Link to="/intake?edit=true">
              <Button variant="ghost" className="w-full justify-start gap-2 h-9 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Edit Onboarding</span>
              </Button>
            </Link>

            {intake && (
              <div className="mx-2 mt-1 p-2 rounded-lg bg-secondary/50 text-xs">
                <p className="font-medium mb-0.5">Your Idea:</p>
                <p className="text-muted-foreground line-clamp-2">{intake.idea}</p>
              </div>
            )}

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
                  const shortName = getShortName(module.title);

                  return (
                    <Tooltip key={module.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleModuleClick(module.id)}
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
          </div>
        </ScrollArea>
      )}

      {/* Logout */}
      <div className="p-2 border-t border-border flex-shrink-0">
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
