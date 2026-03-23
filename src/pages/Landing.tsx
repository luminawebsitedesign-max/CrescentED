import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GradientButton } from '@/components/ui/gradient-button';
import { CosmicCard } from '@/components/ui/cosmic-card';
import CrescentLogo from '@/components/ui/crescent-logo';
import { Sparkles, BookOpen, MessageCircle, FileText, ArrowRight, Star, Rocket, Users, Zap } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background noise-texture dark">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 aurora-overlay pointer-events-none" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cosmic-magenta/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cosmic-violet/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cosmic-sapphire/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '-5s' }} />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <CrescentLogo size="md" />
          <span className="font-sora text-xl font-bold text-gradient-cosmic">CrescentEd</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <GradientButton glow>
              Get Started
            </GradientButton>
          </Link>
        </div>
      </nav>

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
            title="7-Domain Framework"
            description="Master business foundations, customer success, personal growth & more"
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

      {/* Domains Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-sora text-h1 text-center mb-4">
          The 7 Domains of <span className="text-gradient-cosmic">Entrepreneurship</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          A holistic approach to building not just a business, but a sustainable entrepreneurial life
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🏗️', name: 'Business Foundations', desc: 'Ideas, planning, validation' },
            { icon: '⚙️', name: 'Running a Business', desc: 'Operations, finance, legal' },
            { icon: '🎯', name: 'Customer Success', desc: 'Marketing, sales, retention' },
            { icon: '🌱', name: 'Personal Development', desc: 'Mindset, skills, growth' },
            { icon: '⏰', name: 'Daily Life Optimization', desc: 'Productivity, balance, habits' },
            { icon: '💭', name: 'Philosophy & Worldview', desc: 'Purpose, values, ethics' },
            { icon: '✨', name: 'Other Topics', desc: 'Specialized knowledge' },
          ].map((domain) => (
            <CosmicCard key={domain.name} className="p-5">
              <span className="text-2xl mb-3 block">{domain.icon}</span>
              <h3 className="font-outfit font-medium text-foreground mb-1">{domain.name}</h3>
              <p className="text-sm text-muted-foreground">{domain.desc}</p>
            </CosmicCard>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-gradient-cosmic mb-2">7</p>
            <p className="text-muted-foreground">Learning Domains</p>
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CrescentLogo size="sm" />
            <span className="font-sora font-bold text-gradient-cosmic">CrescentEd</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 CrescentEd. Empowering young entrepreneurs worldwide.
          </p>
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
