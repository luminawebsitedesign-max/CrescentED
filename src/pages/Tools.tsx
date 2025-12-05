import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ArrowLeft, Sparkles, FileText, Lightbulb, 
  ListTodo, Target, BookOpen, Loader2, Download
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  placeholder: string;
}

const TOOLS: Tool[] = [
  {
    id: 'idea-refine',
    title: 'Idea Refinement',
    description: 'Refine and validate your business idea',
    icon: Lightbulb,
    action: 'generate_template',
    placeholder: 'Describe your business idea...',
  },
  {
    id: 'worksheet',
    title: 'Worksheet Generator',
    description: 'Create custom learning worksheets',
    icon: FileText,
    action: 'generate_worksheet',
    placeholder: 'What topic do you want a worksheet for?',
  },
  {
    id: 'template',
    title: 'Template Generator',
    description: 'Generate plug-and-play business templates',
    icon: Sparkles,
    action: 'generate_template',
    placeholder: 'What kind of template do you need?',
  },
  {
    id: 'tasks',
    title: 'Daily Task Generator',
    description: 'Get actionable tasks for today',
    icon: ListTodo,
    action: 'generate_worksheet',
    placeholder: 'What are you working on today?',
  },
  {
    id: 'goals',
    title: 'Goal Planner',
    description: 'Break down your goals into steps',
    icon: Target,
    action: 'generate_template',
    placeholder: 'What goal do you want to achieve?',
  },
  {
    id: 'resources',
    title: 'Resource Finder',
    description: 'Get curated resources for your topic',
    icon: BookOpen,
    action: 'generate_worksheet',
    placeholder: 'What topic do you need resources for?',
  },
];

export default function Tools() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [input, setInput] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        setTimeout(() => loadBusinessIdea(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadBusinessIdea(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadBusinessIdea = async (userId: string) => {
    const { data } = await supabase
      .from('intake_forms')
      .select('idea')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data?.idea) {
      setBusinessIdea(data.idea);
    }
  };

  const generateContent = async () => {
    if (!selectedTool || !input.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('crescented-ai', {
        body: {
          action: selectedTool.action,
          data: {
            topic: input,
            businessIdea,
            toolType: selectedTool.id,
          },
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (data?.result) {
        setResult(data.result);
        toast.success('Generated successfully!');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!result) return;

    toast.info('Generating PDF...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: {
          type: selectedTool?.action === 'generate_worksheet' ? 'worksheet' : 'template',
          title: result.title || `${selectedTool?.title} - ${input}`,
          content: result,
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (data?.pdf) {
        const byteCharacters = atob(data.pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.title || selectedTool?.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('PDF downloaded!');
      }
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Tools & Generators</h1>
          <p className="text-muted-foreground">
            AI-powered tools to help you build your business
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tools List */}
          <div className="space-y-4">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool);
                  setInput('');
                  setResult(null);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedTool?.id === tool.id
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-card/50 border-border/50 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedTool?.id === tool.id ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <tool.icon className={`w-5 h-5 ${
                      selectedTool?.id === tool.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Generator Panel */}
          <div className="lg:col-span-2">
            {selectedTool ? (
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <selectedTool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedTool.title}</h2>
                    <p className="text-sm text-muted-foreground">{selectedTool.description}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="input">Your Request</Label>
                    <Textarea
                      id="input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={selectedTool.placeholder}
                      className="min-h-[100px] bg-background/50"
                    />
                  </div>

                  <Button
                    onClick={generateContent}
                    disabled={loading || !input.trim()}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-accent"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>

                {/* Result */}
                {result && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Result</h3>
                      <Button variant="outline" size="sm" onClick={downloadAsPDF} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 rounded-xl p-5 space-y-4">
                      {result.title && (
                        <h4 className="text-lg font-semibold">{result.title}</h4>
                      )}
                      {result.description && (
                        <p className="text-muted-foreground">{result.description}</p>
                      )}
                      
                      {/* Sections */}
                      {result.sections?.map((section: any, i: number) => (
                        <div key={i} className="border-t border-border/50 pt-4">
                          <h5 className="font-medium mb-2">{section.heading}</h5>
                          {section.instructions && (
                            <p className="text-sm text-muted-foreground mb-3">{section.instructions}</p>
                          )}
                          {section.questions?.map((q: any, j: number) => (
                            <div key={j} className="mb-2">
                              <p className="text-sm">{typeof q === 'string' ? q : q.prompt}</p>
                            </div>
                          ))}
                          {section.fields?.map((f: any, j: number) => (
                            <div key={j} className="mb-2">
                              <Label className="text-sm">{f.label}</Label>
                              <p className="text-xs text-muted-foreground">{f.placeholder}</p>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Action Items */}
                      {result.action_items && (
                        <div className="border-t border-border/50 pt-4">
                          <h5 className="font-medium mb-2">Next Steps</h5>
                          <ul className="space-y-1">
                            {result.action_items.map((item: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {result.tips && (
                        <div className="border-t border-border/50 pt-4">
                          <h5 className="font-medium mb-2">Tips</h5>
                          <ul className="space-y-1">
                            {result.tips.map((tip: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-accent mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Raw content fallback */}
                      {result.raw && (
                        <pre className="text-sm whitespace-pre-wrap">{result.raw}</pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-card/30 backdrop-blur-xl rounded-2xl border border-border/30 p-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a Tool</h2>
                <p className="text-muted-foreground">
                  Choose a tool from the left to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
