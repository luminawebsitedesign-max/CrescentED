import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionDivider } from '@/components/ui/section-divider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { generatePDF } from '@/lib/pdf';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  ListChecks,
  Lightbulb,
} from 'lucide-react';
import { type Module, type ModuleSection, type ModuleProgress, type PlugAndPlay, DOMAIN_LABELS, DOMAIN_ICONS } from '@/types/crescented';
import { cn } from '@/lib/utils';

interface ModuleContentProps {
  onAskTutor?: (question: string) => void;
}

const ModuleContent = ({ onAskTutor }: ModuleContentProps) => {
  const { modules, currentModuleId, setCurrentModuleId, user } = useStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [expandedPlugAndPlays, setExpandedPlugAndPlays] = useState<string[]>([]);
  const { toast } = useToast();

  const currentModule = modules.find(m => m.id === currentModuleId);
  const currentIndex = modules.findIndex(m => m.id === currentModuleId);

  if (!currentModule) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Module Selected</h3>
          <p className="text-muted-foreground">Select a module from the sidebar to view its content.</p>
        </div>
      </div>
    );
  }

  const progress = currentModule.progress as ModuleProgress;
  const sections = currentModule.content?.sections || [];
  const actionSteps = currentModule.content?.action_steps || [];

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const togglePlugAndPlay = (title: string) => {
    setExpandedPlugAndPlays(prev => 
      prev.includes(title) 
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const markSectionComplete = async (sectionTitle: string) => {
    if (!user) return;
    
    const newCompleted = progress.sectionsCompleted.includes(sectionTitle)
      ? progress.sectionsCompleted.filter(s => s !== sectionTitle)
      : [...progress.sectionsCompleted, sectionTitle];

    const { error } = await supabase
      .from('modules')
      .update({
        progress: {
          ...progress,
          sectionsCompleted: newCompleted,
        },
      })
      .eq('id', currentModule.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    } else {
      // Update local state
      useStore.getState().setModules(
        modules.map(m => 
          m.id === currentModule.id 
            ? { ...m, progress: { ...progress, sectionsCompleted: newCompleted } }
            : m
        )
      );
    }
  };

  const handleExportPDF = () => {
    try {
      generatePDF({
        title: currentModule.title,
        type: 'summary',
        content: `
${currentModule.description || currentModule.summary}

${sections.map(s => `## ${s.title}\n${s.content}`).join('\n\n')}

## Action Steps
${actionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
        `.trim(),
      });
      toast({
        title: 'PDF Generated',
        description: 'Your module summary has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  const goToModule = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < modules.length) {
      setCurrentModuleId(modules[newIndex].id);
    }
  };

  return (
    <ScrollArea className="h-full pr-4">
      {/* Module Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">
            {DOMAIN_ICONS[currentModule.domain as keyof typeof DOMAIN_ICONS] || '📚'}
          </span>
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            {DOMAIN_LABELS[currentModule.domain as keyof typeof DOMAIN_LABELS] || currentModule.domain}
          </span>
        </div>
        <h1 className="text-2xl font-sora font-bold mb-2">{currentModule.title}</h1>
        <p className="text-muted-foreground">
          {currentModule.description || currentModule.summary}
        </p>
      </div>

      {/* Progress Bar */}
      <CosmicCard className="p-4 mb-6" hover={false}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Module Progress</span>
          <span className="text-sm text-muted-foreground">
            {progress.sectionsCompleted.length} / {sections.length} sections
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full progress-cosmic rounded-full transition-all"
            style={{ width: `${sections.length > 0 ? (progress.sectionsCompleted.length / sections.length) * 100 : 0}%` }}
          />
        </div>
      </CosmicCard>

      {/* Sections */}
      <SectionDivider label="Lessons" />
      <div className="space-y-3 mb-6">
        {sections.length === 0 ? (
          <CosmicCard className="p-6 text-center" hover={false}>
            <p className="text-muted-foreground">No content available for this module yet.</p>
          </CosmicCard>
        ) : (
          sections.map((section, idx) => {
            const isComplete = progress.sectionsCompleted.includes(section.title);
            const isExpanded = expandedSections.includes(section.title);

            return (
              <Collapsible key={idx} open={isExpanded} onOpenChange={() => toggleSection(section.title)}>
                <CosmicCard className="overflow-hidden" hover={false}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markSectionComplete(section.title);
                        }}
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                          isComplete ? 'bg-green-500/20 text-green-500' : 'bg-secondary text-muted-foreground hover:text-primary'
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-medium',
                          isComplete && 'text-muted-foreground line-through'
                        )}>
                          {section.title}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0">
                      <div className="pl-9">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                          {section.content}
                        </p>

                        {/* Plug and Plays */}
                        {section.plug_and_plays && section.plug_and_plays.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-xs font-semibold uppercase text-primary tracking-wide">Resources</p>
                            {section.plug_and_plays.map((pnp, pIdx) => (
                              <Collapsible 
                                key={pIdx} 
                                open={expandedPlugAndPlays.includes(pnp.title)}
                                onOpenChange={() => togglePlugAndPlay(pnp.title)}
                              >
                                <div className="border border-border rounded-lg overflow-hidden">
                                  <CollapsibleTrigger asChild>
                                    <button className="w-full p-3 flex items-center gap-2 text-left hover:bg-secondary/30">
                                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="text-sm font-medium flex-1">{pnp.title}</span>
                                      <span className="text-xs text-muted-foreground capitalize">{pnp.type}</span>
                                      {expandedPlugAndPlays.includes(pnp.title) ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="p-3 pt-0 border-t border-border bg-secondary/20">
                                      <p className="text-sm whitespace-pre-wrap">{pnp.content}</p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                          generatePDF({
                                            title: pnp.title,
                                            type: pnp.type as any,
                                            content: pnp.content,
                                          });
                                          toast({
                                            title: 'Downloaded',
                                            description: `${pnp.title} has been saved as PDF.`,
                                          });
                                        }}
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        Download PDF
                                      </Button>
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            ))}
                          </div>
                        )}

                        {/* Ask Tutor Button */}
                        {onAskTutor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-primary"
                            onClick={() => onAskTutor(`Explain "${section.title}" in more detail.`)}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Ask Tutor about this
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </CosmicCard>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* Action Steps */}
      {actionSteps.length > 0 && (
        <>
          <SectionDivider label="Action Steps" />
          <CosmicCard className="p-4 mb-6" hover={false}>
            <ul className="space-y-3">
              {actionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    {idx + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </li>
              ))}
            </ul>
          </CosmicCard>
        </>
      )}

      {/* Navigation & Actions */}
      <div className="flex items-center justify-between gap-4 pb-6">
        <Button
          variant="outline"
          onClick={() => goToModule('prev')}
          disabled={currentIndex === 0}
          className="border-border"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleExportPDF}
          className="border-border"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        <Button
          variant="outline"
          onClick={() => goToModule('next')}
          disabled={currentIndex === modules.length - 1}
          className="border-border"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </ScrollArea>
  );
};

export default ModuleContent;
