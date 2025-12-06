import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth = ({ mode }: AuthProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Account created!',
          description: 'Welcome to CrescentEd. Let\'s get started!',
        });
        navigate('/intake');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: 'Welcome back!',
          description: 'Ready to continue your entrepreneurial journey?',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background noise-texture flex items-center justify-center p-6">
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="glass-cosmic rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cosmic-magenta via-cosmic-violet to-cosmic-sapphire opacity-60 blur-sm" />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-cosmic-magenta to-cosmic-violet flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white/80" style={{ clipPath: 'inset(0 0 0 40%)' }} />
              </div>
            </div>
            <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          
          <h1 className="font-sora text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === 'login' 
              ? 'Log in to continue your entrepreneurial path' 
              : 'Create your account and begin learning'}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 glow-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
