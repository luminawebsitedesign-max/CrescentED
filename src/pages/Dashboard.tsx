import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import AITutorMain from '@/components/Dashboard/AITutorMain';
import ModuleContent from '@/components/Dashboard/ModuleContent';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Sparkles, RefreshCw, BookOpen, MessageCircle
} from 'lucide-react';
import { type Module, type IntakeForm } from '@/types/crescented';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'tutor' | 'content'>('tutor');
  const { user, modules, setModules, intake, setIntake, setCurrentModuleId } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        {/* Header with tabs and regenerate */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'tutor' | 'content')}>
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="tutor" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                AI Tutor
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Module Content
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={generateCourse}
            disabled={generating}
            className="border-border"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Regenerate Course
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'tutor' ? (
            <AITutorMain />
          ) : (
            <ModuleContent />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
