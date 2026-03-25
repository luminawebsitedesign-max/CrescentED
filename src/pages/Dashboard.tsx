import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Loader2, Sparkles, ArrowRight, CheckCircle, 
  Wrench, FileText, BookOpen, TrendingUp
} from 'lucide-react';
import { type Module, type ModuleProgress, DOMAIN_ICONS, DOMAIN_LABELS } from '@/types/crescented';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user, modules, setModules, intake, setIntake, setCurrentModuleId, setUser } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

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

      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (modulesData && modulesData.length > 0) {
        setModules(modulesData as unknown as Module[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate, setIntake, setModules, setCurrentModuleId, setUser]);

  const generateCourse = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !intake) {
      toast({ title: 'Error', description: 'Please complete your onboarding first', variant: 'destructive' });
      return;
    }
    
    setGenerating(true);

    try {
      await supabase.from('modules').delete().eq('user_id', session.user.id);

      toast({ title: 'Generating your course...', description: 'This may take a minute. Please wait.' });

      const response = await supabase.functions.invoke('crescented-ai', {
        body: { type: 'generate_course', intake, userId: session.user.id },
      });

      if (response.error) throw new Error(response.error.message || 'Failed to generate course');
      if (response.data?.error) throw new Error(response.data.error);

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
      toast({ title: 'Generation failed', description: error.message || 'Failed to generate course. Please try again.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const getModuleProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const isModuleComplete = (module: Module) => getModuleProgress(module) === 100;

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

  // No modules — generation state
  if (modules.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <CosmicCard className="p-10 text-center max-w-lg" variant="gradient" hover={false}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-sora font-bold mb-2">
              {generating ? 'Generating Your Course...' : 'Ready to Generate Your Course'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {generating
                ? "This usually takes about 30 seconds. Please don't close this page."
                : "We'll create 5 personalized modules based on your onboarding answers. This takes about 30 seconds."}
            </p>
            <GradientButton size="lg" onClick={generateCourse} disabled={generating} glow>
              {generating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="mr-2 w-4 h-4" />Generate My Course</>
              )}
            </GradientButton>
            {!generating && (
              <p className="text-xs text-muted-foreground mt-4">
                Need to change your business idea or goals?{' '}
                <Link to="/intake?edit=true" className="text-primary hover:underline">Edit onboarding answers</Link>
              </p>
            )}
          </CosmicCard>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate overview stats
  const completedCount = modules.filter(m => isModuleComplete(m)).length;
  const totalSections = modules.reduce((sum, m) => sum + (m.content?.sections?.length || 0), 0);
  const completedSections = modules.reduce((sum, m) => {
    const p = m.progress as ModuleProgress;
    return sum + (p.sectionsCompleted?.length || 0);
  }, 0);
  const overallProgress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  // Find next recommended module (first incomplete)
  const nextModule = modules.find(m => !isModuleComplete(m)) || modules[0];

  const handleResumeModule = (module: Module) => {
    setCurrentModuleId(module.id);
    navigate(`/module/${module.id}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-sora font-bold mb-1">Welcome back 👋</h1>
          <p className="text-muted-foreground text-sm">
            {intake?.idea ? `Building: ${intake.idea}` : 'Your personalized learning hub'}
          </p>
        </div>

        {/* Progress Overview */}
        <CosmicCard className="p-5" variant="gradient" hover={false}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Course Progress</span>
            </div>
            <span className="text-sm font-medium text-primary tabular-nums">{overallProgress}%</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-3">
            <div
              className="h-full progress-cosmic rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{completedCount} of {modules.length} modules complete</span>
            <span className="text-border">•</span>
            <span>{completedSections} of {totalSections} sections done</span>
          </div>
        </CosmicCard>

        {/* Resume Learning CTA */}
        {nextModule && !isModuleComplete(nextModule) && (
          <CosmicCard className="p-5" hover={false}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                  {DOMAIN_ICONS[nextModule.domain as keyof typeof DOMAIN_ICONS] || '📚'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Continue where you left off</p>
                  <p className="font-medium text-sm truncate">{nextModule.title}</p>
                </div>
              </div>
              <GradientButton
                size="sm"
                onClick={() => handleResumeModule(nextModule)}
                className="flex-shrink-0 gap-1.5"
              >
                Resume
                <ArrowRight className="w-3.5 h-3.5" />
              </GradientButton>
            </div>
          </CosmicCard>
        )}

        {/* Module List */}
        <div>
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3 px-1">
            Your Modules
          </h2>
          <div className="space-y-2">
            {modules.map((module) => {
              const progress = getModuleProgress(module);
              const complete = isModuleComplete(module);
              const domainKey = module.domain as keyof typeof DOMAIN_ICONS;

              return (
                <button
                  key={module.id}
                  onClick={() => handleResumeModule(module)}
                  className={cn(
                    'w-full text-left rounded-xl border border-border bg-card/50 p-4 transition-all hover:bg-card hover:shadow-sm group',
                    complete && 'opacity-75'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-base flex-shrink-0">
                      {DOMAIN_ICONS[domainKey] || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{module.title}</span>
                        {complete && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[160px]">
                          <div
                            className="h-full progress-cosmic rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums flex-shrink-0">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/tools">
            <CosmicCard className="p-4 h-full hover:border-primary/30 transition-colors cursor-pointer" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tools</p>
                  <p className="text-xs text-muted-foreground">Generators & utilities</p>
                </div>
              </div>
            </CosmicCard>
          </Link>
          <Link to="/pdfs">
            <CosmicCard className="p-4 h-full hover:border-primary/30 transition-colors cursor-pointer" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">My PDFs</p>
                  <p className="text-xs text-muted-foreground">Downloads & exports</p>
                </div>
              </div>
            </CosmicCard>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
