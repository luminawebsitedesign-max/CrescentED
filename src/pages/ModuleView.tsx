import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession, getModule, getModules, updateModuleProgress } from '@/lib/api';
import SampleNotice from '@/components/SampleNotice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import TutorSidebar from '@/components/Tutor/TutorSidebar';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionDivider } from '@/components/ui/section-divider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { generatePDF } from '@/lib/pdf';
import { 
  ArrowLeft, ArrowRight, MessageCircle, Download, 
  CheckCircle, ChevronDown, ChevronUp, FileText, Sparkles
} from 'lucide-react';
import { 
  DOMAIN_LABELS, DOMAIN_ICONS, 
  type Module, type ModuleSection, type PlugAndPlay, type ModuleProgress 
} from '@/types/crescented';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SEO from '@/components/SEO';

const ModuleView = () => {
  const { id } = useParams<{ id: string }>();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorContext, setTutorContext] = useState<{ module_id?: string; section_title?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentModuleId } = useStore();

  useEffect(() => {
    const fetchModule = async () => {
      const session = await getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const data = await getModule(id as string, session.user.id);

      if (!data) {
        toast({
          title: 'Module not found',
          description: 'This module does not exist.',
          variant: 'destructive',
        });
        navigate('/modules');
        return;
      }

      setModule(data as unknown as Module);
      setCurrentModuleId(data.id);

      const modulesData = await getModules(session.user.id);
      if (modulesData) {
        setAllModules(modulesData as unknown as Module[]);
      }

      setLoading(false);
    };

    fetchModule();
  }, [id, navigate, toast, setCurrentModuleId]);

  const toggleSectionComplete = async (sectionTitle: string) => {
    if (!module) return;

    const progress = module.progress as ModuleProgress;
    const newProgress = { ...progress };
    
    if (newProgress.sectionsCompleted.includes(sectionTitle)) {
      newProgress.sectionsCompleted = newProgress.sectionsCompleted.filter(s => s !== sectionTitle);
    } else {
      newProgress.sectionsCompleted = [...newProgress.sectionsCompleted, sectionTitle];
    }

    const ok = await updateModuleProgress(module.id, newProgress);

    if (ok) {
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

    const ok = await updateModuleProgress(module.id, newProgress);

    if (ok) {
      setModule({ ...module, progress: newProgress });
    }
  };

  const downloadPlugAndPlay = (plug: PlugAndPlay) => {
    generatePDF({
      title: plug.title,
      subtitle: `From: ${module?.title}`,
      content: plug.content,
      type: plug.type as 'worksheet' | 'template' | 'checklist' | 'summary',
    });
    toast({ title: 'Downloaded!', description: 'PDF saved to your device' });
  };

  const downloadModuleSummary = () => {
    if (!module) return;
    const sections = module.content?.sections || [];
    const actionSteps = module.content?.action_steps || [];
    
    const content = [
      `SUMMARY\n${module.description || module.summary}\n`,
      ...sections.map(s => `${s.title}\n${s.content}`),
      actionSteps.length > 0 ? `\nNEXT STEPS\n${actionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '',
    ].filter(Boolean);
    
    generatePDF({
      title: module.title,
      subtitle: DOMAIN_LABELS[module.domain as keyof typeof DOMAIN_LABELS] || module.domain,
      content,
      type: 'summary',
    });
    toast({ title: 'Downloaded!', description: 'Module summary saved' });
  };

  const calculateProgress = (): number => {
    if (!module) return 0;
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const getCurrentModuleIndex = (): number => {
    return allModules.findIndex(m => m.id === id);
  };

  const getPrevModule = (): Module | null => {
    const index = getCurrentModuleIndex();
    return index > 0 ? allModules[index - 1] : null;
  };

  const getNextModule = (): Module | null => {
    const index = getCurrentModuleIndex();
    return index < allModules.length - 1 ? allModules[index + 1] : null;
  };

  if (loading || !module) {
    return <DashboardLayout loading={true}><div /></DashboardLayout>;
  }

  const sections = module.content?.sections || [];
  const actionSteps = module.content?.action_steps || [];
  const progress = module.progress as ModuleProgress;
  const domainKey = module.domain as keyof typeof DOMAIN_LABELS;
  const prevModule = getPrevModule();
  const nextModule = getNextModule();

  return (
    <DashboardLayout>
      <SEO
        title={`${module.title} — CrescentEd`}
        description={(module.description || module.summary || `Learn ${module.title} as part of your personalized CrescentEd entrepreneurship course.`).slice(0, 155)}
        path={`/module/${module.id}`}
        ogType="article"
      />
      <div className="max-w-4xl mx-auto animate-fade-in pb-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTutorContext({ module_id: id });
              setTutorOpen(true);
            }}
            className="border-border"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Tutor
          </Button>
        </div>

        <SampleNotice className="mb-4" />

        {/* Module Header */}
        <CosmicCard className="p-4 sm:p-6 mb-6" variant="gradient" hover={false}>
          <div className="flex items-start gap-3 sm:gap-4 mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-cosmic-magenta/20 to-cosmic-violet/20 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
              {DOMAIN_ICONS[domainKey] || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-primary mb-1">{DOMAIN_LABELS[domainKey] || module.domain}</p>
              <h1 className="font-sora text-xl sm:text-3xl font-bold mb-2 break-words leading-tight">{module.title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground break-words">{module.description || module.summary}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 progress-cosmic rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={downloadModuleSummary}>
              <Download className="w-4 h-4 mr-2" />
              Download Summary
            </Button>
          </div>
        </CosmicCard>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          <Accordion type="multiple" defaultValue={sections.map((_, i) => `section-${i}`)}>
            {sections.map((section: ModuleSection, index: number) => {
              const isComplete = progress.sectionsCompleted.includes(section.title);
              
              return (
                <AccordionItem
                  key={index}
                  value={`section-${index}`}
                  className="border-0 mb-4"
                >
                  <CosmicCard className="overflow-hidden" hover={false}>
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-3 sm:gap-4 text-left flex-1 min-w-0">
                        <Checkbox
                          checked={isComplete}
                          onCheckedChange={() => toggleSectionComplete(section.title)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Mark section "${section.title}" as ${isComplete ? 'incomplete' : 'complete'}`}
                          className="border-primary data-[state=checked]:bg-primary flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h2 className={`font-outfit font-semibold text-base break-words ${isComplete ? 'text-muted-foreground' : ''}`}>
                            {section.title}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {section.plug_and_plays?.length || 0} resources
                          </p>
                        </div>
                        {isComplete && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      {/* Content */}
                      <div className="prose prose-sm prose-invert max-w-none mb-6 sm:pl-10">
                        <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                          {section.content}
                        </div>
                      </div>

                      {/* Ask Tutor Button */}
                      <div className="sm:pl-10 mb-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setTutorContext({ module_id: id, section_title: section.title });
                            setTutorOpen(true);
                          }}
                          className="border-accent text-accent hover:bg-accent/10"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Ask tutor about this section
                        </Button>
                      </div>

                      {/* Plug & Plays */}
                      {section.plug_and_plays && section.plug_and_plays.length > 0 && (
                        <div className="sm:pl-10 space-y-3">
                          <h4 className="font-outfit font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                            Resources & Templates
                          </h4>
                          {section.plug_and_plays.map((plug: PlugAndPlay, pIndex: number) => {
                            const plugComplete = progress.plugAndPlayCompleted.includes(plug.title);
                            
                            return (
                              <div
                                key={pIndex}
                                className="bg-secondary/30 rounded-lg p-4 border border-border"
                              >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <Checkbox
                                      checked={plugComplete}
                                      onCheckedChange={() => togglePlugAndPlayComplete(plug.title)}
                                      aria-label={`Mark resource "${plug.title}" as ${plugComplete ? 'incomplete' : 'complete'}`}
                                      className="mt-1 border-primary data-[state=checked]:bg-primary flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <h5 className={`font-medium break-words ${plugComplete ? 'text-muted-foreground' : ''}`}>
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
                                    onClick={() => downloadPlugAndPlay(plug)}
                                    aria-label={`Download ${plug.title}`}
                                    className="text-muted-foreground hover:text-primary flex-shrink-0"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="pl-7 text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                  {plug.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </CosmicCard>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Action Steps */}
        {actionSteps.length > 0 && (
          <CosmicCard className="p-6 mb-8" hover={false}>
            <h3 className="font-sora text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Your Next Steps
            </h3>
            <ul className="space-y-3">
              {actionSteps.map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center flex-shrink-0 font-medium">
                    {index + 1}
                  </span>
                  <span className="text-foreground/90 pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </CosmicCard>
        )}

        {/* Module Navigation */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
          {prevModule ? (
            <Link to={`/module/${prevModule.id}`} className="min-w-0 flex-1">
              <Button variant="outline" className="gap-2 w-full justify-start">
                <ArrowLeft className="w-4 h-4 flex-shrink-0" />
                <span className="truncate min-w-0">
                  <span className="hidden sm:inline">Prev: </span>
                  {prevModule.title}
                </span>
              </Button>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          
          {nextModule ? (
            <Link to={`/module/${nextModule.id}`} className="min-w-0 flex-1">
              <GradientButton className="gap-2 w-full justify-end">
                <span className="truncate min-w-0">
                  <span className="hidden sm:inline">Next: </span>
                  {nextModule.title}
                </span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" />
              </GradientButton>
            </Link>
          ) : (
            <Link to="/dashboard" className="flex-1">
              <GradientButton className="gap-2 w-full justify-center">
                All Complete!
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              </GradientButton>
            </Link>
          )}
        </div>
      </div>

      <TutorSidebar
        open={tutorOpen}
        onClose={() => setTutorOpen(false)}
        context={tutorContext}
      />
    </DashboardLayout>
  );
};

export default ModuleView;
