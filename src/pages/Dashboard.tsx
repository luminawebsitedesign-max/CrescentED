import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AITutorMain from '@/components/Dashboard/AITutorMain';
import ModuleContent from '@/components/Dashboard/ModuleContent';
import { useStore } from '@/store/useStore';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Sparkles, ChevronRight, Home, ChevronDown, ChevronUp
} from 'lucide-react';
import { type Module, type IntakeForm, DOMAIN_LABELS } from '@/types/crescented';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tutorCollapsed, setTutorCollapsed] = useState(false);
  const { user, modules, setModules, intake, setIntake, currentModuleId, setCurrentModuleId } = useStore();
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
  }, [navigate, setIntake, setModules, setCurrentModuleId]);

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

  // Calculate overall progress
  const completedModules = modules.filter(m => {
    const sections = m.content?.sections || [];
    const completed = m.progress?.sectionsCompleted?.length || 0;
    return sections.length > 0 && completed >= sections.length;
  }).length;
  const progressPercent = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  // No modules - show generation screen
  if (!loading && modules.length === 0) {
    return (
      <DashboardLayout loading={loading}>
        <div className="h-full flex items-center justify-center">
          <CosmicCard className="p-10 text-center max-w-lg" variant="gradient" hover={false}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h2 mb-2">Generate Your Course</h2>
            <p className="text-muted-foreground mb-6">
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
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout loading={loading}>
      <div className="h-full flex flex-col animate-fade-in">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dashboard</span>
            {currentModule && (
              <>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {currentModule.title}
                </span>
              </>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Course Progress</p>
              <p className="text-sm font-medium">{progressPercent}% Complete</p>
            </div>
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full progress-cosmic rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content - Module takes full width, AI Tutor docked at bottom */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Module Content - Full Width Primary View */}
          <div className="flex-1 overflow-hidden">
            <ModuleContent />
          </div>
          
          {/* AI Tutor - Docked Bottom Panel */}
          <div className="flex-shrink-0 mt-4">
            <Collapsible open={!tutorCollapsed} onOpenChange={(open) => setTutorCollapsed(!open)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-3 bg-secondary/30 rounded-t-lg border border-border hover:bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">AI Tutor</span>
                    <span className="text-xs text-muted-foreground">
                      — Ask questions about your current module
                    </span>
                  </div>
                  {tutorCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="h-[280px] border border-t-0 border-border rounded-b-lg overflow-hidden bg-background/50">
                  <AITutorMain />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
