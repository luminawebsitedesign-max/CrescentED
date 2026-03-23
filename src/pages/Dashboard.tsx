import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/store/useStore';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { type Module, type ModuleDomain, DOMAIN_LABELS, DOMAIN_ICONS } from '@/types/crescented';
import DashboardAIChat from '@/components/Dashboard/DashboardAIChat';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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
        description: 'Please complete your onboarding first',
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

  // No modules - show generation state
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
                Need to change your business idea or goals?{' '}
                <Link to="/intake?edit=true" className="text-primary hover:underline">Edit onboarding answers</Link>
              </p>
            )}
          </CosmicCard>
        </div>
      </DashboardLayout>
    );
  }

  // Main dashboard with modules
  return (
    <DashboardLayout>
      {/* Header with current module */}
      <div className="flex flex-col h-full -m-4 lg:-m-6">
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

        {/* AI Tutor Chat */}
        <div className="flex-1 overflow-hidden">
          <DashboardAIChat />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
