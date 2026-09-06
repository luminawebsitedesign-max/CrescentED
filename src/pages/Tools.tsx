import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { getSession, getIntake, askTutor } from '@/lib/api';
import SampleNotice from '@/components/SampleNotice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { SectionDivider } from '@/components/ui/section-divider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generatePDF, generateChecklistPDF } from '@/lib/pdf';
import {
  Loader2, Lightbulb, Palette, FileText, CheckSquare,
  Download, Sparkles, ClipboardList, TrendingUp, Rocket,
  FolderDown, Eye
} from 'lucide-react';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'ai' | 'pdf' | 'template';
  placeholder?: string;
}

const TOOLS: Tool[] = [
  { id: 'refine', title: 'Business Idea Refiner', icon: Lightbulb, description: 'Sharpen and validate your business concept with AI feedback', category: 'ai', placeholder: 'Describe your business idea in detail...' },
  { id: 'branding', title: 'Branding Starter Kit', icon: Palette, description: 'Generate brand name, tagline, colors, and voice guidelines', category: 'ai', placeholder: 'What is your business about? Who is your target audience?' },
  { id: 'plan', title: 'One-Page Business Plan', icon: FileText, description: 'Create a focused, actionable business plan', category: 'ai', placeholder: 'Describe your business, target market, and goals...' },
  { id: 'marketing', title: 'Marketing Checklist', icon: CheckSquare, description: 'Get a comprehensive launch marketing checklist', category: 'ai', placeholder: 'What product/service are you launching?' },
  { id: 'worksheet', title: 'Custom Worksheet', icon: ClipboardList, description: 'Generate any worksheet or exercise', category: 'ai', placeholder: 'What topic do you need a worksheet for?' },
  { id: 'tasks', title: 'Daily Task Generator', icon: TrendingUp, description: 'Get actionable tasks you can complete today', category: 'ai', placeholder: 'What are you working on? What are your goals for today?' },
];

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [businessIdea, setBusinessIdea] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadIdea = async () => {
      const session = await getSession();
      if (session) {
        const intake = await getIntake(session.user.id);
        if (intake?.idea) setBusinessIdea(intake.idea);
      }
    };
    loadIdea();
  }, []);

  const getPromptForTool = (toolId: string, userInput: string): string => {
    const context = userInput || businessIdea;
    const prompts: Record<string, string> = {
      refine: `You are a startup advisor. Analyze and refine this business idea. Provide:
1. IMPROVED VALUE PROPOSITION - Make it clearer and more compelling
2. TARGET AUDIENCE - Define the ideal customer profile
3. KEY DIFFERENTIATORS - What makes this unique
4. POTENTIAL CHALLENGES - Top 3 obstacles and how to overcome them
5. IMMEDIATE NEXT STEPS - 5 actionable tasks to validate this idea

Business idea: ${context}`,
      branding: `You are a brand strategist. Create a comprehensive branding starter kit for this business:
1. BRAND NAME OPTIONS - 5 unique, memorable name suggestions with explanations
2. TAGLINE OPTIONS - 5 punchy taglines that capture the essence
3. BRAND VOICE - Tone, personality, do's and don'ts
4. COLOR PALETTE - Primary, secondary, accent colors with hex codes
5. BRAND VALUES - 5 core values that define the brand
6. VISUAL STYLE DIRECTION - Modern/classic, playful/serious, etc.

Business: ${context}`,
      plan: `You are a business strategist. Create a concise one-page business plan:
EXECUTIVE SUMMARY (2-3 sentences)
THE PROBLEM - What pain point are you solving?
THE SOLUTION - How does your product/service solve it?
TARGET MARKET - Who are your customers? Market size?
REVENUE MODEL - How will you make money?
COMPETITIVE ADVANTAGE - Why will you win?
KEY MILESTONES - Next 6 months roadmap
TEAM NEEDS - Key roles to hire
FUNDING NEEDS - If applicable

Business: ${context}`,
      marketing: `You are a marketing strategist. Create a comprehensive marketing launch checklist:
PRE-LAUNCH (2 weeks before):
- List 10 specific tasks with details
LAUNCH DAY:
- List 10 specific tasks with details
POST-LAUNCH (first week):
- List 10 specific tasks with details
ONGOING MARKETING:
- List 5 recurring activities

For: ${context}`,
      worksheet: `Create a detailed, actionable worksheet about: ${context}

Include:
1. LEARNING OBJECTIVES - What will they learn/achieve
2. WARM-UP QUESTIONS - 3 reflection questions
3. MAIN EXERCISES - 5 practical exercises with clear instructions
4. ACTION ITEMS - 5 concrete next steps
5. REFLECTION PROMPTS - 3 questions to consolidate learning`,
      tasks: `You are a productivity coach. Generate 7 specific, actionable tasks I can complete TODAY to make progress on: ${context}

For each task provide:
- Clear, specific task description
- Time estimate (15min, 30min, 1hr, etc.)
- Why it matters
- How to do it (brief instructions)

Make tasks realistic, achievable, and high-impact.`,
    };
    return prompts[toolId] || `Generate helpful content about: ${context}`;
  };

  const generateContent = async () => {
    if (!selectedTool) return;
    setLoading(true);
    setResult('');

    try {
      const prompt = getPromptForTool(selectedTool.id, input);
      
      const { response, sample } = await askTutor({ message: prompt, history: [] });

      setResult(response);

      toast({
        title: sample ? 'Sample output ready' : 'Generated successfully!',
        description: sample
          ? 'This is bundled sample content — demo mode.'
          : 'Your content is ready to download.',
      });
    } catch (error: any) {
      toast({ 
        title: 'Generation failed', 
        description: error.message || 'Please try again', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!selectedTool || !result) return;
    
    const typeMap: Record<string, 'worksheet' | 'template' | 'checklist' | 'summary'> = {
      refine: 'summary',
      branding: 'template',
      plan: 'template',
      marketing: 'checklist',
      worksheet: 'worksheet',
      tasks: 'checklist',
    };
    
    generatePDF({ 
      title: selectedTool.title, 
      subtitle: input || businessIdea,
      content: result, 
      type: typeMap[selectedTool.id] || 'template' 
    });
    
    toast({ title: 'Downloaded!', description: 'PDF saved to your device' });
  };

  return (
    <DashboardLayout>
      <SEO
        title="Business Tools — CrescentEd"
        description="AI-powered worksheet and template generators to accelerate your startup journey."
        path="/tools"
      />
      <div className="max-w-6xl mx-auto animate-fade-in pb-8">
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Business Tools</h1>
          <p className="text-muted-foreground">
            AI-powered tools and templates to accelerate your startup journey
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tools List */}
          <div className="space-y-3">
            <h2 className="font-outfit font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
              AI Generators
            </h2>
            {TOOLS.map((tool) => (
              <CosmicCard
                key={tool.id}
                className={`p-4 flex items-center gap-3 transition-all ${
                  selectedTool?.id === tool.id 
                    ? 'border-primary glow-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => { 
                  setSelectedTool(tool); 
                  setResult(''); 
                  setInput('');
                }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  selectedTool?.id === tool.id 
                    ? 'bg-primary/20' 
                    : 'bg-secondary'
                }`}>
                  <tool.icon className={`w-5 h-5 ${
                    selectedTool?.id === tool.id 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-outfit font-medium text-sm leading-snug" title={tool.title}>{tool.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{tool.description}</p>
                </div>
              </CosmicCard>
            ))}

            <SectionDivider label="Quick Downloads" className="pt-4" />
            
            <CosmicCard className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/pdfs')}>
              <div className="w-10 h-10 rounded-lg bg-cosmic-violet/10 flex items-center justify-center">
                <FolderDown className="w-5 h-5 text-cosmic-violet" />
              </div>
              <div>
                <h3 className="font-outfit font-medium text-sm">Download Center</h3>
                <p className="text-xs text-muted-foreground">View all your generated PDFs</p>
              </div>
            </CosmicCard>
          </div>

          {/* Generator Panel */}
          <div className="lg:col-span-2">
            {selectedTool ? (
              <CosmicCard className="p-4 sm:p-6" hover={false}>
                {/* Tool Header */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-cosmic-magenta/20 to-cosmic-violet/20 flex items-center justify-center flex-shrink-0">
                    <selectedTool.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-outfit font-semibold text-lg sm:text-xl break-words">{selectedTool.title}</h2>
                    <p className="text-sm text-muted-foreground break-words">{selectedTool.description}</p>
                  </div>
                </div>

                {/* Input Area */}
                <div className="mb-6">
                  <Label htmlFor="tool-input" className="sr-only">
                    Input for {selectedTool.title}
                  </Label>
                  <Textarea
                    id="tool-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedTool.placeholder || 'Describe what you need...'}
                    className="min-h-[120px] bg-background/50 border-border resize-none"
                  />
                  {businessIdea && !input && (
                    <p className="text-xs text-muted-foreground mt-2 break-words">
                      Using your business idea: "{businessIdea.slice(0, 50)}..."
                    </p>
                  )}
                </div>

                {/* Generate Button */}
                <GradientButton 
                  onClick={generateContent} 
                  disabled={loading} 
                  className="w-full mb-6"
                  glow={!loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </GradientButton>

                {/* Results */}
                {result && (
                  <div className="space-y-4 animate-fade-in">
                    <SampleNotice />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-outfit font-semibold">Generated Content</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPreviewOpen(true)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={downloadPDF}
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-5 bg-secondary/30 rounded-xl border border-border max-h-[400px] overflow-y-auto scrollbar-cosmic">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed break-words">
                          {result}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CosmicCard>
            ) : (
              <CosmicCard className="p-12 text-center" hover={false}>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cosmic-magenta/10 to-cosmic-violet/10 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-outfit font-semibold text-xl mb-2">Select a Tool</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Choose a tool from the left panel to generate AI-powered content for your business
                </p>
              </CosmicCard>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTool?.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm prose-invert max-w-none py-4">
              <div className="whitespace-pre-wrap">{result}</div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <GradientButton onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </GradientButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Tools;
