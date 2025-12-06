import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { X, Send, Loader2, Sparkles, User } from 'lucide-react';
import { type TutorMessage } from '@/types/crescented';

interface TutorSidebarProps {
  open: boolean;
  onClose: () => void;
  context?: {
    module_id?: string;
    section_title?: string;
  };
}

const TutorSidebar = ({ open, onClose, context }: TutorSidebarProps) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load chat history from localStorage
    const saved = localStorage.getItem('crescented-tutor-history');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save chat history
    localStorage.setItem('crescented-tutor-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      context,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get current user ID for context
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const response = await supabase.functions.invoke('crescented-ai', {
        body: {
          type: 'tutor',
          message: input,
          context,
          userId,
          history: messages.slice(-10), // Last 10 messages for context
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('crescented-tutor-history');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass-cosmic border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-outfit font-semibold">AI Tutor</h3>
            <p className="text-xs text-muted-foreground">Your learning companion</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Context Badge */}
      {context?.section_title && (
        <div className="px-4 py-2 bg-primary/10 border-b border-border">
          <p className="text-xs text-primary">
            Discussing: {context.section_title}
          </p>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="font-outfit font-semibold mb-2">Hey there! 👋</h4>
            <p className="text-sm text-muted-foreground">
              I'm your AI tutor. Ask me anything about entrepreneurship, 
              your modules, or get help with your business idea!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ? 'bg-primary/20' : 'bg-accent/20'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="mb-2 text-xs text-muted-foreground w-full"
          >
            Clear conversation
          </Button>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything..."
            className="bg-secondary/50 border-border"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorSidebar;
