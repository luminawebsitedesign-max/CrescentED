import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, BookOpen, MessageCircle, FileText, LogOut, 
  Play, CheckCircle, Sparkles, RefreshCw 
} from 'lucide-react';
import { DOMAIN_LABELS, DOMAIN_ICONS, type Module, type IntakeForm, type ModuleProgress } from '@/types/crescented';
import TutorSidebar from '@/components/Tutor/TutorSidebar';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [intake, setIntake] = useState<IntakeForm | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
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

      if (modulesData) {
        setModules(modulesData as unknown as Module[]);
      }

      setLoading(false);
    };

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const generateCourse = async () => {
    if (!user || !intake) return;
    setGenerating(true);

    try {
      const response = await supabase.functions.invoke('crescented-ai', {
        body: {
          type: 'generate_course',
          intake,
          userId: user.id,
        },
      });

      if (response.error) throw response.error;

      // Refresh modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (modulesData) {
        setModules(modulesData as unknown as Module[]);
      }

      toast({
        title: 'Course generated!',
        description: 'Your personalized learning path is ready.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate course',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise-texture">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border glass-cosmic">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTutorOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Tutor
            </Button>
            <Link to="/pdfs">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <FileText className="w-4 h-4 mr-2" />
                My PDFs
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground">
            {modules.length > 0
              ? 'Continue your entrepreneurial journey'
              : 'Ready to start your learning path?'}
          </p>
        </div>

        {/* Progress Overview */}
        {modules.length > 0 && (
          <div className="glass-cosmic rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit font-semibold">Overall Progress</h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(calculateOverallProgress())}% Complete
              </span>
            </div>
            <Progress value={calculateOverallProgress()} className="h-3 bg-secondary">
              <div className="h-full progress-cosmic rounded-full transition-all" style={{ width: `${calculateOverallProgress()}%` }} />
            </Progress>
          </div>
        )}

        {/* Generate Course Button */}
        {modules.length === 0 && (
          <div className="glass-cosmic rounded-2xl p-10 text-center mb-8">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-sora text-2xl font-bold mb-2">Generate Your Course</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Based on your profile, our AI will create a personalized learning path
              covering all 7 domains of entrepreneurship.
            </p>
            <Button
              size="lg"
              onClick={generateCourse}
              disabled={generating}
              className="bg-primary hover:bg-primary/90 glow-primary"
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
            </Button>
          </div>
        )}

        {/* Modules Grid */}
        {modules.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-sora text-xl font-bold">Your Modules</h2>
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
              {modules.map((module) => {
                const progress = calculateModuleProgress(module);
                const isComplete = progress === 100;
                const domainKey = module.domain as keyof typeof DOMAIN_LABELS;
                
                return (
                  <Link key={module.id} to={`/module/${module.id}`}>
                    <div className="glass-cosmic rounded-xl p-6 hover-lift group cursor-pointer h-full">
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
                        <Progress value={progress} className="h-2 bg-secondary" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Tutor Sidebar */}
      <TutorSidebar open={tutorOpen} onClose={() => setTutorOpen(false)} />
    </div>
  );
};

export default Dashboard;
