import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, ArrowLeft, MessageCircle, FileDown, 
  ChevronDown, ChevronUp, CheckCircle 
} from 'lucide-react';
import { DOMAIN_LABELS, DOMAIN_ICONS, type Module, type ModuleSection, type PlugAndPlay, type ModuleProgress } from '@/types/crescented';
import TutorSidebar from '@/components/Tutor/TutorSidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ModuleView = () => {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState<{ module_id?: string; section_title?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchModule = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        toast({
          title: 'Module not found',
          description: 'This module does not exist or you don\'t have access.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setModule(data as unknown as Module);
      setTutorContext({ module_id: data.id });
      setLoading(false);
    };

    fetchModule();
  }, [id, navigate, toast]);

  const toggleSectionComplete = async (sectionTitle: string) => {
    if (!module) return;

    const progress = module.progress as ModuleProgress;
    const newProgress = { ...progress };
    
    if (newProgress.sectionsCompleted.includes(sectionTitle)) {
      newProgress.sectionsCompleted = newProgress.sectionsCompleted.filter(s => s !== sectionTitle);
    } else {
      newProgress.sectionsCompleted = [...newProgress.sectionsCompleted, sectionTitle];
    }

    const { error } = await supabase
      .from('modules')
      .update({ progress: newProgress })
      .eq('id', module.id);

    if (!error) {
      setModule({ ...module, progress: newProgress });
    }
  };

  const togglePlugAndPlayComplete = async (plugTitle: string) => {
    if (!module) return;

    const progress = module.progress as ModuleProgress;
    const newProgress = { ...progress };
    
    if (newProgress.plugAndPlayCompleted.includes(plugTitle)) {
      newProgress.plugAndPlayCompleted = newProgress.plugAndPlayCompleted.filter(p => p !== plugTitle);
    } else {
      newProgress.plugAndPlayCompleted = [...newProgress.plugAndPlayCompleted, plugTitle];
    }

    const { error } = await supabase
      .from('modules')
      .update({ progress: newProgress })
      .eq('id', module.id);

    if (!error) {
      setModule({ ...module, progress: newProgress });
    }
  };

  const downloadPDF = async (plugAndPlay: PlugAndPlay) => {
    toast({
      title: 'Generating PDF...',
      description: 'Your download will start shortly.',
    });

    try {
      const response = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: plugAndPlay.type,
          title: plugAndPlay.title,
          content: plugAndPlay.content,
          moduleTitle: module?.title,
        },
      });

      if (response.error) throw response.error;

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plugAndPlay.title.replace(/\s+/g, '-')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded!',
        description: 'Your PDF has been downloaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Download failed',
        description: error.message || 'Could not generate PDF',
        variant: 'destructive',
      });
    }
  };

  const askTutorAboutSection = (sectionTitle: string) => {
    setTutorContext({ module_id: module?.id, section_title: sectionTitle });
    setTutorOpen(true);
  };

  const calculateProgress = (): number => {
    if (!module) return 0;
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  if (loading || !module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = module.content?.sections || [];
  const actionSteps = module.content?.action_steps || [];
  const progress = module.progress as ModuleProgress;
  const domainKey = module.domain as keyof typeof DOMAIN_LABELS;

  return (
    <div className="min-h-screen bg-background noise-texture">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border glass-cosmic sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTutorOpen(true)}
            className="border-border"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Tutor
          </Button>
        </div>
      </header>

      {/* Module Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* Module Header */}
        <div className="glass-cosmic rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{DOMAIN_ICONS[domainKey] || '📚'}</span>
            <div className="flex-1">
              <p className="text-sm text-primary mb-1">{DOMAIN_LABELS[domainKey] || module.domain}</p>
              <h1 className="font-sora text-3xl font-bold mb-2">{module.title}</h1>
              <p className="text-muted-foreground">{module.description || module.summary}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(calculateProgress())}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-3 bg-secondary" />
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <Accordion type="multiple" className="space-y-4">
            {sections.map((section: ModuleSection, index: number) => {
              const isComplete = progress.sectionsCompleted.includes(section.title);
              
              return (
                <AccordionItem
                  key={index}
                  value={`section-${index}`}
                  className="glass-cosmic rounded-xl border-0 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <Checkbox
                        checked={isComplete}
                        onCheckedChange={() => toggleSectionComplete(section.title)}
                        onClick={(e) => e.stopPropagation()}
                        className="border-primary data-[state=checked]:bg-primary"
                      />
                      <div>
                        <h3 className={`font-outfit font-semibold ${isComplete ? 'text-muted-foreground line-through' : ''}`}>
                          {section.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {section.plug_and_plays?.length || 0} resources
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {/* Section Content */}
                    <div className="prose prose-invert max-w-none mb-6">
                      <div className="text-foreground whitespace-pre-wrap">
                        {section.content}
                      </div>
                    </div>

                    {/* Ask Tutor */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => askTutorAboutSection(section.title)}
                      className="mb-6 border-border"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Ask about this section
                    </Button>

                    {/* Plug & Plays */}
                    {section.plug_and_plays && section.plug_and_plays.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-outfit font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          Resources & Templates
                        </h4>
                        {section.plug_and_plays.map((plug: PlugAndPlay, pIndex: number) => {
                          const plugComplete = progress.plugAndPlayCompleted.includes(plug.title);
                          
                          return (
                            <div
                              key={pIndex}
                              className="bg-secondary/50 rounded-lg p-4 border border-border"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={plugComplete}
                                    onCheckedChange={() => togglePlugAndPlayComplete(plug.title)}
                                    className="mt-1 border-primary data-[state=checked]:bg-primary"
                                  />
                                  <div>
                                    <h5 className={`font-medium ${plugComplete ? 'text-muted-foreground line-through' : ''}`}>
                                      {plug.title}
                                    </h5>
                                    <span className="text-xs text-primary capitalize">
                                      {plug.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadPDF(plug)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <FileDown className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="mt-3 pl-7 text-sm text-muted-foreground whitespace-pre-wrap">
                                {plug.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Action Steps */}
        {actionSteps.length > 0 && (
          <div className="glass-cosmic rounded-xl p-6 mt-8">
            <h3 className="font-sora text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Your Next Steps
            </h3>
            <ul className="space-y-3">
              {actionSteps.map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Tutor Sidebar */}
      <TutorSidebar 
        open={tutorOpen} 
        onClose={() => setTutorOpen(false)}
        context={tutorContext}
      />
    </div>
  );
};

export default ModuleView;
