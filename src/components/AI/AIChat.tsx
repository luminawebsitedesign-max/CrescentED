import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Component to render JSON code blocks with syntax highlighting
const JsonBlock = ({ json }: { json: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3">
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 hover:bg-primary/20"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-background/50 border border-primary/30 rounded-lg p-4 overflow-x-auto text-xs font-mono">
        <code className="text-cyan-300">{json}</code>
      </pre>
    </div>
  );
};

// Parse message content and render JSON blocks separately
const MessageContent = ({ content }: { content: string }) => {
  const parts = content.split(/(```json[\s\S]*?```)/g);

  return (
    <div className="text-sm">
      {parts.map((part, index) => {
        if (part.startsWith('```json')) {
          const jsonContent = part.replace(/```json\n?/, '').replace(/\n?```$/, '');
          return <JsonBlock key={index} json={jsonContent} />;
        }
        // Also handle generic code blocks
        if (part.startsWith('```')) {
          const codeContent = part.replace(/```\w*\n?/, '').replace(/\n?```$/, '');
          return <JsonBlock key={index} json={codeContent} />;
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </div>
  );
};

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('nexus_chat_history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: `⚡ Welcome to NEXUS — your AI Product Kickstart Generator.

I can help you build complete kickstart packages for new digital products including:

📐 **Wireframe layouts** — Screen descriptions & user flows
🎨 **Branding packages** — Colors, fonts, UI aesthetic
📋 **Business roadmaps** — MVP features, tech stack, monetization

**To get started, tell me:**
- Product name & description
- Target platforms (web, mobile, PWA)
- Aesthetic direction (e.g., "cyber-sigilism", "minimal", "retro")
- Must-have features
- Any extra notes

I'll generate a complete JSON kickstart package for you!`
      }]);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Save chat history
    if (messages.length > 1) {
      localStorage.setItem('nexus_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const clearChat = () => {
    localStorage.removeItem('nexus_chat_history');
    setMessages([{
      role: 'assistant',
      content: `⚡ Chat cleared. Ready to generate your next product kickstart package!`
    }]);
    toast.success('Chat history cleared');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get current user data for context
      const tasks = storage.getTasks();
      const habits = storage.getHabits();
      const goals = storage.getGoals();

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          tasks,
          habits,
          goals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(errorData.error || 'Rate limit exceeded');
        }
        if (response.status === 402) {
          throw new Error(errorData.error || 'AI credits exhausted');
        }
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
      
      // Remove user message if request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-orbitron">NEXUS AI</h2>
            <p className="text-sm text-muted-foreground">Product Kickstart Generator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="text-xs">
          Clear Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <Card
              className={cn(
                "p-4 max-w-[85%] transition-all",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground glow-cyan"
                  : "bg-card cyber-border"
              )}
            >
              <MessageContent content={message.content} />
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <Card className="p-4 bg-card cyber-border">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">NEXUS is generating your kickstart package...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Describe your product idea: name, description, platforms, aesthetic, features..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="resize-none cyber-border"
          rows={3}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="glow-purple"
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Powered by Lovable AI • Generate wireframes, branding & roadmaps for any product idea
      </p>
    </div>
  );
};