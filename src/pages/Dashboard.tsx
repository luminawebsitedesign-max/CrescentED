import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2, Sparkles, Settings, FileText, Wrench, User,
  ChevronLeft, ChevronRight, CheckCircle, LayoutDashboard
} from 'lucide-react';
import { type Module, type ModuleDomain, DOMAIN_LABELS, DOMAIN_ICONS } from '@/types/crescented';
import DashboardAIChat from '@/components/Dashboard/DashboardAIChat';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CrescentLogo from '@/components/ui/crescent-logo';

// Moon phases for visual progress
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

const getMoonPhase = (index: number, total: number, isComplete: boolean): string => {
  if (isComplete) return '🌕';
  if (total <= 1) return MOON_PHASES[0];
  const phaseIndex = Math.floor((index / (total - 1)) * (MOON_PHASES.length - 1));
  return MOON_PHASES[Math.min(phaseIndex, MOON_PHASES.length - 1)];
};

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
  
  // Fallback: use first 2-3 words max 16 chars
  const words = title.split(' ').slice(0, 2);
  const shortened = words.join(' ');
  return shortened.length > 16 ? shortened.substring(0, 16) + '…' : shortened;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, modules, setModules, intake, setIntake, currentModuleId, setCurrentModuleId, setUser } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentModule = modules.find(m => m.id === currentModuleId);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Fetch intake form
      const { data: intakeData } = await supabase
        .from('intake_forms')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!intakeData) {
        navigate('/intake');
        return;
      }
      setIntake(intakeData as any);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as unknown as Module[]);
        // Set first module as current if none selected or if stored ID is stale
        const stored = useStore.getState().currentModuleId;
        const storedExists = stored && modulesData.some(m => m.id === stored);
        if (!storedExists) {
          setCurrentModuleId(modulesData[0].id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate, setIntake, setModules, setCurrentModuleId, setUser]);

  const generateCourse = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !intake) {
      toast({
        title: 'Error',
        description: 'Please complete your profile first',
        variant: 'destructive',
      });
      return;
    }
    
    setGenerating(true);

    try {
      await supabase.from('modules').delete().eq('user_id', session.user.id);

      toast({
        title: 'Generating your course...',
        description: 'This may take a minute. Please wait.',
      });

      const response = await supabase.functions.invoke('crescented-ai', {
        body: {
          type: 'generate_course',
          intake,
          userId: session.user.id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate course');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // Refresh modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as unknown as Module[]);
        setCurrentModuleId(modulesData[0].id);
      }

      toast({
        title: 'Course generated!',
        description: `Created ${response.data?.modulesCount || modulesData?.length || 0} personalized modules.`,
      });
    } catch (error: any) {
      console.error('Course generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Calculate module progress
  const isModuleComplete = (module: Module): boolean => {
    const sections = module.content?.sections || [];
    const completed = module.progress?.sectionsCompleted?.length || 0;
    return sections.length > 0 && completed >= sections.length;
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // No modules - show blank state with clear retry
  if (modules.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <CosmicCard className="p-10 text-center max-w-lg" variant="gradient" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-sora font-bold mb-2">
            {generating ? 'Generating Your Course...' : 'Ready to Generate Your Course'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {generating
              ? 'This usually takes about 30 seconds. Please don\'t close this page.'
              : 'We\'ll create 5 personalized modules based on your profile. This takes about 30 seconds.'}
          </p>
          <GradientButton
            size="lg"
            onClick={generateCourse}
            disabled={generating}
            glow
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                Generate My Course
              </>
            )}
          </GradientButton>
          {!generating && (
            <p className="text-xs text-muted-foreground mt-4">
              Need to update your profile first?{' '}
              <Link to="/intake?edit=true" className="text-primary hover:underline">Edit profile</Link>
            </p>
          )}
        </CosmicCard>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Wrench, label: 'Tools', path: '/tools' },
    { icon: FileText, label: 'My PDFs', path: '/pdfs' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Sidebar - Module Navigation */}
      <aside 
        className={cn(
          "h-full border-r border-border bg-sidebar flex flex-col transition-all duration-300 flex-shrink-0",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <CrescentLogo size="sm" />
            {!sidebarCollapsed && (
              <span className="font-sora font-bold text-sm text-gradient-cosmic">CrescentEd</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="p-2 border-b border-sidebar-border space-y-1 flex-shrink-0">
          {navItems.map((item) => (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-9",
                    sidebarCollapsed && "justify-center px-2",
                    item.active && "bg-primary/10 text-primary border border-primary/20"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Modules Header */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Modules
            </span>
            <span className="text-xs text-muted-foreground">
              {modules.filter(m => isModuleComplete(m)).length}/{modules.length}
            </span>
          </div>
        )}

        {/* Modules List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="space-y-1">
              {modules.map((module, idx) => {
                const isActive = module.id === currentModuleId;
                const isComplete = isModuleComplete(module);
                const moonPhase = getMoonPhase(idx, modules.length, isComplete);
                const shortName = getShortName(module.title);

                return (
                  <Tooltip key={module.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentModuleId(module.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all text-sm",
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/30" 
                            : "hover:bg-secondary text-foreground",
                          isComplete && !isActive && "text-muted-foreground"
                        )}
                      >
                        <span className="text-base flex-shrink-0">{moonPhase}</span>
                        {!sidebarCollapsed && (
                          <span className="truncate flex-1 font-medium">{shortName}</span>
                        )}
                        {!sidebarCollapsed && isComplete && (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      <p className="font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {DOMAIN_LABELS[module.domain as ModuleDomain] || module.domain}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content - AI Tutor Chat Interface */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header with current module */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {currentModule && (
              <>
                <span className="text-xl flex-shrink-0">
                  {DOMAIN_ICONS[currentModule.domain as keyof typeof DOMAIN_ICONS] || '📚'}
                </span>
                <div className="min-w-0">
                  <h1 className="font-sora font-semibold text-lg leading-tight truncate">
                    {currentModule.title}
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {DOMAIN_LABELS[currentModule.domain as keyof typeof DOMAIN_LABELS] || currentModule.domain}
                  </p>
                </div>
              </>
            )}
          </div>
        </header>

        {/* AI Tutor Chat - Main Interface */}
        <div className="flex-1 overflow-hidden">
          <DashboardAIChat />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
