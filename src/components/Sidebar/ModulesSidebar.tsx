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
  CheckCircle,
  LayoutDashboard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type Module, type ModuleProgress } from '@/types/crescented';

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

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
  
  // For unmatched titles: take first 2 meaningful words, cap at 20 chars
  const words = title.split(/[\s:–—-]+/).filter(w => w.length > 0).slice(0, 2);
  const shortened = words.join(' ');
  return shortened.length > 20 ? shortened.substring(0, 19) + '…' : shortened;
};

const getMoonPhase = (index: number, total: number, isComplete: boolean): string => {
  if (isComplete) return '🌕';
  const phase = Math.floor((index / Math.max(total - 1, 1)) * 4);
  return MOON_PHASES[Math.min(phase, 4)];
};

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tools', label: 'Tools', icon: Wrench },
  { to: '/pdfs', label: 'My PDFs', icon: FileText },
  { to: '/settings', label: 'Account', icon: Settings },
];

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

  const isOnModulePage = location.pathname === '/dashboard' || location.pathname.startsWith('/module/');
  const isModuleActive = (moduleId: string) => {
    if (!isOnModulePage) return false;
    return currentModuleId === moduleId || location.pathname === `/module/${moduleId}`;
  };

  const isNavActive = (to: string) => {
    if (to === '/settings') return location.pathname === '/settings' || location.pathname === '/profile';
    return location.pathname === to;
  };

  const isModuleComplete = (module: Module) => calculateModuleProgress(module) === 100;

  const handleModuleClick = (moduleId: string) => {
    setCurrentModuleId(moduleId);
    navigate(`/module/${moduleId}`);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 glass-cosmic border-r border-border transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-16' : 'w-[260px]'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2">
          <CrescentLogo size="sm" />
          {!sidebarCollapsed && (
            <span className="font-sora text-base font-bold text-gradient-cosmic">
              CrescentEd
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-muted-foreground hover:text-foreground h-8 w-8 flex-shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {sidebarCollapsed ? (
        /* Collapsed View */
        <div className="flex-1 flex flex-col items-center py-3 gap-1 overflow-hidden">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link to={item.to}>
                  <Button
                    variant={isNavActive(item.to) ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9',
                      isNavActive(item.to) && 'bg-primary/10 text-primary border border-primary/20'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
          
          <div className="my-2 w-8 h-px bg-border" />
          
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
            {/* Nav Items */}
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={isNavActive(item.to) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-9 text-sm',
                    isNavActive(item.to) && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* Divider + Idea */}
            <div className="mt-3 mb-2">
              <div className="h-px bg-border" />
              {intake?.idea && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="px-2 pt-2 pb-0.5 cursor-default flex items-center gap-1.5">
                      <span className="text-xs">💡</span>
                      <span className="text-[11px] text-muted-foreground/70 font-medium">Your Idea</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[260px]">
                    <p className="text-xs leading-relaxed">{intake.idea}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Modules Section Header */}
            <div className="px-2 pb-1 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground/70 tracking-wider">
                Modules
              </span>
              {modules.length > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground/60 tabular-nums">
                  {modules.filter(m => isModuleComplete(m)).length} of {modules.length}
                </span>
              )}
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
                            'w-full text-left px-2 py-1.5 rounded-lg transition-all group flex items-center gap-2 min-w-0',
                            isActive 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'hover:bg-secondary/50'
                          )}
                        >
                          <span className="text-sm flex-shrink-0 w-5 text-center">
                            {getMoonPhase(index, modules.length, isComplete)}
                          </span>
                          <span className={cn(
                            'text-sm font-medium truncate min-w-0 flex-1',
                            isActive && 'text-primary',
                            isComplete && 'text-muted-foreground'
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
