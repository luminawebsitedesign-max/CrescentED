import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowLeft, User } from 'lucide-react';
import CrescentLogo from '@/components/ui/crescent-logo';

interface AuthProps {
  mode: 'login' | 'register';
}

const Auth = ({ mode }: AuthProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);
  const [useDifferentEmail, setUseDifferentEmail] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedEmail = localStorage.getItem('crescented-last-email');
    if (savedEmail) {
      setRememberedEmail(savedEmail);
    }
    
    // Check if user has an active session for the remembered email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && savedEmail && session.user.email === savedEmail) {
        setHasActiveSession(true);
      }
      setCheckingSession(false);
    };
    
    checkSession();
  }, []);

  const handleContinueAsRemembered = async () => {
    if (!rememberedEmail) return;
    
    setLoading(true);
    
    // Check if there's an active session for this email
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user.email === rememberedEmail) {
      // Active session exists - navigate to dashboard
      toast({
        title: 'Welcome back!',
        description: 'Continuing your entrepreneurial journey.',
      });
      navigate('/dashboard');
    } else {
      // No active session - need password to login
      setEmail(rememberedEmail);
      setUseDifferentEmail(true); // Show login form with email pre-filled
      toast({
        title: 'Session expired',
        description: 'Please enter your password to continue.',
      });
    }
    
    setLoading(false);
  };

  const handleUseDifferentEmail = () => {
    setUseDifferentEmail(true);
    setEmail('');
  };

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
        
        localStorage.setItem('crescented-last-email', email);
        
        toast({
          title: 'Account created!',
          description: 'Welcome to CrescentEd. Let\'s get started!',
        });
        navigate('/intake');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        localStorage.setItem('crescented-last-email', email);
        
        toast({
          title: 'Welcome back!',
          description: 'Ready to continue your entrepreneurial journey?',
        });
        navigate('/dashboard');
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

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show "Continue as" screen if remembered email exists and not choosing different
  const showRememberedChoice = rememberedEmail && !useDifferentEmail && mode === 'login';

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
            <CrescentLogo size="md" />
            <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          
          {showRememberedChoice ? (
            <>
              <h1 className="font-sora text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground mb-6">
                Choose how you'd like to continue
              </p>
              
              {/* Continue as remembered email */}
              <button
                onClick={handleContinueAsRemembered}
                disabled={loading}
                className="w-full p-4 mb-3 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Continue as</p>
                    <p className="font-medium truncate">{rememberedEmail}</p>
                    {hasActiveSession && (
                      <p className="text-xs text-green-500">Active session</p>
                    )}
                  </div>
                </div>
              </button>
              
              {/* Use different email */}
              <button
                onClick={handleUseDifferentEmail}
                disabled={loading}
                className="w-full p-4 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 transition-all text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Use a different email</p>
                    <p className="text-sm text-muted-foreground">Sign in with another account</p>
                  </div>
                </div>
              </button>
              
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
