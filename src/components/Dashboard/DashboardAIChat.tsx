import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/store/useStore';
import { 
  Send, Loader2, Sparkles, User, 
  FileText, Lightbulb, ClipboardList, BookOpen, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  moduleId?: string;
}

// Clean AI response from asterisks and markdown
const cleanAIResponse = (text: string): string => {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    .trim();
};

const DashboardAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { modules, currentModuleId, intake } = useStore();

  const currentModule = modules.find(m => m.id === currentModuleId);

  // Load chat history for current module
  useEffect(() => {
    if (!currentModuleId) return;
    
    const storageKey = `crescented-chat-${currentModuleId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history');
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentModuleId]);

  // Save chat history when messages change
  useEffect(() => {
    if (!currentModuleId || messages.length === 0) return;
    const storageKey = `crescented-chat-${currentModuleId}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, currentModuleId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      moduleId: currentModuleId || undefined,
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

      const cleanedResponse = cleanAIResponse(
        response.data.response || "I'm here to help! Could you tell me more about what you're working on?"
      );
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date().toISOString(),
        moduleId: currentModuleId || undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, currentModule, currentModuleId, intake, messages, toast]);

  const clearHistory = () => {
    if (!currentModuleId) return;
    setMessages([]);
    localStorage.removeItem(`crescented-chat-${currentModuleId}`);
  };

  // Quick action buttons
  const quickActions = [
    { 
      icon: BookOpen, 
      label: 'Explain this module', 
      prompt: `Give me a clear, step-by-step overview of "${currentModule?.title || 'this module'}". What are the key concepts I need to understand?`
    },
    { 
      icon: FileText, 
      label: 'Show resources', 
      prompt: `What tools and resources should I use for "${currentModule?.title || 'this topic'}"? Give me specific recommendations.`
    },
    { 
      icon: ClipboardList, 
      label: 'Create worksheet', 
      prompt: `Create a hands-on worksheet I can fill out for "${currentModule?.title || 'this module'}" applied to my business: ${intake?.idea || 'my business'}.`
    },
    { 
      icon: Lightbulb, 
      label: 'Action steps', 
      prompt: `What are the 5 most important action steps I should take right now for "${currentModule?.title || 'this module'}"?`
    },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 px-4 lg:px-8" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-sora font-semibold mb-2">
                Hi! I'm your AI Tutor
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Ask me anything about {currentModule?.title || 'your modules'}. 
                I'll give you step-by-step guidance, create worksheets, and help you apply what you're learning.
              </p>
              
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => sendMessage(action.prompt)}
                    disabled={loading}
                    className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
                  >
                    <action.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-secondary rounded-bl-md'
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 p-4">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && (
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear chat
              </Button>
            </div>
          )}
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask AI Tutor anything..."
              className="flex-1 h-12 bg-background border-border text-base"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="h-12 px-6 bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Ask AI Tutor
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAIChat;