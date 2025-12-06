import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { 
  Send, Loader2, Sparkles, User, RefreshCw, 
  BookOpen, ChevronDown, ChevronUp, FileText, Lightbulb
} from 'lucide-react';
import { type TutorMessage, type Module, type ModuleProgress, DOMAIN_LABELS, DOMAIN_ICONS } from '@/types/crescented';
import { cn } from '@/lib/utils';

const AITutorMain = () => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { modules, currentModuleId, setCurrentModuleId, intake, user } = useStore();

  const currentModule = modules.find(m => m.id === currentModuleId);

  useEffect(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem('crescented-tutor-history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history');
      }
    }
  }, []);

  useEffect(() => {
    // Save chat history
    if (messages.length > 0) {
      localStorage.setItem('crescented-tutor-history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-select first incomplete module if none selected
  useEffect(() => {
    if (!currentModuleId && modules.length > 0) {
      const firstIncomplete = modules.find(m => {
        const progress = m.progress as ModuleProgress;
        const sections = m.content?.sections || [];
        return sections.length === 0 || progress.sectionsCompleted.length < sections.length;
      });
      if (firstIncomplete) {
        setCurrentModuleId(firstIncomplete.id);
      } else {
        setCurrentModuleId(modules[0].id);
      }
    }
  }, [currentModuleId, modules, setCurrentModuleId]);

  const calculateModuleProgress = (module: Module): number => {
    const progress = module.progress as ModuleProgress;
    const sections = module.content?.sections || [];
    if (sections.length === 0) return 0;
    return (progress.sectionsCompleted.length / sections.length) * 100;
  };

  const sendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || loading) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      context: currentModule ? {
        module_id: currentModule.id,
        section_title: currentModule.title,
      } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('crescented-ai', {
        body: {
          type: 'tutor',
          message: messageText,
          context: {
            module_id: currentModule?.id,
            module_title: currentModule?.title,
            module_content: currentModule?.content,
            intake: intake,
            master_notes: localStorage.getItem('crescented-master-notes') || '',
          },
          userId: session?.user?.id,
          history: messages.slice(-10),
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || "I'm here to help! Could you tell me more about what you're working on?",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Tutor error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateExpanded = async (messageId: string, originalContent: string) => {
    setExpandedAnswer(messageId);
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('crescented-ai', {
        body: {
          type: 'tutor',
          message: `Please provide a more detailed and expanded explanation of: "${originalContent}"`,
          context: {
            module_id: currentModule?.id,
            module_title: currentModule?.title,
            module_content: currentModule?.content,
            intake: intake,
          },
          userId: session?.user?.id,
          history: [],
        },
      });

      if (response.error) throw response.error;

      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, content: response.data.response || m.content, expanded: true }
          : m
      ));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to expand answer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setExpandedAnswer(null);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('crescented-tutor-history');
  };

  const quickPrompts = [
    { label: 'Explain this module', prompt: `Explain the key concepts of "${currentModule?.title || 'this module'}" in simple terms.` },
    { label: 'Give me action steps', prompt: `What are the most important action steps I should take for "${currentModule?.title || 'this module'}"?` },
    { label: 'Generate a worksheet', prompt: `Create a practical worksheet I can use to apply the concepts from "${currentModule?.title || 'this module'}" to my business: ${intake?.idea || 'my business idea'}.` },
    { label: 'What should I focus on?', prompt: `Based on my goals (${intake?.goals || 'building a successful business'}), what should I prioritize in this module?` },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Current Module Header */}
      {currentModule && (
        <CosmicCard className="p-4 mb-4" hover={false}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {DOMAIN_ICONS[currentModule.domain as keyof typeof DOMAIN_ICONS] || '📚'}
                </span>
                <span className="text-xs font-medium text-primary uppercase tracking-wide">
                  {DOMAIN_LABELS[currentModule.domain as keyof typeof DOMAIN_LABELS] || currentModule.domain}
                </span>
              </div>
              <h2 className="text-xl font-sora font-bold">{currentModule.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {currentModule.description || currentModule.summary}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm font-medium">{Math.round(calculateModuleProgress(currentModule))}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full progress-cosmic rounded-full transition-all"
                  style={{ width: `${calculateModuleProgress(currentModule)}%` }}
                />
              </div>
            </div>
          </div>
        </CosmicCard>
      )}

      {/* Quick Action Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map((item, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => sendMessage(item.prompt)}
            disabled={loading}
            className="text-xs border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-sora font-bold mb-2">Hi there! I'm your AI Tutor 👋</h3>
              <p className="text-muted-foreground mb-6">
                I'm here to help you learn and build your business. Ask me anything about 
                {currentModule ? ` "${currentModule.title}"` : ' your modules'}, or get personalized guidance based on your goals.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <CosmicCard className="p-4 cursor-pointer" onClick={() => sendMessage("What's the most important thing I should learn first?")}>
                  <Lightbulb className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">Where should I start?</p>
                </CosmicCard>
                <CosmicCard className="p-4 cursor-pointer" onClick={() => sendMessage("Help me understand this module step by step.")}>
                  <BookOpen className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-medium">Explain step by step</p>
                </CosmicCard>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                )}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Regenerate Expanded button for assistant messages */}
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regenerateExpanded(message.id, message.content)}
                      disabled={loading && expandedAnswer === message.id}
                      className="mt-2 text-xs text-muted-foreground hover:text-primary"
                    >
                      {loading && expandedAnswer === message.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-1" />
                      )}
                      Regenerate Expanded Answer
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {loading && !expandedAnswer && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-secondary rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="pt-4 border-t border-border mt-4">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-xs text-muted-foreground"
            >
              Clear conversation
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your learning journey..."
            className="bg-secondary/50 border-border"
            disabled={loading}
          />
          <GradientButton
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default AITutorMain;
