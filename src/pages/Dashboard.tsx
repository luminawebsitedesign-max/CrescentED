import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionDivider } from '@/components/ui/section-divider';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Sparkles, Play, CheckCircle, RefreshCw,
  BookOpen, Wrench, FileText, TrendingUp, Target, Lightbulb
} from 'lucide-react';
import { DOMAIN_LABELS, DOMAIN_ICONS, type Module, type IntakeForm, type ModuleProgress } from '@/types/crescented';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user, modules, setModules, intake, setIntake, setTutorOpen } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Set user in store
      useStore.getState().setUser(session.user);

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

      if (modulesData) {
        setModules(modulesData as unknown as Module[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate, setIntake, setModules]);

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
      // Delete existing modules first
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

      if (modulesData) {
        setModules(modulesData as unknown as Module[]);
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

  const calculateModuleProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const calculateOverallProgress = (): number => {
    if (modules.length === 0) return 0;
    const total = modules.reduce((acc, m) => acc + calculateModuleProgress(m), 0);
    return total / modules.length;
  };

  const getNextModule = (): Module | undefined => {
    return modules.find(m => calculateModuleProgress(m) < 100);
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-h1 mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            {modules.length > 0
              ? 'Continue your entrepreneurial journey'
              : 'Ready to start your learning path?'}
          </p>
        </div>

        {/* Quick Stats */}
        {modules.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CosmicCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modules.length}</p>
                  <p className="text-caption">Modules</p>
                </div>
              </div>
            </CosmicCard>
            <CosmicCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(calculateOverallProgress())}%</p>
                  <p className="text-caption">Progress</p>
                </div>
              </div>
            </CosmicCard>
            <CosmicCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cosmic-violet/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-cosmic-violet" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {modules.filter(m => calculateModuleProgress(m) === 100).length}
                  </p>
                  <p className="text-caption">Completed</p>
                </div>
              </div>
            </CosmicCard>
            <CosmicCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cosmic-sapphire/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-cosmic-sapphire" />
                </div>
                <div>
                  <p className="text-2xl font-bold truncate text-sm">{intake?.idea?.slice(0, 15)}...</p>
                  <p className="text-caption">Your Idea</p>
                </div>
              </div>
            </CosmicCard>
          </div>
        )}

        {/* Progress Overview */}
        {modules.length > 0 && (
          <CosmicCard className="p-6 mb-8" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-semibold">Overall Progress</h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(calculateOverallProgress())}% Complete
              </span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 progress-cosmic rounded-full transition-all duration-500"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          </CosmicCard>
        )}

        {/* Continue Learning Card */}
        {modules.length > 0 && getNextModule() && (
          <CosmicCard className="p-6 mb-8" variant="glow" hover={false}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-primary mb-1">Continue Learning</p>
                <h3 className="font-outfit font-semibold text-xl mb-2">
                  {getNextModule()?.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {getNextModule()?.description || getNextModule()?.summary}
                </p>
              </div>
              <Link to={`/module/${getNextModule()?.id}`}>
                <GradientButton size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Continue
                </GradientButton>
              </Link>
            </div>
          </CosmicCard>
        )}

        {/* Generate Course Button */}
        {modules.length === 0 && (
          <CosmicCard className="p-10 text-center mb-8" variant="gradient" hover={false}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h2 mb-2">Generate Your Course</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Based on your profile, our AI will create a personalized learning path
              covering all 7 domains of entrepreneurship.
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
        )}

        {/* Quick Actions */}
        {modules.length > 0 && (
          <>
            <SectionDivider label="Quick Actions" />
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Link to="/tools">
                <CosmicCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-medium">Business Tools</h3>
                    <p className="text-caption">Templates & generators</p>
                  </div>
                </CosmicCard>
              </Link>
              <CosmicCard
                className="p-5 flex items-center gap-4"
                onClick={() => setTutorOpen(true)}
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-outfit font-medium">Ask AI Tutor</h3>
                  <p className="text-caption">Get personalized help</p>
                </div>
              </CosmicCard>
              <Link to="/pdfs">
                <CosmicCard className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-cosmic-violet/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-cosmic-violet" />
                  </div>
                  <div>
                    <h3 className="font-outfit font-medium">My Downloads</h3>
                    <p className="text-caption">Worksheets & PDFs</p>
                  </div>
                </CosmicCard>
              </Link>
            </div>
          </>
        )}

        {/* Modules Grid */}
        {modules.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2">Your Modules</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={generateCourse}
                disabled={generating}
                className="border-border"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => {
                const progress = calculateModuleProgress(module);
                const isComplete = progress === 100;
                const domainKey = module.domain as keyof typeof DOMAIN_LABELS;

                return (
                  <Link key={module.id} to={`/module/${module.id}`}>
                    <CosmicCard className="p-6 h-full animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">
                          {DOMAIN_ICONS[domainKey] || '📚'}
                        </span>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Play className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <h3 className="font-outfit font-semibold text-lg mb-1">{module.title}</h3>
                      <p className="text-sm text-primary mb-3">
                        {DOMAIN_LABELS[domainKey] || module.domain}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {module.description || module.summary}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 progress-cosmic rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CosmicCard>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
