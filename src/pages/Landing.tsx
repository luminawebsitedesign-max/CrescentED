import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import CrescentLogo from '@/components/ui/crescent-logo';
import SEO from '@/components/SEO';
import { Sparkles, BookOpen, MessageCircle, FileText, ArrowRight, Star, Rocket, Users, Zap, FlaskConical, CheckCircle2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background noise-texture dark overflow-x-hidden">
      <SEO
        title="CrescentEd — AI Learning for Young Entrepreneurs"
        description="Build a real business with a personalized AI curriculum, on-demand tutor, and ready-to-use templates. Free to start."
        path="/"
      />
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-magenta/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cosmic-violet/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cosmic-sapphire/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-5s' }} />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <CrescentLogo size="md" />
          <span className="font-sora text-lg sm:text-xl font-bold text-gradient-cosmic truncate">CrescentEd</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-foreground hover:text-primary px-2 sm:px-4">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <GradientButton glow className="text-sm px-3 sm:px-5">
              Get Started
            </GradientButton>
          </Link>
        </div>
      </nav>

      <main>
      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-in mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-cosmic text-sm text-muted-foreground border border-cosmic-magenta/20">
            <Sparkles className="w-4 h-4 text-cosmic-magenta" />
            AI-Powered Entrepreneurship Education
          </span>
        </div>
        
        <h1 className="font-sora text-display mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Learn to Build a
          <span className="text-gradient-cosmic block mt-2">Real Business</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          CrescentEd is an AI-powered platform that teaches young entrepreneurs how to 
          start, run, and grow a business — with personalized lessons, templates, and mentorship.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/register">
            <GradientButton size="lg" glow className="text-lg px-8 py-6 h-auto">
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </GradientButton>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-border hover:bg-secondary">
              I Have an Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Preview Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-3 gap-6">
          <CosmicCard className="p-8 text-center" variant="gradient">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-magenta/20 to-cosmic-violet/20 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-cosmic-magenta" />
            </div>
            <h3 className="font-sora text-xl font-semibold mb-3">Personalized Curriculum</h3>
            <p className="text-muted-foreground">
              Tell us about your goals and business idea — our AI builds a custom course tailored to you
            </p>
          </CosmicCard>
          
          <CosmicCard className="p-8 text-center" variant="gradient">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-violet/20 to-cosmic-sapphire/20 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-cosmic-violet" />
            </div>
            <h3 className="font-sora text-xl font-semibold mb-3">AI Tutor On-Demand</h3>
            <p className="text-muted-foreground">
              Ask questions anytime and get clear, encouraging guidance from your personal AI mentor
            </p>
          </CosmicCard>
          
          <CosmicCard className="p-8 text-center" variant="gradient">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-sapphire/20 to-cosmic-rose/20 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-cosmic-sapphire" />
            </div>
            <h3 className="font-sora text-xl font-semibold mb-3">Ready-to-Use Templates</h3>
            <p className="text-muted-foreground">
              Download worksheets, business plans, checklists, and templates as professional PDFs
            </p>
          </CosmicCard>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-sora text-h1 text-center mb-4">
          Everything You Need to <span className="text-gradient-cosmic">Succeed</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          A complete toolkit designed specifically for young entrepreneurs building their first ventures
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Personalized Learning"
            description="AI analyzes your goals and creates a custom curriculum just for you"
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Guided Module System"
            description="Work through personalized modules covering business foundations, customer success, personal growth & more"
          />
          <FeatureCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="AI Tutor"
            description="Get instant answers from your supportive big-sibling style AI mentor"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Ready Templates"
            description="Download worksheets, checklists, and business templates as PDFs"
          />
        </div>
      </section>


      {/* Social Proof */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-gradient-cosmic mb-2">5</p>
            <p className="text-muted-foreground">Guided Modules</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gradient-cosmic mb-2">AI‑Powered</p>
            <p className="text-muted-foreground">Personalized Curriculum</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gradient-cosmic mb-2">100%</p>
            <p className="text-muted-foreground">Tailored to You</p>
          </div>
        </div>
      </section>

      {/* Beta + Roadmap Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <CosmicCard className="p-8 md:p-10" hover={false}>
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-cosmic text-xs font-medium text-cosmic-magenta border border-cosmic-magenta/30 mb-4">
              <FlaskConical className="w-3.5 h-3.5" />
              Beta Version
            </span>
            <h2 className="font-sora text-2xl md:text-3xl font-semibold mb-3">
              What's live now, and what's coming next
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              CrescentEd is currently a working beta. The current version already includes personalized onboarding, AI-generated modules, an AI entrepreneurship mentor, practical tools, and PDFs. Future updates will focus on making the platform more personalized, more useful, and more collaborative.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-10 mb-8">
            <div>
              <h3 className="font-outfit text-sm uppercase tracking-wider text-muted-foreground/70 mb-4">
                What's in the Beta
              </h3>
              <ul className="space-y-3">
                {[
                  'Personalized onboarding and course generation',
                  '5 guided entrepreneurship modules',
                  'AI mentor support inside lessons',
                  'Practical business tools and downloadable PDFs',
                  'Dashboard, account flow, and progress-based learning structure',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cosmic-magenta flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-outfit text-sm uppercase tracking-wider text-muted-foreground/70 mb-4">
                What's planned for V1 and later updates
              </h3>
              <ul className="space-y-3">
                {[
                  'More complete onboarding with better business-context questions',
                  'Stronger AI personalization using onboarding answers, master notes, and user context',
                  'File uploads so users can give the AI more relevant business information',
                  'Better tools and higher-quality outputs',
                  'More step-by-step support across the product',
                  'Lightweight in-app feedback collection',
                  'Later: collaboration, community, gamification, better source transparency, stronger automation, and more advanced product polish',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-cosmic-magenta/50 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            If you have feedback while using CrescentEd, email <a href="mailto:Luminawebsitedesign@gmail.com" className="text-primary hover:underline">Luminawebsitedesign@gmail.com</a>
          </p>
        </CosmicCard>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <CosmicCard className="p-12 text-center" variant="glow" hover={false}>
          <CrescentLogo size="xl" className="mx-auto mb-8" glow />
          <h2 className="font-sora text-h1 mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Start learning the skills that turn ideas into real ventures — at your own pace, completely free.
          </p>
          <Link to="/register">
            <GradientButton size="lg" glow className="text-lg px-10">
              Create Your Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </GradientButton>
          </Link>
        </CosmicCard>
      </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CrescentLogo size="sm" />
            <span className="font-sora font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>© 2026 CrescentEd. Empowering young entrepreneurs worldwide.</p>
            <p className="mt-1">Powered by <a href="https://luminaweb.co" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lumina</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <CosmicCard className="p-6 group">
    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:glow-primary transition-all">
      {icon}
    </div>
    <h3 className="font-outfit font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </CosmicCard>
);

export default Landing;
