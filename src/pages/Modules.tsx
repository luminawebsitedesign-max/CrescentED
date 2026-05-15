import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { SectionDivider } from '@/components/ui/section-divider';
import { GradientButton } from '@/components/ui/gradient-button';
import { useStore } from '@/store/useStore';
import { DOMAIN_LABELS, DOMAIN_ICONS, type Module, type ModuleProgress } from '@/types/crescented';
import { Play, CheckCircle, BookOpen, TrendingUp, Target, ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';

const Modules = () => {
  const [loading, setLoading] = useState(true);
  const { modules, setModules } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { 
        navigate('/auth'); 
        return; 
      }

      const { data } = await supabase
        .from('modules')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (data) setModules(data as unknown as Module[]);
      setLoading(false);
    };
    fetchModules();
  }, [navigate, setModules]);

  const calculateProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const calculateOverallProgress = (): number => {
    if (modules.length === 0) return 0;
    const total = modules.reduce((acc, m) => acc + calculateProgress(m), 0);
    return total / modules.length;
  };

  const getCompletedCount = (): number => {
    return modules.filter(m => calculateProgress(m) === 100).length;
  };

  const getNextModule = (): Module | undefined => {
    return modules.find(m => calculateProgress(m) < 100);
  };

  // Group modules by domain
  const groupedModules = modules.reduce((acc, module) => {
    const domain = module.domain;
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <DashboardLayout loading={loading}>
      <SEO
        title="My Course — CrescentEd"
        description="Browse your personalized entrepreneurship modules, track progress, and continue learning at your own pace."
        path="/modules"
      />
      <div className="max-w-6xl mx-auto animate-fade-in pb-8">
        <div className="mb-8">
          <h1 className="text-h1 mb-2">My Course</h1>
          <p className="text-muted-foreground">
            Your personalized learning path across the core domains of entrepreneurship
          </p>
        </div>

        {modules.length === 0 ? (
          <CosmicCard className="p-10 text-center" hover={false}>
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-outfit font-semibold text-xl mb-2">No Modules Yet</h2>
            <p className="text-muted-foreground mb-6">
              Generate your personalized course to start learning
            </p>
            <Link to="/dashboard">
              <GradientButton>Go to Dashboard</GradientButton>
            </Link>
          </CosmicCard>
        ) : (
          <>
            {/* Progress Overview */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <CosmicCard className="p-5" hover={false}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{modules.length}</p>
                    <p className="text-caption">Total Modules</p>
                  </div>
                </div>
              </CosmicCard>
              <CosmicCard className="p-5" hover={false}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{getCompletedCount()}</p>
                    <p className="text-caption">Completed</p>
                  </div>
                </div>
              </CosmicCard>
              <CosmicCard className="p-5" hover={false}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{Math.round(calculateOverallProgress())}%</p>
                    <p className="text-caption">Progress</p>
                  </div>
                </div>
              </CosmicCard>
            </div>

            {/* Continue Learning */}
            {getNextModule() && (
              <CosmicCard className="p-6 mb-8" variant="glow" hover={false}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-2xl">
                    {DOMAIN_ICONS[getNextModule()!.domain as keyof typeof DOMAIN_ICONS] || '📚'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-primary mb-1">Continue Learning</p>
                    <h3 className="font-outfit font-semibold text-xl mb-1">
                      {getNextModule()?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-1">
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

            {/* Modules by Domain */}
            {Object.entries(groupedModules).map(([domain, domainModules]) => (
              <div key={domain} className="mb-8">
                <SectionDivider 
                  label={`${DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS] || '📚'} ${DOMAIN_LABELS[domain as keyof typeof DOMAIN_LABELS] || domain}`} 
                />
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {domainModules.map((module, index) => {
                    const progress = calculateProgress(module);
                    const isComplete = progress === 100;
                    
                    return (
                      <Link key={module.id} to={`/module/${module.id}`}>
                        <CosmicCard 
                          className="p-5 h-full group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isComplete ? 'bg-green-500/20' : 'bg-primary/10'
                            }`}>
                              {isComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Play className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          
                          <h3 className="font-outfit font-semibold mb-1 group-hover:text-primary transition-colors">
                            {module.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {module.description || module.summary}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{module.content?.sections?.length || 0} sections</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                                  isComplete ? 'bg-green-500' : 'progress-cosmic'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </CosmicCard>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Modules;
