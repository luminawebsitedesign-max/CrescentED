import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { GradientButton } from '@/components/ui/gradient-button';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { 
  Send, Loader2, Sparkles, User, RefreshCw, 
  FileText, Lightbulb, ClipboardList, BookOpen
} from 'lucide-react';
import { type TutorMessage, type Module, type ModuleProgress } from '@/types/crescented';
import { cn } from '@/lib/utils';

// Clean AI response from asterisks, markdown, and formatting
const cleanAIResponse = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    .trim();
};

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

      const cleanedResponse = cleanAIResponse(response.data.response || "I'm here to help! Could you tell me more about what you're working on?");
      
      const assistantMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanedResponse,
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

      const cleanedResponse = cleanAIResponse(response.data.response || '');
      
      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, content: cleanedResponse || m.content }
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

  // Quick action buttons for tutor
  const quickActions = [
    { 
      icon: BookOpen, 
      label: 'Open Template', 
      prompt: `Show me a practical template I can use for "${currentModule?.title || 'my current module'}".`
    },
    { 
      icon: FileText, 
      label: 'Show Resources', 
      prompt: `What resources and tools should I use for "${currentModule?.title || 'this topic'}"?`
    },
    { 
      icon: ClipboardList, 
      label: 'Generate Worksheet', 
      prompt: `Create a worksheet I can fill out for "${currentModule?.title || 'my current module'}" applied to my business: ${intake?.idea || 'my business'}.`
    },
    { 
      icon: Lightbulb, 
      label: 'Action Steps', 
      prompt: `What are the most important action steps for "${currentModule?.title || 'this module'}"?`
    },
  ];

  return (
    <CosmicCard className="h-full flex flex-col overflow-hidden" hover={false}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">AI Tutor</h3>
          <p className="text-xs text-muted-foreground truncate">
            {currentModule ? `Helping with: ${currentModule.title}` : 'Ready to help'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b border-border flex flex-wrap gap-1">
        {quickActions.map((action, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="sm"
            onClick={() => sendMessage(action.prompt)}
            disabled={loading}
            className="text-xs h-7 gap-1 hover:bg-primary/10 hover:text-primary"
          >
            <action.icon className="w-3 h-3" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center py-8">
            <div className="text-center max-w-xs">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">Hi! I'm your AI Tutor 👋</h3>
              <p className="text-xs text-muted-foreground">
                Ask me anything about your modules, get templates, or request personalized guidance.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                  message.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                )}>
                  {message.role === 'user' ? (
                    <User className="w-3 h-3 text-primary" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-accent" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary'
                )}>
                  <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Expand button for assistant */}
                  {message.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regenerateExpanded(message.id, message.content)}
                      disabled={loading && expandedAnswer === message.id}
                      className="mt-1 text-[10px] h-5 px-1 text-muted-foreground hover:text-primary"
                    >
                      {loading && expandedAnswer === message.id ? (
                        <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="w-2.5 h-2.5 mr-1" />
                      )}
                      Expand
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {loading && !expandedAnswer && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-accent" />
                </div>
                <div className="bg-secondary rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-[10px] h-5 text-muted-foreground"
            >
              Clear
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything..."
            className="bg-secondary/50 border-border text-sm h-9"
            disabled={loading}
          />
          <GradientButton
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="h-9 w-9 p-0"
          >
            <Send className="w-4 h-4" />
          </GradientButton>
        </div>
      </div>
    </CosmicCard>
  );
};

export default AITutorMain;
