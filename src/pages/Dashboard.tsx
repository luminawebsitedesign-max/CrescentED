import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Sparkles, Settings, FileText, Wrench, User,
  ChevronLeft, ChevronRight, Moon
} from 'lucide-react';
import { type Module, type IntakeForm, DOMAIN_LABELS, DOMAIN_ICONS } from '@/types/crescented';
import DashboardAIChat from '@/components/Dashboard/DashboardAIChat';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Moon phases for visual progress
const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕'];

const getMoonPhase = (index: number, total: number, isComplete: boolean): string => {
  if (isComplete) return '🌕';
  if (total <= 1) return MOON_PHASES[0];
  const phaseIndex = Math.floor((index / (total - 1)) * (MOON_PHASES.length - 1));
  return MOON_PHASES[Math.min(phaseIndex, MOON_PHASES.length - 1)];
};

const getShortName = (title: string, index: number): string => {
  const shortNames: Record<string, string> = {
    'business_foundations': 'Foundation',
    'running_a_business': 'Operations',
    'customer_success': 'Customers',
    'personal_development': 'Growth',
    'daily_life_optimization': 'Daily Ops',
    'philosophy_worldview': 'Philosophy',
    'other_topics': 'Extras',
  };
  
  // Try to create a short version
  if (title.length <= 12) return title;
  const words = title.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ').substring(0, 14);
  }
  return title.substring(0, 12);
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
      setIntake(intakeData as IntakeForm);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as unknown as Module[]);
        // Set first module as current if none selected
        const stored = useStore.getState().currentModuleId;
        if (!stored) {
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

  // No modules - show generation screen
  if (modules.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <CosmicCard className="p-10 text-center max-w-lg" variant="gradient" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-sora font-bold mb-2">No Course Yet</h2>
          <p className="text-muted-foreground mb-6">
            Generate a personalized learning path covering all 7 domains of entrepreneurship based on your profile.
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
                Generating your course...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-4 h-4" />
                Generate My Course
              </>
            )}
          </GradientButton>
        </CosmicCard>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Sidebar - Module Navigation */}
      <aside 
        className={cn(
          "h-full border-r border-border bg-sidebar flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              <span className="font-sora font-semibold text-sm">CrescentEd</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="p-2 border-b border-sidebar-border space-y-1">
          {[
            { icon: FileText, label: 'My PDFs', path: '/pdfs' },
            { icon: Wrench, label: 'Tools', path: '/tools' },
            { icon: Settings, label: 'Settings', path: '/settings' },
            { icon: User, label: 'Profile', path: '/profile' },
          ].map((item) => (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-9",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
                </Button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>

        {/* Modules List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">
                Modules
              </p>
            )}
            <div className="space-y-1">
              {modules.map((module, idx) => {
                const isActive = module.id === currentModuleId;
                const isComplete = isModuleComplete(module);
                const moonPhase = getMoonPhase(idx, modules.length, isComplete);

                return (
                  <Tooltip key={module.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentModuleId(module.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors text-sm",
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/30" 
                            : "hover:bg-secondary text-foreground",
                          isComplete && !isActive && "text-muted-foreground"
                        )}
                      >
                        <span className="text-base flex-shrink-0">{moonPhase}</span>
                        {!sidebarCollapsed && (
                          <span className="truncate">{getShortName(module.title, idx)}</span>
                        )}
                      </button>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right">{module.title}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content - AI Tutor Chat Interface */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with current module */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {currentModule && (
              <>
                <span className="text-xl">
                  {DOMAIN_ICONS[currentModule.domain as keyof typeof DOMAIN_ICONS] || '📚'}
                </span>
                <div>
                  <h1 className="font-sora font-semibold text-lg leading-tight truncate max-w-md">
                    {currentModule.title}
                  </h1>
                  <p className="text-xs text-muted-foreground">
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